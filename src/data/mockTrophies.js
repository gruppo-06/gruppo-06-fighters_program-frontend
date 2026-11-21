/**
 * Dati FINTI della pagina Trofei, per sviluppare l'interfaccia senza backend.
 * Da sostituire con i dati reali tramite src/services/api.js
 * (es. GET /me/trophies e GET /me per il profilo).
 *
 * Trofeo:
 *   status    'unlocked' | 'in-progress' | 'locked'
 *   tier      'bronzo' | 'argento' | 'oro'
 *   category  uno degli id di TROPHY_CATEGORIES
 *   progress  { current, target } (assente per i trofei bloccati)
 *   reward    numero = crediti (es. 100 → "+100"), stringa = premio speciale
 *             (es. "Cornice avatar"); assente se il premio è nascosto
 */

export const TROPHY_CATEGORIES = [
  { id: 'partite', label: 'Partite' },
  { id: 'collezione', label: 'Collezione' },
  { id: 'mazzi', label: 'Mazzi' },
  { id: 'scambi', label: 'Scambi' },
  { id: 'social', label: 'Social' },
  { id: 'stagionali', label: 'Stagionali' },
];

export const TROPHY_TIERS = {
  bronzo: 'Bronzo',
  argento: 'Argento',
  oro: 'Oro',
};

export const mockPlayer = {
  username: 'tu',
  avatar: null,
  level: 7,
  levelTitle: 'Collezionista',
  xp: 1240,
  xpNextLevel: 2000,
  trophiesUnlocked: 18,
  trophiesTotal: 60,
  wins: 42,
  creditsWon: 1850,
};

export const mockTrophies = [
  {
    id: 'prima-vittoria',
    title: 'Prima vittoria',
    description: 'Vinci la tua prima sfida',
    tier: 'bronzo',
    category: 'partite',
    status: 'unlocked',
    progress: { current: 1, target: 1 },
    reward: 50,
  },
  {
    id: 'vinci-5-partite',
    title: 'Vinci 5 partite',
    description: 'Vinci 5 sfide contro altri giocatori',
    tier: 'argento',
    category: 'partite',
    status: 'in-progress',
    progress: { current: 4, target: 5 },
    reward: 100,
  },
  {
    id: 'veterano',
    title: 'Veterano',
    description: 'Vinci 25 partite',
    tier: 'oro',
    category: 'partite',
    status: 'in-progress',
    progress: { current: 4, target: 25 },
    reward: 'Dorso esclusivo',
  },
  {
    id: 'serie-vincente',
    title: 'Serie vincente',
    description: 'Vinci 3 partite di fila',
    tier: 'argento',
    category: 'partite',
    status: 'in-progress',
    progress: { current: 1, target: 3 },
    reward: 150,
  },
  {
    id: 'combo-perfetta',
    title: 'Combo perfetta',
    description: 'Vinci con una 10 Hit Combo',
    tier: 'oro',
    category: 'partite',
    status: 'locked',
  },
  {
    id: 'primo-pacchetto',
    title: 'Primo pacchetto',
    description: 'Apri il tuo primo pacchetto',
    tier: 'bronzo',
    category: 'collezione',
    status: 'unlocked',
    progress: { current: 1, target: 1 },
    reward: 50,
  },
  {
    id: 'collezionista',
    title: 'Collezionista',
    description: 'Possiedi 50 carte diverse',
    tier: 'bronzo',
    category: 'collezione',
    status: 'unlocked',
    progress: { current: 50, target: 50 },
    reward: 100,
  },
  {
    id: 'gran-collezionista',
    title: 'Gran collezionista',
    description: 'Colleziona tutte le 95 carte',
    tier: 'oro',
    category: 'collezione',
    status: 'in-progress',
    progress: { current: 62, target: 95 },
    reward: 'Cornice avatar',
  },
  {
    id: 'fedele-alla-fazione',
    title: 'Fedele alla fazione',
    description: 'Tutti i 16 fighter di una fazione',
    tier: 'oro',
    category: 'collezione',
    status: 'in-progress',
    progress: { current: 14, target: 16 },
    reward: 'Titolo profilo',
  },
  {
    id: 'leggenda',
    title: 'Leggenda',
    description: 'Trova un fighter leggendario',
    tier: 'argento',
    category: 'collezione',
    status: 'unlocked',
    progress: { current: 1, target: 1 },
    reward: 200,
  },
  {
    id: 'stratega',
    title: 'Stratega',
    description: 'Salva il primo mazzo valido',
    tier: 'bronzo',
    category: 'mazzi',
    status: 'unlocked',
    progress: { current: 1, target: 1 },
    reward: 50,
  },
  {
    id: 'architetto',
    title: 'Architetto',
    description: 'Crea 5 mazzi validi',
    tier: 'argento',
    category: 'mazzi',
    status: 'in-progress',
    progress: { current: 2, target: 5 },
    reward: 100,
  },
  {
    id: 'primo-affare',
    title: 'Primo affare',
    description: 'Completa il primo scambio',
    tier: 'bronzo',
    category: 'scambi',
    status: 'unlocked',
    progress: { current: 1, target: 1 },
    reward: 50,
  },
  {
    id: 'mercante',
    title: 'Mercante',
    description: 'Completa 10 scambi',
    tier: 'argento',
    category: 'scambi',
    status: 'in-progress',
    progress: { current: 3, target: 10 },
    reward: 150,
  },
  {
    id: 'sfidante',
    title: 'Sfidante',
    description: 'Sfida 10 giocatori diversi',
    tier: 'argento',
    category: 'social',
    status: 'in-progress',
    progress: { current: 6, target: 10 },
    reward: 100,
  },
];

/** Trofei mostrati in "Prossimi traguardi" (in futuro scelti dal backend). */
export const mockGoalIds = ['gran-collezionista', 'vinci-5-partite', 'sfidante'];

/** Tipi di ricompensa della sezione "Cosa puoi vincere". */
export const REWARD_TYPES = [
  { id: 'crediti', title: 'Crediti', description: 'Per aprire nuovi pacchetti', image: null },
  { id: 'dorsi', title: 'Dorsi carta', description: 'Personalizza le tue carte', image: null },
  { id: 'cornici', title: 'Cornici avatar', description: 'Mostra il tuo livello', image: null },
  { id: 'titoli', title: 'Titoli profilo', description: 'Visibili nelle sfide', image: null },
];
