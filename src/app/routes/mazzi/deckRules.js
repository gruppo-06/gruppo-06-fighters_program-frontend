/**
 * Regole di composizione del mazzo (Figma: MAZZI – editor).
 * Logica pura, senza React: la usano l'editor e l'elenco dei mazzi,
 * e un domani si può confrontare 1:1 con la validazione del backend.
 *
 * Un mazzo è rappresentato da `cards`: un oggetto { [idCarta]: numeroCopie }.
 *
 * TODO: il regolamento (regolamento.html) non definisce ancora la composizione del mazzo:
 * i valori qui sotto vengono dal mockup e i punti forza per rarità sono provvisori.
 */

/** Segmento di rotta dell'editor per creare un mazzo nuovo: /mazzi/nuovo. */
export const NEW_DECK_ID = 'nuovo';

export const DECK_SIZE = 20;
export const MAX_POWER = 150;
export const MAX_COPIES = 3;
export const MAX_LEGENDARY = 1;

/** Punti forza di una carta in base alla rarità (provvisori, vedi TODO sopra). */
export const CARD_POWER = {
  comune: 6,
  rara: 9,
  epica: 12,
  leggendaria: 16,
  effetto: 5,
};

/** Voci della "Composizione" nel pannello del mazzo, nell'ordine del mockup. */
export const COMPOSITION = [
  { rarity: 'comune', label: 'Comuni' },
  { rarity: 'rara', label: 'Rare' },
  { rarity: 'epica', label: 'Epiche' },
  { rarity: 'leggendaria', label: 'Leggendarie' },
  { rarity: 'effetto', label: 'Carte Effetto' },
];

export const isLegendary = (card) => card.rarity === 'leggendaria';

export const cardPower = (card) => CARD_POWER[card.rarity] ?? 0;

/** Copie ammesse dal regolamento per una carta (indipendentemente da quante se ne possiedono). */
export const copyLimit = (card) => (isLegendary(card) ? MAX_LEGENDARY : MAX_COPIES);

/** Copie inseribili davvero: il limite del regolamento, ma non più di quelle possedute. */
export const maxCopies = (card) => (card.owned ? Math.min(copyLimit(card), card.copies) : 0);

/** Righe del mazzo { card, count } ordinate per numero di carta. Ignora id sconosciuti. */
export function deckEntries(cards, cardsById) {
  return Object.entries(cards)
    .map(([id, count]) => ({ card: cardsById.get(Number(id)), count }))
    .filter(({ card, count }) => card && count > 0)
    .sort((a, b) => a.card.id - b.card.id);
}

/**
 * Riepilogo e validazione di un mazzo.
 * @returns {{ count, power, legendaries, composition, problems: string[], valid: boolean }}
 */
export function summarizeDeck(cards, cardsById) {
  const entries = deckEntries(cards, cardsById);

  let count = 0;
  let power = 0;
  let legendaries = 0;
  const composition = Object.fromEntries(COMPOSITION.map(({ rarity }) => [rarity, 0]));
  const problems = [];

  for (const { card, count: copies } of entries) {
    count += copies;
    power += cardPower(card) * copies;
    composition[card.rarity] = (composition[card.rarity] ?? 0) + copies;
    if (isLegendary(card)) legendaries += copies;
    if (copies > maxCopies(card)) problems.push(`Troppe copie di ${card.name}`);
  }

  const missing = DECK_SIZE - count;
  if (missing === 1) problems.unshift('Manca 1 carta');
  else if (missing > 0) problems.unshift(`Mancano ${missing} carte`);
  else if (missing < 0) problems.unshift(`${-missing} carte di troppo`);

  if (power > MAX_POWER) problems.push(`Forza ${power} / ${MAX_POWER}`);
  if (legendaries > MAX_LEGENDARY) problems.push(`Massimo ${MAX_LEGENDARY} leggendaria`);

  return { count, power, legendaries, composition, problems, valid: problems.length === 0 };
}

/**
 * Perché non si può aggiungere un'altra copia di `card` (null se si può).
 * L'ordine conta: è il messaggio mostrato sotto la carta.
 */
export function addBlockReason(card, inDeck, summary) {
  if (!card.owned) return 'Non posseduta';
  if (inDeck >= copyLimit(card)) {
    return isLegendary(card) ? `Max ${MAX_LEGENDARY} leggendaria` : `Max ${MAX_COPIES} copie`;
  }
  if (inDeck >= card.copies) {
    return card.copies === 1 ? 'Hai 1 sola copia' : `Hai solo ${card.copies} copie`;
  }
  if (isLegendary(card) && summary.legendaries >= MAX_LEGENDARY) {
    return `Max ${MAX_LEGENDARY} leggendaria`;
  }
  if (summary.count >= DECK_SIZE) return 'Mazzo completo';
  return null;
}
