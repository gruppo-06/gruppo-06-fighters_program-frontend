/**
 * Acquisto FINTO dei pacchetti: carte, saldo e trofeo "Primo pacchetto".
 * Lo stato vive in memoria e si azzera ricaricando la pagina.
 * TODO: sostituire con il backend (es. api.post('/packs/:id/open')).
 */
import { mockFighters } from './mockMatch.js';

const STARTING_CREDITS = 1250;
const FIRST_PACK_REWARD = 50;

const fighter = (number, role, region, element, rarity, [atk, def, vel, crt]) => ({
  number,
  name: `Fighter ${number}`,
  role,
  region,
  element,
  rarity,
  image: null,
  stats: { atk, def, vel, crt },
});

const { f003, f007, f011, f015, f019, f021, f024, f028, f032, f036 } = mockFighters;

// TODO: FighterCard non gestisce le carte Effetto: come nel mockup, al loro posto c'è un fighter.
// L'ordine è quello di visualizzazione, da sinistra a destra.
const packContents = {
  base: [
    fighter('037', 'Assassino', 'America', 'Aria', 'comune', [5, 2, 8, 4]),
    fighter('024', 'Specialista', 'Europa', 'Fuoco', 'comune', [2, 5, 4, 8]),
    {
      ...fighter('062', 'Assassino', 'Medio Oriente', 'Terra', 'epica', [7, 4, 10, 6]),
      isNew: true,
    },
    fighter('060', 'Combattente', 'Medio Oriente', 'Fuoco', 'rara', [5, 5, 5, 5]),
    fighter('001', 'Colosso', 'Oriente', 'Aria', 'comune', [8, 4, 1, 5]),
  ],
  avanzato: [f003, f011, f015, f021, f007, f024, f019, f036],
  leggendario: [
    f003,
    f011,
    f015,
    f021,
    f028,
    f032,
    f007,
    f024,
    f019,
    fighter('080', 'Campione', 'Oriente', 'Fuoco', 'leggendaria', [10, 8, 8, 7]),
  ],
};

let creditsDelta = 0;
let openings = 0;
const openedPacks = new Set();

/** Saldo del server (o quello finto, se manca) corretto con gli acquisti simulati. */
export function getBalance(serverCredits) {
  return (serverCredits ?? STARTING_CREDITS) + creditsDelta;
}

/** Scala i crediti e restituisce il risultato dell'apertura. */
export function purchasePack(pack) {
  const trophy = openings === 0 ? { title: 'Primo pacchetto', reward: FIRST_PACK_REWARD } : null;
  const firstOfKind = !openedPacks.has(pack.id);

  openings += 1;
  openedPacks.add(pack.id);
  creditsDelta += (trophy?.reward ?? 0) - pack.price;

  return {
    id: `${Date.now()}-${openings}`,
    pack: { id: pack.id, name: pack.name, price: pack.price },
    cards: packContents[pack.id].map((card) => ({
      ...card,
      isNew: Boolean(card.isNew && firstOfKind),
    })),
    trophy,
  };
}
