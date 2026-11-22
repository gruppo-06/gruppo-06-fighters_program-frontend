/**
 * Conversione del replay di una partita del backend nella forma usata dalle
 * schermate di Partita (matchmaking, battaglia, risultato).
 *
 * Il backend registra i round dal punto di vista di ONE (challenger) e TWO
 * (opponent); `me` è il lato del giocatore corrente, scelto dal nickname.
 */
import { modifiedStats } from '../app/routes/mazzi/deckRules.js';
import { cardImageUrl, toFighter } from './cards.js';

/** Punti vita iniziali del backend. */
const STARTING_HEALTH = 500;

const MODE_LABELS = {
  BASE: 'Partita base',
  ADVANCED: 'Partita avanzata',
};

const OTHER_SIDE = { ONE: 'TWO', TWO: 'ONE' };
const KNOCKOUT_OUTCOMES = {
  ONE: 'FIRST_KNOCKED_OUT',
  TWO: 'SECOND_KNOCKED_OUT',
};

/**
 * Trova la carta del mazzo corrispondente a un fighter del replay.
 * La posizione nel mazzo distingue le copie con lo stesso codice.
 */
function findSnapshot(deck, fighter) {
  const byPosition = deck?.[fighter?.deckPosition];
  if (byPosition && byPosition.code === fighter.cardCode) return byPosition;
  return deck?.find((snapshot) => snapshot.code === fighter?.cardCode) ?? null;
}

/** Snapshot del mazzo → fighter per FighterCard. */
/** Le partite giocate prima della modalità avanzata non hanno VEL e CRT nello snapshot. */
const MISSING_STAT = '–';

function toReplayFighter(snapshot) {
  const fighter = toFighter(snapshot);
  return {
    ...fighter,
    image: cardImageUrl(snapshot.code),
    stats: {
      ...fighter.stats,
      vel: fighter.stats.vel ?? MISSING_STAT,
      crt: fighter.stats.crt ?? MISSING_STAT,
    },
    subcardNames: snapshot.subcardNames ?? [],
  };
}

/**
 * Snapshot con le sottocarte della modalità avanzata applicate: statistiche modificate
 * e nomi delle sottocarte. Un codice non presente nel catalogo resta visibile come codice.
 */
function applySubcards(snapshot, catalog) {
  const codes = snapshot.subcards ?? [];
  const found = codes.map((code) => catalog.find((subcard) => subcard.code === code));
  return {
    ...modifiedStats(snapshot, found.filter(Boolean)),
    subcardNames: codes.map((code, i) => found[i]?.name ?? code),
  };
}

/**
 * Fighter di un round, con i danni subiti, l'eventuale KO e, nelle partite
 * avanzate, primo colpo, schivata e colpo critico di questo fighter.
 */
function toCombatant(deck, fighter, damage, ko) {
  const snapshot = findSnapshot(deck, fighter);
  if (!snapshot) {
    throw new Error(`Carta ${fighter.cardCode} non trovata nel mazzo del replay.`);
  }
  return {
    fighter: toReplayFighter(snapshot),
    damage,
    ko,
    first: Boolean(fighter.struckFirst),
    dodged: Boolean(fighter.dodged),
    critical: Boolean(fighter.criticalHit),
  };
}

/** Mazzo del replay pronto per la battaglia: nelle partite base le sottocarte non contano. */
function prepareDeck(deck, mode, catalog) {
  if (mode !== 'ADVANCED') return deck;
  return (deck ?? []).map((snapshot) => applySubcards(snapshot, catalog));
}

/** Carte ancora nel mazzo dopo quella schierata. */
function remainingCards(deck, fighter) {
  return Math.max(0, (deck?.length ?? 0) - (fighter?.deckPosition ?? 0) - 1);
}

/**
 * Converte il replay in un oggetto partita per i componenti di Partita.
 *
 * @param {object} replay risposta di GET /matches/{id}
 * @param {string} myNickname nickname del giocatore corrente
 * @param {{ code, name, atk, def, vel, crt }[]} [subcardCatalog] sottocarte di GET /subcards,
 *        usate per le statistiche nelle partite avanzate
 */
