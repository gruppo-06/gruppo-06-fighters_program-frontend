import Icon from './Icon.jsx';
import './Chip.css';

/**
 * Chip di filtro (Figma: Chip, state=default|selected).
 * Bottone a commutazione: `aria-pressed` riflette lo stato selezionato.
 */
export default function Chip({ selected = false, className = '', children, ...rest }) {
  return (
    <button
      type="button"
      className={`chip ${selected ? 'is-selected' : ''} ${className}`.trim()}
      aria-pressed={selected}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * Chip con menu a tendina (Figma: Chip, menuATendina=true).
 * Una <select> nativa trasparente copre il chip: il chip mostra l'etichetta
 * (es. "Rarità") o, se è scelto un valore diverso da `emptyValue`, quel valore,
 * e in quel caso appare selezionato.
 *
 * @param {string} label  nome del filtro (es. "Rarità")
 * @param {{ value: string, label: string }[]} options
 */
export function ChipSelect({ label, value, options, onChange, emptyValue = '', className = '' }) {
  const selected = value !== emptyValue;
  const current = options.find((option) => option.value === value);

  return (
    <span className={`chip chip--select ${selected ? 'is-selected' : ''} ${className}`.trim()}>
      <span aria-hidden="true">{selected ? current?.label : label}</span>
      <Icon name="chevron-down" size={14} />
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.value === emptyValue ? `${label}: ${option.label}` : option.label}
          </option>
        ))}
      </select>
    </span>
  );
}
