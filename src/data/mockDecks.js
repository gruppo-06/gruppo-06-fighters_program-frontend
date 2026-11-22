/**
 * Dati FINTI dei mazzi del giocatore, per sviluppare la pagina Mazzi
 * senza backend. Da sostituire con la risposta dell'API
 * (es. api.get('/decks')) mantenendo la stessa forma.
 *
 * `cards` è { [idCarta]: numeroCopie } e usa solo carte possedute in mockCollection.js.
 */
export const mockDecks = [
  {
    // Come nel mockup: 18 carte e forza 152/150 → 2 problemi
    id: '1',
    name: 'Il mio mazzo #1',
    cards: { 2: 3, 8: 3, 10: 3, 11: 3, 14: 2, 16: 1, 31: 1, 82: 1, 84: 1 },
  },
  {
    // Mazzo valido: 20 carte, forza 138/150
    id: '2',
    name: 'Muro di Pietra',
    cards: { 1: 2, 2: 3, 3: 2, 4: 2, 6: 2, 10: 3, 14: 1, 26: 2, 82: 1, 84: 1, 86: 1 },
  },
];
