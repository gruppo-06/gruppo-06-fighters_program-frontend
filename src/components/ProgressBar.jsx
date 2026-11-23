/**
 * Barra di avanzamento (Figma: ProgressBar).
 * Usa gli stili globali .progress-bar di src/styles/components/trophy.css,
 * condivisi con le pagine statiche.
 *
 * @param {number} value  percentuale 0-100
 * @param {string} [label] descrizione per screen reader (es. "Avanzamento: 4 su 5")
 */
export default function ProgressBar({ value, label, className = '' }) {
  const percent = Math.min(100, Math.max(0, value));
  return (
    <div
      className={`progress-bar ${className}`.trim()}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      aria-label={label}
    >
      <span className="progress-bar__fill" style={{ '--value': `${percent}%` }} />
    </div>
  );
}
