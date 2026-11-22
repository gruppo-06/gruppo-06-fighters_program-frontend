/** I tuoi mazzi: elenco dei mazzi del giocatore e apertura dell'editor (Figma: MAZZI da definire). */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DeckEditor from '../../components/DeckEditor.jsx';
import { api } from '../../services/api.js';
import './Mazzi.css';

const LOAD_ERROR = 'Impossibile caricare i mazzi. Riprova più tardi.';
const DELETE_ERROR = 'Impossibile eliminare il mazzo. Riprova più tardi.';

const dateFormatter = new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium' });

const formatDate = (value) => dateFormatter.format(new Date(value));

export default function Mazzi() {
  // null finché non arriva la risposta del backend
  const [decks, setDecks] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [actionError, setActionError] = useState(null);
  // incrementato per ricaricare l'elenco dopo un salvataggio o un'eliminazione
  const [version, setVersion] = useState(0);
  // null: elenco; { deckId: null } → mazzo nuovo; { deckId } → modifica
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get('/me/decks').then(
      (data) => {
        if (cancelled) return;
        setDecks(data);
        setLoadError(false);
      },
      () => {
        if (cancelled) return;
        setDecks((current) => current ?? []);
        setLoadError(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [version]);

  async function deleteDeck(deck) {
    if (!window.confirm(`Eliminare il mazzo "${deck.name}"? L'operazione non si può annullare.`)) {
      return;
    }
    setActionError(null);
    try {
      await api.delete(`/me/decks/${deck.id}`);
      setVersion((current) => current + 1);
    } catch {
      setActionError(DELETE_ERROR);
    }
  }

  return (
    <div className="container mazzi">
      <header className="mazzi-header">
        <h1 className="mazzi-title">I tuoi mazzi</h1>
        {editing === null && (
          <button type="button" className="button" onClick={() => setEditing({ deckId: null })}>
            Nuovo mazzo
          </button>
        )}
      </header>

      {editing ? (
        <DeckEditor
          key={editing.deckId ?? 'new'}
          deckId={editing.deckId}
          onSaved={() => {
            setEditing(null);
            setVersion((current) => current + 1);
          }}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <DeckList
          decks={decks}
          loadError={loadError}
          actionError={actionError}
          onEdit={(deckId) => setEditing({ deckId })}
          onDelete={deleteDeck}
        />
      )}
    </div>
  );
}

function DeckList({ decks, loadError, actionError, onEdit, onDelete }) {
  if (loadError) {
    return (
      <p className="mazzi-alert" role="alert">
        {LOAD_ERROR}
      </p>
    );
  }

  if (decks === null) {
    return <p className="mazzi-status">Caricamento dei mazzi…</p>;
  }

  if (decks.length === 0) {
    return (
      <p className="mazzi-status">Non hai ancora nessun mazzo. Creane uno con “Nuovo mazzo”.</p>
    );
  }

  return (
    <>
      {actionError && (
        <p className="mazzi-alert" role="alert">
          {actionError}
        </p>
      )}
      <ul className="mazzi-list" role="list">
        {decks.map((deck) => (
          <li key={deck.id} className="mazzi-deck">
            <div>
              <p className="mazzi-deck__name">{deck.name}</p>
              <p className="mazzi-deck__meta">
                {deck.cardCount} carte · creato il {formatDate(deck.createdAt)}
              </p>
            </div>
            <div className="mazzi-deck__actions">
              <button
                type="button"
                className="button button--secondary"
                onClick={() => onEdit(deck.id)}
              >
                Modifica
              </button>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => onDelete(deck)}
              >
                Elimina
              </button>
              <Link className="button" to="/sfide">
                Sfida con questo mazzo
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
