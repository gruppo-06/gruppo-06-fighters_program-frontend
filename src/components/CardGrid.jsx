import Card from './Card.jsx';
import './CardGrid.css';

/** Griglia responsive di carte. */
export default function CardGrid({ cards }) {
  if (cards.length === 0) {
    return <p>Nessuna carta da mostrare.</p>;
  }

  return (
    <ul className="card-grid" role="list">
      {cards.map((card) => (
        <li key={card.id}>
          <Card card={card} />
        </li>
      ))}
    </ul>
  );
}
