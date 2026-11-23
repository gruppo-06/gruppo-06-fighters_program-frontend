/**
 * Dati di anteprima per le Carte Effetto e le Abilità Leggendarie.
 * Non sono dati reali del backend: servono solo per la demo.
 */

/** Carte Effetto di esempio (rarità "effetto"). */
export const PREVIEW_EFFECTS = [
  {
    code: 'EF01',
    number: 'EF01',
    name: 'Contrattacco',
    role: 'Carta Effetto',
    region: 'Neutrale',
    faction: 'Neutrale',
    rarity: 'effetto',
    description: 'Il prossimo colpo subito viene restituito al 50%',
    image: null,
    stats: { atk: 0, def: 0, vel: 0, crt: 0 },
    copies: 0,
    owned: false,
  },
  {
    code: 'EF02',
    number: 'EF02',
    name: "Scudo d'energia",
    role: 'Carta Effetto',
    region: 'Neutrale',
    faction: 'Neutrale',
    rarity: 'effetto',
    description: 'Dimezza il primo colpo subito in questo duello',
    image: null,
    stats: { atk: 0, def: 0, vel: 0, crt: 0 },
    copies: 0,
    owned: false,
  },
  {
    code: 'EF03',
    number: 'EF03',
    name: 'Adrenalina pura',
    role: 'Carta Effetto',
    region: 'Neutrale',
    faction: 'Neutrale',
    rarity: 'effetto',
    description: '+20% VEL per un turno',
    image: null,
    stats: { atk: 0, def: 0, vel: 0, crt: 0 },
    copies: 0,
    owned: false,
  },
  {
    code: 'EF04',
    number: 'EF04',
    name: 'Ritirata tattica',
    role: 'Carta Effetto',
    region: 'Neutrale',
    faction: 'Neutrale',
    rarity: 'effetto',
    description: 'Sostituisci la carta in campo senza perdere punti vita',
    image: null,
    stats: { atk: 0, def: 0, vel: 0, crt: 0 },
    copies: 0,
    owned: false,
  },
  {
    code: 'EF05',
    number: 'EF05',
    name: 'Furia',
    role: 'Carta Effetto',
    region: 'Neutrale',
    faction: 'Neutrale',
    rarity: 'effetto',
    description: '+15% ATK ma −10% DEF fino al KO',
    image: null,
    stats: { atk: 0, def: 0, vel: 0, crt: 0 },
    copies: 0,
    owned: false,
  },
  {
    code: 'EF06',
    number: 'EF06',
    name: 'Rinforzi',
    role: 'Carta Effetto',
    region: 'Neutrale',
    faction: 'Neutrale',
    rarity: 'effetto',
    description: 'Recupera 30 punti vita',
    image: null,
    stats: { atk: 0, def: 0, vel: 0, crt: 0 },
    copies: 0,
    owned: false,
  },
];

/**
 * Abilità leggendarie di anteprima, indicizzate per codice carta.
 * Ogni entry ha: { name: string, text: string }
 */
export const LEGENDARY_ABILITIES = {
  EA03: {
    name: 'Ren Saito',
    text: 'Iaijutsu — Il primo colpo di ogni duello infligge danno doppio',
  },
  AF11: {
    name: 'Ama Mensah',
    text: 'Guanti cinetici — Le carte Africane del mazzo ottengono +5% ATK',
  },
  EU05: {
    name: 'Lev Morozov',
    text: 'Comando tattico — Tutte le carte del mazzo ottengono +8% CRT',
  },
  IP15: {
    name: 'Khamla Vong',
    text: 'Barriera viva — Le Sentinelle del mazzo ottengono +6% DEF',
  },
  PA05: {
    name: 'Valentina Rojas',
    text: 'Spirito da campionessa — Dopo un tuo KO la carta successiva entra con +10% ATK',
  },
};
