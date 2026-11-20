/**
 * Dati FINTI di una partita, per sviluppare le schermate di gioco senza backend.
 *
 * La partita è "simulata dal server": il client riceve l'elenco completo
 * degli eventi (un evento per round) e si limita a riprodurli come un replay.
 * Quando il backend esisterà, `mockMatch` andrà sostituito con la risposta
 * dell'API (es. api.post('/matches') o un websocket) con la stessa forma.
 */

/** Fighter usati nella partita, indicizzati per id. */
export const mockFighters = {
  // Mazzo "Fuoco Rapido" (@tu): veloci, attacco alto, difesa bassa
  f003: fighter('003', 'Assassino', 'Oriente', 'Aria', { atk: 6, def: 3, vel: 9, crt: 5 }),
  f007: fighter(
    '007',
    'Duellante',
    'Oriente',
    'Fuoco',
    { atk: 7, def: 4, vel: 7, crt: 4 },
    'rara',
    1,
  ),
  f011: fighter('011', 'Ronin', 'Oriente', 'Fuoco', { atk: 8, def: 3, vel: 6, crt: 3 }),
  f015: fighter('015', 'Esploratrice', 'Sud', 'Aria', { atk: 5, def: 4, vel: 8, crt: 6 }),
  f019: fighter(
    '019',
    'Campionessa',
    'Oriente',
    'Fuoco',
    { atk: 9, def: 5, vel: 7, crt: 6 },
    'epica',
    2,
  ),

  // Mazzo "Muro di Pietra" (@giocatore42): lenti, difesa alta
  f021: fighter('021', 'Sentinella', 'Europa', 'Acqua', { atk: 4, def: 6, vel: 4, crt: 3 }),
  f024: fighter(
    '024',
    'Guardiano',
    'Europa',
    'Terra',
    { atk: 3, def: 8, vel: 3, crt: 2 },
    'rara',
    1,
  ),
  f028: fighter('028', 'Lottatore', 'Nord', 'Terra', { atk: 6, def: 6, vel: 4, crt: 3 }),
  f032: fighter('032', 'Cavaliere', 'Europa', 'Acqua', { atk: 5, def: 7, vel: 3, crt: 4 }),
  f036: fighter('036', 'Titano', 'Nord', 'Terra', { atk: 8, def: 9, vel: 2, crt: 2 }, 'epica', 2),
};

/**
 * Copione della partita: un passo per round.
 * - meHit / oppHit: danni subiti dal fighter di quel lato ed eventuale esito
 *   ('schivata' | 'critico'), mostrato come etichetta sopra la carta
 * - ko: lato il cui fighter viene sconfitto ('me' | 'opponent'), pv: PV persi
 */
const script = [
  {
    turn: 1,
    round: 1,
    me: 'f003',
    opp: 'f021',
    meHit: { damage: 2 },
    oppHit: { damage: 7, outcome: 'critico' },
    ko: 'opponent',
    pv: 3,
  },
  {
    turn: 1,
    round: 2,
    me: 'f011',
    opp: 'f024',
    meHit: { damage: 6 },
    oppHit: { damage: 3 },
    ko: 'me',
    pv: 2,
  },
  {
    turn: 2,
    round: 1,
    me: 'f007',
    opp: 'f028',
    meHit: { damage: 0, outcome: 'schivata' },
    oppHit: { damage: 6 },
    ko: 'opponent',
    pv: 2,
  },
  {
    turn: 3,
    round: 1,
    me: 'f015',
    opp: 'f036',
    meHit: { damage: 9, outcome: 'critico' },
    oppHit: { damage: 2 },
    ko: 'me',
    pv: 3,
  },
  {
    turn: 3,
    round: 2,
    me: 'f019',
    opp: 'f032',
    meHit: { damage: 3 },
    oppHit: { damage: 8 },
    ko: 'opponent',
    pv: 2,
  },
  {
    turn: 4,
    round: 1,
    me: 'f011',
    opp: 'f024',
    meHit: { damage: 5 },
    oppHit: { damage: 2 },
    ko: 'me',
    pv: 1,
  },
  {
    turn: 4,
    round: 2,
    me: 'f003',
    opp: 'f021',
    meHit: { damage: 0, outcome: 'schivata' },
    oppHit: { damage: 8, outcome: 'critico' },
    ko: 'opponent',
    pv: 2,
  },
  {
    turn: 5,
    round: 1,
    me: 'f007',
    opp: 'f028',
    meHit: { damage: 2 },
    oppHit: { damage: 7 },
    ko: 'opponent',
    pv: 2,
  },
  {
    turn: 6,
    round: 1,
    me: 'f015',
    opp: 'f036',
    meHit: { damage: 8 },
    oppHit: { damage: 0, outcome: 'schivata' },
    ko: 'me',
    pv: 3,
  },
  {
    turn: 7,
    round: 1,
    me: 'f019',
    opp: 'f032',
    meHit: { damage: 1 },
    oppHit: { damage: 10, outcome: 'critico' },
    ko: 'opponent',
    pv: 3,
  },
  {
    turn: 8,
    round: 1,
    me: 'f011',
    opp: 'f036',
    meHit: { damage: 7 },
    oppHit: { damage: 3 },
    ko: 'me',
    pv: 2,
  },
  {
    turn: 9,
    round: 1,
    me: 'f003',
    opp: 'f024',
    meHit: { damage: 0, outcome: 'schivata' },
    oppHit: { damage: 6 },
    ko: 'opponent',
    pv: 2,
  },
  {
    turn: 10,
    round: 1,
    me: 'f007',
    opp: 'f028',
    meHit: { damage: 3 },
    oppHit: { damage: 4 },
    ko: null,
    pv: 0,
  },
  {
    turn: 11,
    round: 1,
    me: 'f015',
    opp: 'f036',
    meHit: { damage: 6 },
    oppHit: { damage: 2 },
    ko: 'me',
    pv: 2,
  },
  {
    turn: 12,
    round: 1,
    me: 'f019',
    opp: 'f021',
    meHit: { damage: 0, outcome: 'schivata' },
    oppHit: { damage: 11, outcome: 'critico' },
    ko: 'opponent',
    pv: 4,
  },
];

