/**
 * Elenco dei mazzi del giocatore (rotta /mazzi).
 * TODO: non esiste ancora un mockup Figma di questa schermata: layout provvisorio,
 * da allineare al design quando sarà disponibile. L'editor è in ./mazzi/MazzoEditor.jsx.
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import MeterStat from '../../components/MeterStat.jsx';
import Tag from '../../components/Tag.jsx';
import { mockCollection } from '../../data/mockCollection.js';
import { mockDecks } from '../../data/mockDecks.js';
import { DECK_SIZE, MAX_POWER, NEW_DECK_ID, summarizeDeck } from './mazzi/deckRules.js';
import './Mazzi.css';

export default function Mazzi() {
  // TODO: caricare mazzi e collezione dal backend (es. api.get('/decks')) quando l'endpoint esiste
  const decks = mockDecks;
  const collection = mockCollection;

  const cardsById = useMemo(() => new Map(collection.map((card) => [card.id, card])), [collection]);

  return (
    <div className="container decks">
      <header className="decks__header">
        <div className="section-header">
          <p className="eyebrow">Mazzi</p>
          <h1 className="decks__title">I miei mazzi</h1>
        </div>
        <Link className="button" to={`/mazzi/${NEW_DECK_ID}`}>
          <Icon name="plus" size={14} />
          Nuovo mazzo
        </Link>
      </header>

      {decks.length === 0 ? (
        <p className="decks__empty">Non hai ancora creato nessun mazzo.</p>
      ) : (
        <ul className="decks__grid" role="list">
          {decks.map((deck) => {
            const summary = summarizeDeck(deck.cards, cardsById);
            return (
              <li key={deck.id} className="deck-tile">
                <div className="deck-tile__head">
                  <h2 className="deck-tile__name">{deck.name}</h2>
                  <Tag tone={summary.valid ? 'success' : 'alert'}>
                    {summary.valid ? 'Valido' : 'Non valido'}
                  </Tag>
                </div>
                <div className="deck-tile__meters">
                  <MeterStat label="Carte" value={summary.count} max={DECK_SIZE} />
                  <MeterStat
                    label="Forza"
                    value={summary.power}
                    max={MAX_POWER}
                    className={summary.power > MAX_POWER ? 'is-over' : ''}
                  />
                </div>
                <Link className="button button--secondary deck-tile__edit" to={`/mazzi/${deck.id}`}>
                  <Icon name="edit" size={14} />
                  Modifica<span className="visually-hidden"> {deck.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
