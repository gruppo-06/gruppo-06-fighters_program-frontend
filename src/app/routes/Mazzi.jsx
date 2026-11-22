/** I tuoi mazzi: elenco dei mazzi del giocatore, editor in arrivo (Figma: MAZZI da definire). */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Placeholder from '../../components/Placeholder.jsx';
import { api } from '../../services/api.js';

const LOAD_ERROR = 'Impossibile caricare i mazzi. Riprova più tardi.';

const dateFormatter = new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium' });

const formatDate = (value) => dateFormatter.format(new Date(value));

export default function Mazzi() {
  // null finché non arriva la risposta del backend
  const [decks, setDecks] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get('/me/decks').then(
      (data) => !cancelled && setDecks(data),
      () => {
        if (cancelled) return;
        setDecks([]);
        setLoadError(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container placeholder-page">
      <h1 className="placeholder-page__title">I tuoi mazzi</h1>

      <Placeholder
        eyebrow="Mazzi"
        title="Editor dei mazzi in arrivo"
        description="Qui potrai costruire mazzi da 10 carte rispettando le regole: massimo 2 copie della stessa carta, massimo 2 carte Epiche e 1 Leggendaria. Per ora puoi vedere i mazzi che hai già."
      >
        <DeckList decks={decks} loadError={loadError} />
      </Placeholder>
    </div>
  );
}

function DeckList({ decks, loadError }) {
  if (loadError) {
    return (
      <p className="placeholder-alert" role="alert">
        {LOAD_ERROR}
      </p>
    );
  }

  if (decks === null) {
    return <p className="placeholder-status">Caricamento dei mazzi…</p>;
  }

  if (decks.length === 0) {
    return <p className="placeholder-status">Non hai ancora nessun mazzo.</p>;
  }

  return (
    <ul className="placeholder-list" role="list">
      {decks.map((deck) => (
        <li key={deck.id} className="placeholder-list__item">
          <div>
            <p className="placeholder-list__name">{deck.name}</p>
            <p className="placeholder-list__meta">
              {deck.cardCount} carte · creato il {formatDate(deck.createdAt)}
            </p>
          </div>
          <Link className="button button--secondary" to="/sfide">
            Usa nelle sfide
          </Link>
        </li>
      ))}
    </ul>
  );
}
