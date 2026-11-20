import './CardBack.css';

/**
 * Dorso di una carta coperta con il logo "FP" (Figma: CardBack).
 * La larghezza si imposta dall'esterno (es. width: 5.5rem): il resto scala.
 */
export default function CardBack({ className = '' }) {
  return (
    <span className={`card-back ${className}`.trim()} aria-hidden="true">
      <span className="card-back__logo">FP</span>
    </span>
  );
}
