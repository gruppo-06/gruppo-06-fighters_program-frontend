/**
 * Carte trovate in un pacchetto (Figma: APERTURA PACCHETTO, 249:9562).
 * Il risultato arriva dallo state della navigazione: ricaricando non si paga di nuovo.
 */
import { useEffect, useRef } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import FighterCard from '../../components/FighterCard.jsx';
import Tag from '../../components/Tag.jsx';
import './AperturaPacchetto.css';

const RARITIES = [
  { key: 'comune', one: 'comune', many: 'comuni' },
  { key: 'rara', one: 'rara', many: 'rare' },
  { key: 'epica', one: 'epica', many: 'epiche' },
  { key: 'leggendaria', one: 'leggendaria', many: 'leggendarie' },
];

// Il ventaglio del mockup è disegnato per 5 carte; con altre quantità si usa una griglia
const FAN_SIZE = 5;

/** Es. "3 comuni", "1 epica · nuova". */
function summarize(cards) {
  return RARITIES.flatMap(({ key, one, many }) => {
    const found = cards.filter((card) => card.rarity === key);
    if (!found.length) return [];
    const label = `${found.length} ${found.length === 1 ? one : many}`;
    const added = found.filter((card) => card.isNew).length;
    const news = added === 1 ? 'nuova' : 'nuove';
    return [{ key, label: added ? `${label} · ${news}` : label }];
  });
}

export default function AperturaPacchetto() {
  const opening = useLocation().state?.opening;

  if (!opening) return <Navigate to="/negozio" replace />;

  // La key azzera il focus a ogni nuova apertura
  return <Apertura key={opening.id} opening={opening} />;
}

function Apertura({ opening }) {
  const { pack, cards } = opening;
  const titleRef = useRef(null);
  const layout = cards.length === FAN_SIZE ? 'fan' : 'grid';

  useEffect(() => {
    window.scrollTo(0, 0);
    titleRef.current.focus({ preventScroll: true });
  }, []);

  return (
    <main className="pack-opening">
      <p className="eyebrow">{pack.name} · aperto</p>
      <h1 ref={titleRef} className="pack-opening__title" tabIndex={-1}>
        {cards.length} carte per te
      </h1>

      <ul
        className={`pack-opening__cards pack-opening__cards--${layout}`}
        role="list"
        aria-label="Carte trovate"
      >
        {cards.map((card, index) => (
          <li key={index} className={`pack-opening__card pack-opening__card--${card.rarity}`}>
            <FighterCard fighter={card} />
          </li>
        ))}
      </ul>

      <ul className="pack-opening__summary" role="list" aria-label="Riepilogo rarità">
        {summarize(cards).map(({ key, label }) => (
          <li key={key}>
            <Tag tone={key}>{label}</Tag>
          </li>
        ))}
      </ul>

      <div className="pack-opening__actions">
        <Link className="button button--lg" to="/negozio">
          Apri un altro pacchetto
        </Link>
        <Link className="button button--secondary button--lg" to="/collezione">
          Vai alla collezione
        </Link>
      </div>
    </main>
  );
}