export function toBattle(replay, myNickname, subcardCatalog = []) {
  const { log } = replay;
  if (replay.status !== 'FINISHED' || !log?.turns?.length || !log.summary) {
    throw new Error('La partita non è ancora disponibile per il replay.');
  }

  const summary = log.summary;
  const mode = replay.mode ?? log.mode;
  const decks = {
    ONE: prepareDeck(replay.challengerDeck, mode, subcardCatalog),
    TWO: prepareDeck(replay.opponentDeck, mode, subcardCatalog),
  };
  // Se il nickname non corrisponde a nessuno dei due, mostra il challenger come "me".
  const me =
    replay.challengerNickname === myNickname
      ? 'ONE'
      : replay.opponentNickname === myNickname
        ? 'TWO'
        : 'ONE';
  const opponent = OTHER_SIDE[me];
  const meNickname = me === 'ONE' ? replay.challengerNickname : replay.opponentNickname;
  const opponentNickname = me === 'ONE' ? replay.opponentNickname : replay.challengerNickname;
  const meDeck = decks[me];
  const opponentDeck = decks[opponent];
  const defeated = { me: 0, opponent: 0 };

  const events = log.turns.map((turn) => {
    const fighterOne = turn.fighterOne;
    const fighterTwo = turn.fighterTwo;
    const meFighter = me === 'ONE' ? fighterOne : fighterTwo;
    const opponentFighter = me === 'ONE' ? fighterTwo : fighterOne;
    const meKnockedOut =
      turn.outcome === 'DOUBLE_KNOCKOUT' || turn.outcome === KNOCKOUT_OUTCOMES[me];
    const opponentKnockedOut =
      turn.outcome === 'DOUBLE_KNOCKOUT' || turn.outcome === KNOCKOUT_OUTCOMES[opponent];

    if (meKnockedOut) defeated.me += 1;
    if (opponentKnockedOut) defeated.opponent += 1;

    return {
      turn: turn.turnNumber,
      round: turn.roundNumber,
      me: toCombatant(meDeck, meFighter, opponentFighter.damageDealt, meKnockedOut),
      opponent: toCombatant(
        opponentDeck,
        opponentFighter,
        meFighter.damageDealt,
        opponentKnockedOut,
      ),
      log: turn.narration,
      state: {
        hp: {
          me: me === 'ONE' ? turn.healthOneAfter : turn.healthTwoAfter,
          opponent: me === 'ONE' ? turn.healthTwoAfter : turn.healthOneAfter,
        },
        deck: {
          me: remainingCards(meDeck, meFighter),
          opponent: remainingCards(opponentDeck, opponentFighter),
        },
        defeated: { ...defeated },
      },
    };
  });

  const cards = summary.cards.map((card) => {
    const snapshot = findSnapshot(card.player === 'ONE' ? decks.ONE : decks.TWO, card);
    if (!snapshot) {
      throw new Error(`Carta ${card.cardCode} non trovata nel mazzo del replay.`);
    }
    return {
      ...card,
      side: card.player === me ? 'me' : 'opponent',
      fighter: toReplayFighter(snapshot),
    };
  });

  return {
    id: replay.id,
    mode: MODE_LABELS[mode] ?? mode,
    advanced: mode === 'ADVANCED',
    maxTurns: summary.totalTurns,
    startingHp: STARTING_HEALTH,
    players: {
      me: { username: meNickname, deck: meDeck },
      opponent: { username: opponentNickname, deck: opponentDeck },
    },
    events,
    result: {
      winner:
        replay.winnerNickname === meNickname
          ? 'me'
          : replay.winnerNickname === opponentNickname
            ? 'opponent'
            : null,
      outcome: summary.outcome,
      endReason: summary.endReason,
      totalTurns: summary.totalTurns,
      cards,
    },
  };
}
