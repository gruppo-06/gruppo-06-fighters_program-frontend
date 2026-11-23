import FighterCard from './FighterCard.jsx';
import './CardGrid.css';

/** Griglia responsive di carte. Riceve oggetti `fighter` (vedi toFighter in services/cards.js). */
export default function CardGrid({ cards }) {
  if (cards.length === 0) {
    return <p>Nessuna carta da mostrare.</p>;
  }

  return (
    <ul className="card-grid" role="list">
      {cards.map((card) => (
        <li key={card.number}>
          <FighterCard fighter={card} />
        </li>
      ))}
    </ul>
  );
}
