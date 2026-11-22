import Icon from '../../../components/Icon.jsx';
import Tag from '../../../components/Tag.jsx';
import { COMPOSITION, DECK_SIZE, isLegendary } from './deckRules.js';

/**
 * Pannello "Il tuo mazzo" (Figma: MAZZI – Passo 2): totale, problemi,
 * composizione per rarità, elenco carte con stepper e salvataggio.
 *
 * @param {{ card, count }[]} entries   righe del mazzo (vedi deckEntries)
 * @param {object} summary              risultato di summarizeDeck
 * @param {(card) => string|null} getBlockReason  motivo per cui non si può aggiungere
 * @param {boolean} saved  true subito dopo un salvataggio, finché il mazzo non cambia
 */
export default function DeckPanel({
  entries,
  summary,
  getBlockReason,
  onAdd,
  onRemove,
  onSave,
  saved,
}) {
  const fighters = entries.filter(({ card }) => card.rarity !== 'effetto');
  const effects = entries.filter(({ card }) => card.rarity === 'effetto');
  const fighterCount = fighters.reduce((sum, { count }) => sum + count, 0);
  const effectCount = summary.count - fighterCount;
  const { problems, valid } = summary;

  return (
    <aside className="deck-panel" aria-labelledby="deck-panel-title">
      <header className="deck-panel__header">
        <div>
          <p className="eyebrow">Passo 2 · Il tuo mazzo</p>
          <h2 id="deck-panel-title" className="deck-panel__total">
            {summary.count}
            <span className="deck-panel__of"> / {DECK_SIZE} carte</span>
          </h2>
        </div>
        <Tag tone={valid ? 'success' : 'alert'}>{valid ? 'Valido' : 'Non valido'}</Tag>
      </header>

      {problems.length > 0 && (
        <ul className="deck-panel__problems" role="list" aria-label="Problemi del mazzo">
          {problems.map((problem) => (
            <li key={problem}>
              <Icon name="alert" size={18} />
              {problem}
            </li>
          ))}
        </ul>
      )}

      <section className="deck-panel__section" aria-labelledby="deck-composition-title">
        <h3 id="deck-composition-title" className="deck-panel__heading">
          Composizione
        </h3>
        <dl className="deck-panel__composition">
          {COMPOSITION.map(({ rarity, label }) => (
            <div key={rarity}>
              <dt>{label}</dt>
              <dd>{summary.composition[rarity]}</dd>
            </div>
          ))}
        </dl>
      </section>

      {entries.length === 0 ? (
        <p className="deck-panel__empty">Il mazzo è vuoto: aggiungi le carte dalla collezione.</p>
      ) : (
        <>
          <DeckList
            id="deck-fighters-title"
            title={`Fighter · ${fighterCount}`}
            entries={fighters}
            getBlockReason={getBlockReason}
            onAdd={onAdd}
            onRemove={onRemove}
          />
          <DeckList
            id="deck-effects-title"
            title={`Carte effetto · ${effectCount}`}
            entries={effects}
            getBlockReason={getBlockReason}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        </>
      )}

      <div className="deck-panel__footer">
        <button
          type="button"
          className="button button--lg deck-panel__save"
          onClick={onSave}
          disabled={!valid}
          aria-describedby={valid ? undefined : 'deck-panel-hint'}
        >
          Salva mazzo
        </button>
        {!valid && (
          <p id="deck-panel-hint" className="deck-panel__hint">
            <Icon name="alert" size={16} />
            {problems.length === 1
              ? 'Risolvi il problema per salvare il mazzo.'
              : `Risolvi i ${problems.length} problemi per salvare il mazzo.`}
          </p>
        )}
        <p className="deck-panel__saved" role="status">
          {saved && (
            <>
              <Icon name="check" size={16} />
              Mazzo salvato
            </>
          )}
        </p>
      </div>
    </aside>
  );
}

function DeckList({ id, title, entries, getBlockReason, onAdd, onRemove }) {
  if (entries.length === 0) return null;

  return (
    <section className="deck-panel__section" aria-labelledby={id}>
      <h3 id={id} className="deck-panel__heading">
        {title}
      </h3>
      <ul className="deck-list" role="list">
        {entries.map(({ card, count }) => {
          const blockReason = getBlockReason(card);
          const meta =
            card.rarity === 'effetto'
              ? 'Carta Effetto'
              : [card.region, card.role, isLegendary(card) && 'abilità unica']
                  .filter(Boolean)
                  .join(' · ');

          return (
            <li key={card.id} className={`deck-list__item deck-list__item--${card.rarity}`}>
              <div className="deck-list__text">
                <p className="deck-list__name">{card.name}</p>
                <p className="deck-list__meta">{meta}</p>
              </div>
              <div className="deck-stepper">
                <button
                  type="button"
                  className="deck-stepper__button"
                  onClick={() => onRemove(card)}
                  aria-label={`Togli una copia di ${card.name}`}
                >
                  <Icon name="minus" size={16} />
                </button>
                <span className="deck-stepper__count">
                  <span aria-hidden="true">×{count}</span>
                  <span className="visually-hidden">
                    {count} {count === 1 ? 'copia' : 'copie'}
                  </span>
                </span>
                <button
                  type="button"
                  className="deck-stepper__button"
                  onClick={() => onAdd(card)}
                  disabled={blockReason !== null}
                  aria-label={`Aggiungi una copia di ${card.name}`}
                  title={blockReason ?? undefined}
                >
                  <Icon name="plus" size={16} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
