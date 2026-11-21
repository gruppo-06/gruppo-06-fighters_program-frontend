import Icon from './Icon.jsx';
import './Chip.css';

/**
 * Filtro a pillola (Figma: Chip).
 * `selected` lo evidenzia e lo segnala agli screen reader con aria-pressed.
 */
export default function Chip({ selected = false, onClick, children }) {
  return (
    <button
      type="button"
      className={`chip ${selected ? 'chip--selected' : ''}`.trim()}
      aria-pressed={selected}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/**
 * Variante a tendina del Chip (Figma: Chip con menuATendina):
 * un <select> nativo con l'aspetto del chip, es. "Mostra: tutti".
 *
 * @param {string} prefix   testo visibile prima del valore (es. "Mostra:")
 * @param {string} label    etichetta per screen reader
 * @param {{value: string, label: string}[]} options
 */
export function ChipSelect({ prefix, label, value, options, onChange }) {
  const current = options.find((option) => option.value === value);
  return (
    <label className="chip chip--select">
      <span className="visually-hidden">{label}</span>
      <span aria-hidden="true">
        {prefix} {current?.label.toLowerCase()}
      </span>
      <Icon name="chevron-down" size={14} />
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
