import './MeterStat.css';

/**
 * Etichetta + valore + barra di avanzamento (Figma: MeterStat + ProgressBar),
 * es. completamento della collezione per fazione.
 *
 * @param {string} label   es. "Oriente"
 * @param {number} value   es. 14
 * @param {number} max     es. 16
 */
export default function MeterStat({ label, value, max, className = '' }) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className={`meter-stat ${className}`.trim()}>
      <p className="meter-stat__label">{label}</p>
      <p className="meter-stat__value">
        {value}/{max}
      </p>
      <div
        className="meter-stat__bar"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
