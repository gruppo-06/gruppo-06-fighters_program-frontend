import { useState } from 'react';
import Icon from '../../../components/Icon.jsx';
import Tag from '../../../components/Tag.jsx';
import SubcardPicker from './SubcardPicker.jsx';
import {
  COMPOSITION,
  DECK_SIZE,
  changedStats,
  isLegendary,
  modifiedStats,
  subcardSlots,
} from './deckRules.js';

/**
 * Pannello "Il tuo mazzo" (Figma: MAZZI – Passo 2): totale, problemi locali,
 * verifica del server, composizione per rarità, elenco carte con stepper,
 * sottocarte e salvataggio.
 *
 * @param {{ card, count }[]} entries   righe del mazzo (vedi deckEntries)
 * @param {object} summary              risultato di summarizeDeck
 * @param {(card) => string|null} getBlockReason  motivo per cui non si può aggiungere
 * @param {object[]} subcardCatalog     sottocarte di GET /subcards
 * @param {(card) => string[]} subcardsOf  codici delle sottocarte applicate alla carta
 * @param {(card, code) => void} onAddSubcard
 * @param {(card, code) => void} onRemoveSubcard
 * @param {{ status: 'pending'|'valid'|'invalid'|'error', violations?: { code, message }[] }} validation
 * @param {boolean} canSave  il server considera valido il mazzo e il nome non è vuoto
 * @param {boolean} nameMissing  il nome del mazzo è vuoto
 * @param {boolean} saving
 * @param {{ message: string, details: string[] }|null} saveError
 */