const players = {
  me: {
    username: 'tu',
    level: 7,
    avatar: null,
    deckName: 'Fuoco Rapido',
    wins: 42,
    winRate: 64,
  },
  opponent: {
    username: 'giocatore42',
    level: 9,
    avatar: null,
    deckName: 'Muro di Pietra',
    wins: 58,
    winRate: 61,
  },
};

const STARTING_HP = 20;
const STARTING_DECK = 16;

export const mockMatch = {
  id: 'mock-1',
  mode: 'Partita rapida',
  maxTurns: 30,
  startingHp: STARTING_HP,
  startingDeck: STARTING_DECK,
  players,
  events: buildEvents(script),
  result: {
    winner: 'me',
    rewards: { credits: 40, xp: 120, levelFrom: 7, levelTo: 8 },
    trophies: [{ title: 'Vinci 5 partite', reward: 100 }],
    progress: { level: 8, xp: 360, xpNext: 2000 },
  },
};

// ---------------------------------------------------------------------------

function fighter(number, role, region, element, stats, rarity = 'comune', subcards = 0) {
  return {
    number,
    name: `Fighter ${number}`,
    role,
    region,
    element,
    rarity,
    image: null,
    stats,
    subcards,
    maxSubcards: 3,
  };
}

/**
 * Trasforma il copione in eventi completi: risolve i fighter e calcola
 * lo stato della partita (PV, carte nel mazzo, fighter sconfitti) dopo ogni round.
 */
function buildEvents(steps) {
  const hp = { me: STARTING_HP, opponent: STARTING_HP };
  const defeated = { me: 0, opponent: 0 };

  return steps.map((step) => {
    if (step.ko) {
      hp[step.ko] = Math.max(0, hp[step.ko] - step.pv);
      defeated[step.ko] += 1;
    }
    const deck = Math.max(0, STARTING_DECK - step.turn);
    const me = { fighter: mockFighters[step.me], ...step.meHit, ko: step.ko === 'me' };
    const opponent = {
      fighter: mockFighters[step.opp],
      ...step.oppHit,
      ko: step.ko === 'opponent',
    };

    return {
      turn: step.turn,
      round: step.round,
      me,
      opponent,
      log: describe(me, opponent, step),
      state: {
        hp: { ...hp },
        deck: { me: deck, opponent: deck },
        defeated: { ...defeated },
      },
    };
  });
}

/** Testo dell'"Ultimo evento", es. "Fighter 003 schiva e mette a segno un critico: …". */
function describe(me, opponent, { ko, pv }) {
  if (!ko) {
    return `${me.fighter.name} e ${opponent.fighter.name} si scambiano colpi: nessuno è sconfitto`;
  }
  const [winner, loser] = ko === 'me' ? [opponent, me] : [me, opponent];
  const loserUser = players[ko].username;
  const dodge = winner.outcome === 'schivata' ? 'schiva e ' : '';
  const hit =
    loser.outcome === 'critico' ? 'mette a segno un critico' : `infligge ${loser.damage} danni`;
  return `${winner.fighter.name} ${dodge}${hit}: ${loser.fighter.name} è sconfitto · −${pv} PV a @${loserUser}`;
}
