/**
 * Conversione del replay di una partita del backend nella forma usata dalle
 * schermate di Partita (matchmaking, battaglia, risultato).
 *
 * Il backend registra i round dal punto di vista di ONE (challenger) e TWO
 * (opponent); `me` è il lato del giocatore corrente, scelto dal nickname.
 */
import { cardImageUrl, toFighter } from './cards.js';

/** Punti vita iniziali del backend. */
const STARTING_HEALTH = 500;

const MODE_LABELS = {
  BASE: 'Partita base',
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
function toReplayFighter(snapshot) {
  const fighter = toFighter(snapshot);
  return {
    ...fighter,
    image: cardImageUrl(snapshot.code),
    stats: { ...fighter.stats, vel: fighter.stats.vel ?? '–', crt: fighter.stats.crt ?? '–' },
  };
}

/** Fighter di un round, con i danni subiti e l'eventuale KO. */
function toCombatant(deck, fighter, damage, ko) {
  const snapshot = findSnapshot(deck, fighter);
  if (!snapshot) {
    throw new Error(`Carta ${fighter.cardCode} non trovata nel mazzo del replay.`);
  }
  return { fighter: toReplayFighter(snapshot), damage, ko };
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
 */
export function toBattle(replay, myNickname) {
  const { log } = replay;
  if (replay.status !== 'FINISHED' || !log?.turns?.length || !log.summary) {
    throw new Error('La partita non è ancora disponibile per il replay.');
  }

  const summary = log.summary;
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
  const meDeck = me === 'ONE' ? replay.challengerDeck : replay.opponentDeck;
  const opponentDeck = me === 'ONE' ? replay.opponentDeck : replay.challengerDeck;
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
    const deck = card.player === 'ONE' ? replay.challengerDeck : replay.opponentDeck;
    const snapshot = findSnapshot(deck, card);
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
    mode: MODE_LABELS[log.mode] ?? log.mode,
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
