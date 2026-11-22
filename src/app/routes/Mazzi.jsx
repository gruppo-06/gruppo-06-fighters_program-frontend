/**
 * Elenco dei mazzi del giocatore (rotta /mazzi).
 * Carica i mazzi dal backend e, per i contatori e il tag di validità,
 * il dettaglio di ciascun mazzo. L'editor è in ./mazzi/MazzoEditor.jsx.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import MeterStat from '../../components/MeterStat.jsx';
import Tag from '../../components/Tag.jsx';
import { api } from '../../services/api.js';
import { toFighter } from '../../services/cards.js';
import { DECK_SIZE, MAX_POWER, NEW_DECK_ID, summarizeDeck } from './mazzi/deckRules.js';
import './Mazzi.css';

const LOAD_ERROR = 'Impossibile caricare i mazzi. Riprova più tardi.';
const DELETE_ERROR = 'Impossibile eliminare il mazzo. Riprova più tardi.';

/** Riepilogo locale di un dettaglio mazzo del backend. */
function summarizeDeckDetail(detail) {
  const cardsById = new Map();
  const cards = {};

  for (const card of detail.cards ?? []) {
    cardsById.set(String(card.cardId), toFighter(card));
    cards[String(card.cardId)] = card.copies;
  }

  return summarizeDeck(cards, cardsById);
}

export default function Mazzi() {
  // null finché non arrivano elenco e dettagli dal backend
  const [decks, setDecks] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const list = await api.get('/me/decks');
        const details = await Promise.allSettled(
          list.map((deck) => api.get(`/me/decks/${deck.id}`)),
        );
        if (cancelled) return;

        setDecks(
          list.map((deck, index) => ({
            ...deck,
            detail: details[index].status === 'fulfilled' ? details[index].value : null,
          })),
        );
        setLoadError(false);
      } catch {
        if (cancelled) return;
        setDecks([]);
        setLoadError(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function deleteDeck(deck) {
    if (deletingId !== null) return;
    if (!window.confirm(`Eliminare il mazzo "${deck.name}"? L'operazione non si può annullare.`)) {
      return;
    }

    setActionError(null);
    setDeletingId(deck.id);
    try {
      await api.delete(`/me/decks/${deck.id}`);
      setDecks((current) => current?.filter((item) => item.id !== deck.id) ?? []);
    } catch {
      setActionError(DELETE_ERROR);
    } finally {
      setDeletingId(null);
    }
  }

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

      {actionError && (
        <p className="decks__alert" role="alert">
          {actionError}
        </p>
      )}

      {loadError ? (
        <p className="decks__alert" role="alert">
          {LOAD_ERROR}
        </p>
      ) : decks === null ? (
        <p className="decks__status" role="status">
          Caricamento dei mazzi…
        </p>
      ) : decks.length === 0 ? (
        <p className="decks__empty">Non hai ancora creato nessun mazzo.</p>
      ) : (
        <ul className="decks__grid" role="list">
          {decks.map((deck) => {
            const summary = deck.detail ? summarizeDeckDetail(deck.detail) : null;
            const count = summary?.count ?? deck.cardCount ?? 0;

            return (
              <li key={deck.id} className="deck-tile">
                <div className="deck-tile__head">
                  <h2 className="deck-tile__name">{deck.name}</h2>
                  {summary ? (
                    <Tag tone={summary.valid ? 'success' : 'alert'}>
                      {summary.valid ? 'Valido' : 'Non valido'}
                    </Tag>
                  ) : (
                    <Tag tone="outline">
                      {count} {count === 1 ? 'carta' : 'carte'}
                    </Tag>
                  )}
                </div>

                <div
                  className={`deck-tile__meters ${summary ? '' : 'deck-tile__meters--single'}`.trim()}
                >
                  <MeterStat label="Carte" value={count} max={DECK_SIZE} />
                  {summary && (
                    <MeterStat
                      label="Forza"
                      value={summary.power}
                      max={MAX_POWER}
                      className={summary.power > MAX_POWER ? 'is-over' : ''}
                    />
                  )}
                </div>

                <div className="deck-tile__actions">
                  <Link className="button button--secondary" to={`/mazzi/${deck.id}`}>
                    <Icon name="edit" size={14} />
                    Modifica<span className="visually-hidden"> {deck.name}</span>
                  </Link>
                  <button
                    type="button"
                    className="button button--secondary"
                    onClick={() => deleteDeck(deck)}
                    disabled={deletingId === deck.id}
                    aria-label={`Elimina ${deck.name}`}
                  >
                    <Icon name="close" size={14} />
                    {deletingId === deck.id ? 'Eliminazione…' : 'Elimina'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
