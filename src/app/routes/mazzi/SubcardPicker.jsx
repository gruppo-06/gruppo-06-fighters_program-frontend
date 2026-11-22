import Icon from '../../../components/Icon.jsx';
import { subcardEffects } from './deckRules.js';
import './SubcardPicker.css';

/**
 * Scelta di una sottocarta per uno slot libero di una carta del mazzo.
 * Elenca le sottocarte non ancora applicate alla carta, con i loro effetti in percentuale.
 *
 * @param {string} cardName     nome della carta (per il titolo accessibile)
 * @param {object[]} catalog    sottocarte di GET /subcards
 * @param {string[]} taken      codici già applicati alla carta
 * @param {(code: string) => void} onPick
 * @param {() => void} onClose
 */
export default function SubcardPicker({ cardName, catalog, taken, onPick, onClose }) {
  const options = catalog.filter((subcard) => !taken.includes(subcard.code));

  return (
    <div
      className="subcard-picker"
      role="dialog"
      aria-label={`Sottocarte di ${cardName}`}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
    >
      <div className="subcard-picker__header">
        <p className="subcard-picker__title">Scegli una sottocarta</p>
        <button
          type="button"
          className="subcard-picker__close"
          onClick={onClose}
          aria-label="Chiudi"
        >
          <Icon name="close" size={14} />
        </button>
      </div>

      {options.length === 0 ? (
        <p className="subcard-picker__empty">Nessuna sottocarta disponibile.</p>
      ) : (
        <ul className="subcard-picker__list" role="list">
          {options.map((subcard) => (
            <li key={subcard.code}>
              <button
                type="button"
                className="subcard-picker__option"
                onClick={() => onPick(subcard.code)}
              >
                <span className="subcard-picker__name">{subcard.name}</span>
                <span className="subcard-picker__description">{subcard.description}</span>
                <SubcardEffects subcard={subcard} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Effetti su ATK/DEF/VEL/CRT in percentuale, es. "ATK +12% · VEL −8%". */
function SubcardEffects({ subcard }) {
  const effects = subcardEffects(subcard);
  if (effects.length === 0) return null;

  return (
    <span className="subcard-picker__effects">
      {effects.map(({ key, label, value }, i) => (
        <span key={key} className={value > 0 ? 'is-up' : 'is-down'}>
          {i > 0 && ' · '}
          {`${label} ${value > 0 ? '+' : '−'}${Math.abs(value)}%`}
        </span>
      ))}
    </span>
  );
}