export default function DeckPanel({
  entries,
  summary,
  getBlockReason,
  onAdd,
  onRemove,
  subcardCatalog,
  subcardsOf,
  onAddSubcard,
  onRemoveSubcard,
  onSave,
  validation,
  canSave,
  nameMissing,
  saving,
  saveError,
}) {
  const { problems } = summary;
  const violations = validation.violations ?? [];
  const pending = validation.status === 'pending';
  const error = validation.status === 'error';
  const valid = validation.status === 'valid';

  const tag = pending
    ? { tone: 'neutral', label: 'Verifica…' }
    : valid
      ? { tone: 'success', label: 'Valido' }
      : error
        ? { tone: 'alert', label: 'Non verificato' }
        : { tone: 'alert', label: 'Non valido' };

  let hint = 'Risolvi i problemi per salvare il mazzo.';
  if (nameMissing) hint = 'Dai un nome al mazzo per salvarlo.';
  else if (pending) hint = 'Verifica del mazzo in corso…';
  else if (error) hint = 'Attendi la verifica del mazzo per salvare.';

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
        <Tag tone={tag.tone}>{tag.label}</Tag>
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

      <section
        className="deck-panel__section"
        aria-labelledby="deck-validation-title"
        aria-live="polite"
      >
        <h3 id="deck-validation-title" className="deck-panel__heading">
          Verifica del server
        </h3>
        {pending && <p className="deck-panel__validation-status">Verifica del mazzo in corso…</p>}
        {error && (
          <p className="deck-panel__validation-status" role="alert">
            Impossibile verificare il mazzo. Riprova tra poco.
          </p>
        )}
        {valid && <p className="deck-panel__valid">Il mazzo è valido.</p>}
        {!pending && !error && violations.length > 0 && (
          <ul
            className="deck-panel__violations"
            role="list"
            aria-label="Violazioni segnalate dal server"
          >
            {violations.map((violation) => (
              <li key={`${violation.code}-${violation.message}`}>{violation.message}</li>
            ))}
          </ul>
        )}
      </section>

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
        <p className="deck-panel__note">
          Le sottocarte modificano le statistiche solo nella modalità avanzata.
        </p>
      </section>

      {entries.length === 0 ? (
        <p className="deck-panel__empty">Il mazzo è vuoto: aggiungi le carte dalla collezione.</p>
      ) : (
        <DeckList
          id="deck-fighters-title"
          title={`Fighter · ${summary.count}`}
          entries={entries}
          getBlockReason={getBlockReason}
          onAdd={onAdd}
          onRemove={onRemove}
          subcardCatalog={subcardCatalog}
          subcardsOf={subcardsOf}
          onAddSubcard={onAddSubcard}
          onRemoveSubcard={onRemoveSubcard}
        />
      )}

      <div className="deck-panel__footer">
        <button
          type="button"
          className="button button--lg deck-panel__save"
          onClick={onSave}
          disabled={!canSave}
          aria-describedby={!canSave && !saving ? 'deck-panel-hint' : undefined}
        >
          {saving ? 'Salvataggio…' : 'Salva mazzo'}
        </button>
        {!canSave && !saving && (
          <p id="deck-panel-hint" className="deck-panel__hint">
            <Icon name="alert" size={16} />
            {hint}
          </p>
        )}

        {saveError && (
          <div className="deck-panel__alert" role="alert">
            <p>{saveError.message}</p>
            {saveError.details.length > 0 && (
              <ul role="list">
                {saveError.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

function DeckList({
  id,
  title,
  entries,
  getBlockReason,
  onAdd,
  onRemove,
  subcardCatalog,
  subcardsOf,
  onAddSubcard,
  onRemoveSubcard,
}) {
  if (entries.length === 0) return null;

  return (
    <section className="deck-panel__section" aria-labelledby={id}>
      <h3 id={id} className="deck-panel__heading">
        {title}
      </h3>
      <ul className="deck-list" role="list">
        {entries.map(({ card, count }) => {
          const blockReason = getBlockReason(card);
          const meta = [card.region, card.role, isLegendary(card) && 'abilità unica']
            .filter(Boolean)
            .join(' · ');
          const codes = subcardsOf(card);
          const applied = codes
            .map((code) => subcardCatalog.find((subcard) => subcard.code === code))
            .filter(Boolean);
          const changes = changedStats(card.stats, modifiedStats(card.stats, applied));

          return (
            <li key={card.cardId} className={`deck-list__item deck-list__item--${card.rarity}`}>
              <div className="deck-list__text">
                <p className="deck-list__name">{card.name}</p>
                <p className="deck-list__meta">{meta}</p>
                {changes.length > 0 && (
                  <p className="deck-list__stats">
                    {changes.map(({ label, from, to }) => `${label} ${from} → ${to}`).join(' · ')}
                  </p>
                )}
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

              <SubcardSlots
                card={card}
                codes={codes}
                catalog={subcardCatalog}
                onAdd={(code) => onAddSubcard(card, code)}
                onRemove={(code) => onRemoveSubcard(card, code)}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * Slot delle sottocarte di una carta del mazzo: quelli occupati mostrano il nome
 * con il pulsante per toglierla, quelli liberi aprono la scelta. Le leggendarie non hanno slot.
 */
function SubcardSlots({ card, codes, catalog, onAdd, onRemove }) {
  const [picking, setPicking] = useState(false);
  const slots = subcardSlots(card);

  if (slots === 0) {
    return (
      <p className="deck-list__subcards-note">
        Nessuna sottocarta: le leggendarie hanno un'abilità speciale (in arrivo)
      </p>
    );
  }

  const free = Math.max(0, slots - codes.length);

  return (
    <div className="deck-list__subcards">
      <ul className="subcard-slots" role="list" aria-label={`Sottocarte di ${card.name}`}>
        {codes.map((code) => {
          const name = catalog.find((subcard) => subcard.code === code)?.name ?? code;
          return (
            <li key={code} className="subcard-chip">
              <span>{name}</span>
              <button
                type="button"
                className="subcard-chip__remove"
                onClick={() => onRemove(code)}
                aria-label={`Togli ${name} da ${card.name}`}
              >
                <Icon name="close" size={12} />
              </button>
            </li>
          );
        })}
        {Array.from({ length: free }, (_, i) => (
          <li key={`free-${i}`}>
            <button
              type="button"
              className="subcard-chip subcard-chip--empty"
              onClick={() => setPicking((open) => !open)}
              aria-expanded={picking}
              aria-label={`Aggiungi una sottocarta a ${card.name}`}
            >
              <Icon name="plus" size={12} />
              Sottocarta
            </button>
          </li>
        ))}
      </ul>

      {picking && free > 0 && (
        <SubcardPicker
          cardName={card.name}
          catalog={catalog}
          taken={codes}
          onPick={(code) => {
            onAdd(code);
            setPicking(false);
          }}
          onClose={() => setPicking(false)}
        />
      )}
    </div>
  );
}
