/**
 * Regole di composizione del mazzo (Figma: MAZZI – editor).
 * Logica pura, senza React: la usano l'editor e l'elenco dei mazzi.
 * Le regole vere le applica il backend (POST /me/decks/validate), qui servono
 * per i contatori dal vivo e per impedire le mosse non consentite nell'editor.
 *
 * Un mazzo è rappresentato da `cards`: un oggetto { [cardId]: numeroCopie }.
 * Le chiavi sono i cardId del backend (stringhe), non i numeri di carta.
 */

/** Segmento di rotta dell'editor per creare un mazzo nuovo: /mazzi/nuovo. */
export const NEW_DECK_ID = 'nuovo';

export const DECK_SIZE = 10;
export const MAX_POWER = 18;
export const MAX_COPIES = 2;
export const MAX_EPIC = 2;
export const MAX_LEGENDARY = 1;

/** Punti forza di una carta in base alla rarità. */
export const CARD_POWER = {
  comune: 1,
  rara: 2,
  epica: 3,
  leggendaria: 5,
};

/** Sottocarte applicabili a una carta per rarità (solo modalità avanzata). */
export const SUBCARD_SLOTS = {
  comune: 3,
  rara: 2,
  epica: 1,
  leggendaria: 0,
};

/** Statistiche delle carte nell'ordine di visualizzazione, con i limiti del backend. */
const STAT_ROWS = [
  { key: 'atk', label: 'ATK', min: 1 },
  { key: 'def', label: 'DEF', min: 0 },
  { key: 'vel', label: 'VEL', min: 0 },
  { key: 'crt', label: 'CRT', min: 0 },
];
const MAX_STAT = 1000;

/** Voci della "Composizione" nel pannello del mazzo, nell'ordine del mockup. */
export const COMPOSITION = [
  { rarity: 'comune', label: 'Comuni' },
  { rarity: 'rara', label: 'Rare' },
  { rarity: 'epica', label: 'Epiche' },
  { rarity: 'leggendaria', label: 'Leggendarie' },
];

export const isLegendary = (card) => card.rarity === 'leggendaria';
export const isEpic = (card) => card.rarity === 'epica';

export const cardPower = (card) => CARD_POWER[card.rarity] ?? 0;

/** Copie ammesse dal regolamento per una carta (indipendentemente da quante se ne possiedono). */
export const copyLimit = (card) => (isLegendary(card) ? MAX_LEGENDARY : MAX_COPIES);

/** Copie inseribili davvero: il limite del regolamento, ma non più di quelle possedute. */
export const maxCopies = (card) => (card.owned ? Math.min(copyLimit(card), card.copies ?? 0) : 0);

const cardKey = (id) => String(id);
const sortKey = (card) => String(card.number ?? card.id ?? card.cardId ?? '');

/** Cerca la carta accettando sia chiavi stringa sia numeriche nella mappa. */
const cardFrom = (cardsById, id) =>
  cardsById.get(cardKey(id)) ?? cardsById.get(id) ?? cardsById.get(Number(id));

/** Righe del mazzo { card, count } ordinate per numero di carta. Ignora id sconosciuti. */
export function deckEntries(cards, cardsById) {
  return Object.entries(cards)
    .map(([id, count]) => ({ card: cardFrom(cardsById, id), count }))
    .filter(({ card, count }) => card && count > 0)
    .sort(
      (a, b) =>
        sortKey(a.card).localeCompare(sortKey(b.card), 'it', { numeric: true }) ||
        cardKey(a.card.cardId).localeCompare(cardKey(b.card.cardId)),
    );
}

/**
 * Riepilogo e validazione locale di un mazzo.
 * Il backend resta la fonte di verità: questo riepilogo alimenta i contatori
 * dal vivo e i messaggi mostrati accanto alla verifica del server.
 *
 * @returns {{ count, power, legendaries, epics, composition, problems: string[], valid: boolean }}
 */
