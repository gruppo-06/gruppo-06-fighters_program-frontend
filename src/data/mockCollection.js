/**
 * Dati FINTI della collezione del giocatore, per sviluppare la pagina
 * Collezione senza backend. Da sostituire con la risposta dell'API
 * (es. api.get('/collection')) mantenendo la stessa forma.
 *
 * Il catalogo ha 95 carte:
 * - #001–#080 fighter, 16 per fazione (Oriente, Europa, America, Medio Oriente, Africa);
 *   dentro ogni fazione le posizioni 1–9 sono comuni, 10–13 rare, 14–15 epiche, la 16 leggendaria
 * - #081–#095 carte Effetto
 *
 * Ogni carta ha `owned` (posseduta o no) e `copies` (numero di copie possedute).
 */

export const FACTIONS = ['Oriente', 'Europa', 'America', 'Medio Oriente', 'Africa'];
export const EFFECT_FACTION = 'Effetto';
export const CLASSES = ['Assassino', 'Colosso', 'Combattente', 'Sentinella', 'Specialista'];
export const ELEMENTS = ['Acqua', 'Aria', 'Fuoco', 'Terra'];
export const RARITIES = ['comune', 'rara', 'epica', 'leggendaria', 'effetto'];

const CARDS_PER_FACTION = 16;
const TOTAL_CARDS = 95;

/** Numeri delle carte NON possedute (gli altri sono posseduti). */
const MISSING = new Set([
  // Oriente: 14/16
  13, 15,
  // Europa: 12/16
  21, 28, 30, 32,
  // America: 11/16
  37, 41, 45, 47, 48,
  // Medio Oriente: 9/16
  49, 52, 57, 59, 61, 63, 64,
  // Africa: 8/16
  65, 70, 73, 75, 76, 77, 78, 80,
  // Effetto: 8/15
  81, 83, 85, 88, 90, 92, 94,
]);

/** Le carte che compaiono nel mockup di Figma, con i loro dati esatti. */
const OVERRIDES = {
  6: { role: 'Colosso', element: 'Terra', stats: [8, 4, 1, 5], copies: 2 },
  16: { role: 'Colosso', element: 'Fuoco', stats: [10, 7, 4, 8], copies: 4 },
  19: { role: 'Specialista', element: 'Acqua', stats: [2, 5, 4, 8], copies: 3 },
  24: { role: 'Specialista', element: 'Fuoco', stats: [2, 5, 4, 8], copies: 3 },
  26: {
    role: 'Colosso',
    element: 'Terra',
    stats: [6, 3, 9, 5],
    copies: 2,
    decks: 1,
    equipped: ['Danno +2'],
    lore: 'Lore del fighter: provenienza, stile di combattimento e mossa speciale, in due o tre righe.',
  },
  37: { role: 'Assassino', element: 'Aria', stats: [5, 2, 8, 4] },
  50: { role: 'Combattente', element: 'Terra', stats: [4, 4, 4, 4], copies: 2 },
  55: { role: 'Combattente', element: 'Acqua', stats: [4, 4, 4, 4], copies: 1 },
  60: { role: 'Combattente', element: 'Fuoco', stats: [5, 5, 5, 5], copies: 1 },
  62: { role: 'Assassino', element: 'Terra', stats: [7, 4, 10, 6], copies: 1 },
  68: { role: 'Sentinella', element: 'Fuoco', stats: [4, 8, 4, 3], copies: 2 },
};

const EFFECTS = [
  ['Contrattacco', 'Restituisce il 30% del danno subito al fighter avversario.'],
  ['Guardia alta', '+3 DEF al fighter in campo per un round.'],
  ['Doppio colpo', 'Il fighter attacca due volte, il secondo colpo fa metà danno.'],
  ['Concentrazione', '+20% di probabilità di critico per il prossimo attacco.'],
  ['Scatto', '+3 VEL al fighter in campo per un round.'],
  ['Super Move', 'Colpisce i PV avversari con il 50% del danno.'],
  ['Rabbia', '+2 ATK ma −1 DEF fino alla fine del turno.'],
  ['Provocazione', "L'avversario deve attaccare il fighter in campo."],
  ['Rigenerazione', 'Recupera 2 PV alla fine del turno.'],
  ['Schivata', '50% di probabilità di evitare il prossimo colpo.'],
  ['Scudo', 'Annulla il primo danno subito in questo turno.'],
  ['Assalto', '+1 ATK a tutti i fighter del mazzo per un turno.'],
  ['Furia', 'Il prossimo critico infligge il triplo del danno.'],
  ['Combo', 'Se il fighter vince il round, attacca di nuovo.'],
  ['Continue?', '25% di tornare nel mazzo se sconfitto (1 volta).'],
];

// ---------------------------------------------------------------------------

/** Generatore pseudo-casuale deterministico: stessi dati a ogni caricamento. */
function seeded(seed) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

const pad = (n) => String(n).padStart(3, '0');

function rarityAt(position) {
  if (position === 15) return 'leggendaria';
  if (position >= 13) return 'epica';
  if (position >= 9) return 'rara';
  return 'comune';
}

function buildFighter(number) {
  const random = seeded(number * 7919);
  const pick = (list) => list[Math.floor(random() * list.length)];
  const stat = () => 2 + Math.floor(random() * 8);

  const position = (number - 1) % CARDS_PER_FACTION;
  const region = FACTIONS[Math.floor((number - 1) / CARDS_PER_FACTION)];
  const rarity = rarityAt(position);
  const override = OVERRIDES[number] ?? {};
  const [atk, def, vel, crt] = override.stats ?? [stat(), stat(), stat(), stat()];
  const role = override.role ?? pick(CLASSES);
  const owned = !MISSING.has(number);
  const equipped = override.equipped ?? [];

  return {
    id: number,
    number: pad(number),
    name: `Fighter ${pad(number)}`,
    faction: region,
    region,
    role,
    element: override.element ?? pick(ELEMENTS),
    rarity,
    image: null,
    stats: { atk, def, vel, crt },
    ability: rarity === 'leggendaria' ? 'Abilità unica' : null,
    lore:
      override.lore ??
      `${role} di ${region}: combatte con uno stile tutto suo e una mossa speciale che nessuno ha ancora saputo fermare.`,
    subcards: equipped.length,
    maxSubcards: 3,
    equipped,
    owned,
    copies: owned ? (override.copies ?? 1 + Math.floor(random() * 3)) : 0,
    decks: owned ? (override.decks ?? Math.floor(random() * 2)) : 0,
  };
}

function buildEffect(number, index) {
  const random = seeded(number * 104729);
  const [name, description] = EFFECTS[index];
  const owned = !MISSING.has(number);

  return {
    id: number,
    number: pad(number),
    name,
    faction: EFFECT_FACTION,
    region: null,
    role: null,
    element: null,
    rarity: 'effetto',
    image: null,
    stats: null,
    description,
    owned,
    copies: owned ? 1 : 0,
    decks: owned ? Math.floor(random() * 2) : 0,
  };
}

const fighterCount = FACTIONS.length * CARDS_PER_FACTION;

export const mockCollection = Array.from({ length: TOTAL_CARDS }, (_, i) =>
  i < fighterCount ? buildFighter(i + 1) : buildEffect(i + 1, i - fighterCount),
);
