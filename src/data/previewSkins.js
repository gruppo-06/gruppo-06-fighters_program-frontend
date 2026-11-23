/**
 * Dati di anteprima per le Skin cosmetiche (carte e avatar).
 * Non sono dati reali del backend: servono solo per la demo.
 */

/** Skin per carte (bordi/cornici decorative). */
export const PREVIEW_CARD_SKINS = [
  {
    id: 'skin-cornice-neon',
    name: 'Cornice Neon',
    type: 'card',
    price: 300,
    // CSS gradient per il bordo della carta
    previewStyle: {
      border: '2px solid transparent',
      background:
        'linear-gradient(var(--color-background-surface), var(--color-background-surface)) padding-box, linear-gradient(135deg, #00f3ff, #ff00f5, #ffcc00) border-box',
    },
    description: 'Bordo animato al neon per le tue carte',
  },
  {
    id: 'skin-olografica',
    name: 'Olografica',
    type: 'card',
    price: 500,
    previewStyle: {
      border: '2px solid transparent',
      background:
        'linear-gradient(var(--color-background-surface), var(--color-background-surface)) padding-box, linear-gradient(45deg, #ff6b6b, #4ecdc4, #ffe66d, #ff6b6b) border-box',
      backgroundSize: '300% 300%',
    },
    description: 'Effetto olografico cangiante',
  },
  {
    id: 'skin-pixel-retro',
    name: 'Pixel Retrò',
    type: 'card',
    price: 250,
    previewStyle: {
      border: '4px solid #2d2d2d',
      boxShadow: 'inset 0 0 0 2px #fff, 0 0 0 6px #2d2d2d',
      imageRendering: 'pixelated',
    },
    description: 'Stile 8-bit con bordo pixelato',
  },
];

/** Skin per avatar (anelli colorati attorno al cerchio profilo). */
export const PREVIEW_AVATAR_SKINS = [
  {
    id: 'skin-ronin',
    name: 'Ronin',
    type: 'avatar',
    price: 400,
    // CSS gradient per l'anello dell'avatar
    ringStyle: 'conic-gradient(from 0deg, #c0392b, #e74c3c, #f39c12, #c0392b)',
    description: 'Anello rosso fuoco da guerriero solitario',
  },
  {
    id: 'skin-cyber-lottatrice',
    name: 'Cyber-lottatrice',
    type: 'avatar',
    price: 600,
    ringStyle: 'conic-gradient(from 90deg, #00ffff, #8a2be2, #ff00ff, #00ffff)',
    description: 'Anello cyberpunk viola/ciano',
  },
  {
    id: 'skin-campione-torneo',
    name: 'Campione del Torneo',
    type: 'avatar',
    price: 1000,
    ringStyle: 'conic-gradient(from 180deg, #ffd700, #ffaa00, #fff8dc, #ffd700)',
    description: 'Anello dorato riservato ai campioni',
  },
];

/** Skin attive del giocatore (anteprima). */
export const ACTIVE_SKINS = {
  card: 'skin-cornice-neon',
  avatar: 'skin-ronin',
};
