import FighterCard from '../../../components/FighterCard.jsx';
import Icon from '../../../components/Icon.jsx';
import { maxCopies } from './deckRules.js';

/**
 * Carta della collezione nell'editor del mazzo (Figma: MAZZI – cella carta).
 * Sotto la carta: indicatore "Nel mazzo n/max" e azione
 * - nessuna copia nel mazzo → "Aggiungi" (o il motivo per cui non si può)
 * - qualche copia → stepper − / + con la cella evidenziata
 * - limite di copie possedute o del regolamento raggiunto → carta attenuata e + disabilitato
 *
 * Il massimo è min(MAX_COPIES, copie possedute), con il limite di 1 per le Leggendarie.
 *
 * TODO: quando la carta sarà composta a layer (illustrazione, cornice di fazione, …)
 * basta sostituire <FighterCard> qui: il resto della cella non cambia.
 *
 * @param {object} card
 * @param {number} inDeck       copie già nel mazzo
 * @param {string|null} blockReason  motivo per cui non si può aggiungere (null = si può)
 */
export default function DeckCardCell({ card, inDeck, blockReason, onAdd, onRemove }) {
  const limit = maxCopies(card);
  const atLimit = inDeck >= limit;
  const canAdd = blockReason === null;

  const classes = [
    'deck-cell',
    inDeck > 0 && !atLimit && 'is-in-deck',
    atLimit && inDeck > 0 && 'is-maxed',
    !card.owned && 'is-missing',
  ]
    .filter(Boolean)
    .join(' ');

  let action;
  if (inDeck > 0) {
    action = (
      <div className="deck-stepper deck-stepper--cell">
        <button
          type="button"
          className="deck-stepper__button"
          onClick={onRemove}
          aria-label={`Togli una copia di ${card.name}`}
        >
          <Icon name="minus" size={16} />
        </button>
        <span className="deck-stepper__label">Nel mazzo</span>
        <button
          type="button"
          className="deck-stepper__button"
          onClick={onAdd}
          disabled={!canAdd}
          aria-label={`Aggiungi una copia di ${card.name}`}
          title={blockReason ?? undefined}
        >
          <Icon name="plus" size={16} />
        </button>
      </div>
    );
  } else if (canAdd) {
    action = (
      <button
        type="button"
        className="button deck-cell__add"
        onClick={onAdd}
        aria-label={`Aggiungi ${card.name} al mazzo`}
      >
        <Icon name="plus" size={14} />
        Aggiungi
      </button>
    );
  } else {
    action = <p className="deck-cell__reason">{blockReason}</p>;
  }

  return (
    <li className={classes}>
      <FighterCard fighter={card} owned={card.owned} className="deck-cell__card" />

      <div className="deck-cell__count">
        <span>Nel mazzo</span>
        <span className="deck-cell__pips" aria-hidden="true">
          {Array.from({ length: limit }, (_, i) => (
            <span key={i} className={i < inDeck ? 'is-filled' : undefined} />
          ))}
        </span>
        <span>
          <span aria-hidden="true">
            {inDeck}/{limit}
          </span>
          <span className="visually-hidden">
            {inDeck} su {limit}
          </span>
        </span>
      </div>

      {action}
    </li>
  );
}
