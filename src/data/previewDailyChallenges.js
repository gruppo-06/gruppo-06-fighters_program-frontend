/**
 * Dati FINTI delle sfide giornaliere, per la preview nella pagina Sfide.
 * Da sostituire con i dati reali quando il backend espone le sfide giornaliere.
 *
 * Sfida giornaliera:
 *   progress  partite/azioni completate
 *   target    obiettivo da raggiungere
 *   reward    premio in crediti
 */

export const previewDailyChallenges = [
  { id: 'vinci-2', title: 'Vinci 2 partite', progress: 1, target: 2, reward: 50 },
  {
    id: 'avanzata-3',
    title: 'Gioca 3 partite in modalità avanzata',
    progress: 0,
    target: 3,
    reward: 80,
  },
  { id: 'apri-pacchetto', title: 'Apri un pacchetto', progress: 1, target: 1, reward: 30 },
];
