/**
 * Dati di anteprima per il Pass Battaglia (Battle Pass).
 * Non sono dati reali del backend: servono solo per la demo.
 */

export const PREVIEW_PASS = {
  season: 1,
  title: 'Pass Battaglia — Stagione 1',
  currentLevel: 7,
  maxLevel: 30,
  currentXP: 3500,
  xpForNextLevel: 1000,
  xpTotalForCurrentLevel: 4500, // XP totali per arrivare al livello corrente
  // 10 livelli di esempio per la track orizzontale
  levels: [
    {
      level: 1,
      free: { type: 'credits', amount: 100, label: '100 crediti' },
      premium: { type: 'pack', name: 'Pacchetto Base', label: 'Pacchetto Base' },
    },
    {
      level: 2,
      free: { type: 'credits', amount: 150, label: '150 crediti' },
      premium: { type: 'credits', amount: 200, label: '200 crediti' },
    },
    {
      level: 3,
      free: { type: 'credits', amount: 100, label: '100 crediti' },
      premium: { type: 'skin', name: 'Cornice Neon (Card)', label: 'Skin: Cornice Neon' },
    },
    {
      level: 4,
      free: { type: 'credits', amount: 200, label: '200 crediti' },
      premium: { type: 'pack', name: 'Pacchetto Raro', label: 'Pacchetto Raro' },
    },
    {
      level: 5,
      free: { type: 'credits', amount: 150, label: '150 crediti' },
      premium: { type: 'skin', name: 'Ronin (Avatar)', label: 'Skin: Ronin' },
    },
    {
      level: 6,
      free: { type: 'credits', amount: 250, label: '250 crediti' },
      premium: { type: 'credits', amount: 300, label: '300 crediti' },
    },
    {
      level: 7,
      free: { type: 'credits', amount: 200, label: '200 crediti' },
      premium: { type: 'pack', name: 'Pacchetto Epico', label: 'Pacchetto Epico' },
    },
    {
      level: 8,
      free: { type: 'credits', amount: 300, label: '300 crediti' },
      premium: { type: 'skin', name: 'Olografica (Card)', label: 'Skin: Olografica' },
    },
    {
      level: 9,
      free: { type: 'credits', amount: 250, label: '250 crediti' },
      premium: { type: 'credits', amount: 400, label: '400 crediti' },
    },
    {
      level: 10,
      free: { type: 'credits', amount: 500, label: '500 crediti' },
      premium: {
        type: 'skin',
        name: 'Campione del Torneo (Avatar)',
        label: 'Skin: Campione del Torneo',
      },
    },
  ],
  premiumPrice: 1000, // crediti per sbloccare il pass premium
  isPremiumUnlocked: false, // per la demo: non sbloccato
};
