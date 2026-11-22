/**
 * Conversione delle carte del backend nella forma che usano i componenti
 * (FighterCard, CardDetail). Il backend usa i nomi del catalogo dei DSG.
 */
import { backendUrl } from './api.js';

const RARITY_TONES = {
  Comune: 'comune',
  Rara: 'rara',
  Epica: 'epica',
  Leggendaria: 'leggendaria',
};

export const FACTIONS = [
  'Africana',
  'Eurasiatica',
  'Euroatlantica',
  'Indo-Pacifica',
  'Panamericana',
];
export const CLASSES = ['Combattenti', 'Assassini', 'Specialisti', 'Colossi', 'Sentinelle'];
export const RARITIES = ['comune', 'rara', 'epica', 'leggendaria'];

/** URL dell'illustrazione di una carta a partire dal suo codice (es. AF01). */
export function cardImageUrl(code) {
  return backendUrl(`/api/cards/${encodeURIComponent(code)}/image`);
}

/**
 * Carta del backend (catalogo, collezione o replay) → oggetto `fighter` di FighterCard.
 * Accetta sia `fighterClass` (catalogo, collezione) sia campi mancanti (replay: niente classe e paese).
 */
export function toFighter(card) {
  return {
    id: card.cardId ?? card.code,
    number: card.code,
    name: card.name,
    role: card.fighterClass ?? card.faction,
    region: card.country ?? card.faction,
    faction: card.faction,
    rarity: RARITY_TONES[card.rarity] ?? 'comune',
    image: card.imageUrl ? backendUrl(card.imageUrl) : cardImageUrl(card.code),
    stats: { atk: card.atk, def: card.def, vel: card.vel, crt: card.crt },
    copies: card.quantity ?? 0,
    lore: card.flavorText,
  };
}