export function summarizeDeck(cards, cardsById) {
  const entries = deckEntries(cards, cardsById);

  let count = 0;
  let power = 0;
  let legendaries = 0;
  let epics = 0;
  const composition = Object.fromEntries(COMPOSITION.map(({ rarity }) => [rarity, 0]));
  const problems = [];

  for (const { card, count: copies } of entries) {
    count += copies;
    power += cardPower(card) * copies;
    composition[card.rarity] = (composition[card.rarity] ?? 0) + copies;
    if (isLegendary(card)) legendaries += copies;
    if (isEpic(card)) epics += copies;
    if (copies > copyLimit(card)) problems.push(`Troppe copie di ${card.name}`);
  }

  const missing = DECK_SIZE - count;
  if (missing === 1) problems.unshift('Manca 1 carta');
  else if (missing > 0) problems.unshift(`Mancano ${missing} carte`);
  else if (missing < 0) problems.unshift(`${-missing} carte di troppo`);

  if (epics > MAX_EPIC) problems.push(`Massimo ${MAX_EPIC} carte Epiche`);
  if (legendaries > MAX_LEGENDARY) {
    problems.push(`Massimo ${MAX_LEGENDARY} carta Leggendaria`);
  }
  if (power > MAX_POWER) problems.push(`Forza ${power} / ${MAX_POWER}`);

  return { count, power, legendaries, epics, composition, problems, valid: problems.length === 0 };
}

/**
 * Perché non si può aggiungere un'altra copia di `card` (null se si può).
 * L'ordine conta: è il messaggio mostrato sotto la carta.
 */
export function addBlockReason(card, inDeck, summary) {
  if (!card.owned) return 'Non posseduta';
  if (inDeck >= maxCopies(card)) {
    const owned = card.copies ?? 0;
    if (owned < copyLimit(card)) {
      return owned === 1 ? 'Hai 1 sola copia' : `Hai solo ${owned} copie`;
    }
    return isLegendary(card) ? `Max ${MAX_LEGENDARY} leggendaria` : `Max ${MAX_COPIES} copie`;
  }
  if (isLegendary(card) && summary.legendaries >= MAX_LEGENDARY) {
    return `Max ${MAX_LEGENDARY} leggendaria`;
  }
  if (isEpic(card) && summary.epics >= MAX_EPIC) {
    return `Max ${MAX_EPIC} carte Epiche`;
  }
  if (summary.count >= DECK_SIZE) return 'Mazzo completo';
  return null;
}

export const subcardSlots = (card) => SUBCARD_SLOTS[card.rarity] ?? 0;

/** Si può applicare la sottocarta `code` alla carta, dato l'elenco `codes` già applicato? */
export const canAddSubcard = (card, codes, code) =>
  !codes.includes(code) && codes.length < subcardSlots(card);

/**
 * Statistiche con le sottocarte applicate, come le calcola il backend:
 * stat' = round(stat × (100 + somma delle percentuali) / 100),
 * limitata a 1..1000 per ATK e 0..1000 per le altre.
 * Le statistiche non numeriche (es. VEL e CRT delle carte non più in collezione) restano invariate.
 *
 * @param {object} stats     { atk, def, vel, crt }
 * @param {object[]} subcards sottocarte { atk, def, vel, crt } in percentuale
 */
export function modifiedStats(stats, subcards = []) {
  const modified = { ...stats };
  for (const { key, min } of STAT_ROWS) {
    if (typeof stats?.[key] !== 'number') continue;
    const percent = subcards.reduce((sum, subcard) => sum + (subcard[key] ?? 0), 0);
    const value = Math.round((stats[key] * (100 + percent)) / 100);
    modified[key] = Math.min(MAX_STAT, Math.max(min, value));
  }
  return modified;
}

/** Statistiche che cambiano con le sottocarte: { label, from, to }. */
export function changedStats(stats, modified) {
  return STAT_ROWS.filter(
    ({ key }) => typeof stats?.[key] === 'number' && modified[key] !== stats[key],
  ).map(({ key, label }) => ({ label, from: stats[key], to: modified[key] }));
}

/** Effetti non nulli di una sottocarta, nell'ordine ATK DEF VEL CRT. */
export function subcardEffects(subcard) {
  return STAT_ROWS.filter(({ key }) => (subcard[key] ?? 0) !== 0).map(({ key, label }) => ({
    key,
    label,
    value: subcard[key],
  }));
}
