/**
 * Pacchetti FINTI del negozio, per sviluppare l'interfaccia senza backend.
 * Da sostituire con i dati reali tramite src/services/api.js (es. GET /packs).
 * Le immagini andranno in public/images/packs/ con percorso assoluto,
 * es. '/images/packs/leggendario.webp'; con `image: null` si vede il segnaposto.
 */
const HOUR = 60 * 60 * 1000;

export const mockPacks = [
  {
    id: 'base',
    name: 'Pacchetto Base',
    description: '5 carte · 3 comuni, 1 rara, 1 carta Effetto',
    price: 100,
    image: null,
  },
  {
    id: 'avanzato',
    name: 'Pacchetto Avanzato',
    description: '8 carte · 4 comuni, 2 rare, 1 epica, 1 Effetto',
    price: 220,
    image: null,
  },
  {
    id: 'leggendario',
    name: 'Pacchetto Leggendario',
    description: '10 carte · 1 leggendaria garantita',
    // Testo più lungo mostrato nel banner in evidenza
    featuredDescription: '10 carte · 1 leggendaria garantita · fighter esclusivi della Stagione 1',
    price: 500,
    image: null,
    featured: true,
    // Offerta a tempo: termina tra 2 giorni e 14 ore
    endsAt: Date.now() + (2 * 24 + 14) * HOUR,
  },
];
