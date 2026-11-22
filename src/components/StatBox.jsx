import './StatBox.css';

/** Riquadro con un numero grande e la sua etichetta (Figma: StatBox, layout valore-sopra). */
export default function StatBox({ value, label, className = '' }) {
  return (
    <div className={`stat-box ${className}`.trim()}>
      <p className="stat-box__value">{value}</p>
      <p className="stat-box__label">{label}</p>
    </div>
  );
}
