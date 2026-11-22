/**
 * Isola React della pagina catalogo.html.
 * Carica le carte pubbliche dal backend e le mostra filtrabili per fazione
 * dentro <div id="catalogo-root">.
 */
import { useEffect, useState } from 'react';
import CardGrid from '../components/CardGrid.jsx';
import Chip from '../components/Chip.jsx';
import { api } from '../services/api.js';
import { FACTIONS, toFighter } from '../services/cards.js';
import { mountIsland } from './mountIsland.jsx';

const ALL = '';

export default function Catalogo() {
  // null finché non arriva la risposta del backend
  const [cards, setCards] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [faction, setFaction] = useState(ALL);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/cards?size=100')
      .then((page) => !cancelled && setCards(page.content.map((card) => toFighter(card))))
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    return (
      <p className="catalog-status" role="alert">
        Impossibile caricare il catalogo. Riprova più tardi.
      </p>
    );
  }

  if (!cards) {
    return (
      <p className="catalog-status" aria-live="polite">
        Caricamento del catalogo…
      </p>
    );
  }

  const visibleCards = cards.filter((card) => !faction || card.faction === faction);

  return (
    <>
      <div className="catalog-filters" role="group" aria-label="Fazione">
        <Chip selected={faction === ALL} onClick={() => setFaction(ALL)}>
          Tutte
        </Chip>
        {FACTIONS.map((name) => (
          <Chip key={name} selected={faction === name} onClick={() => setFaction(name)}>
            {name}
          </Chip>
        ))}
      </div>
      <CardGrid cards={visibleCards} />
    </>
  );
}

mountIsland('catalogo-root', <Catalogo />);
