/** Editor del mazzo: costruzione di un mazzo nuovo o esistente con le carte della collezione. */
import { useEffect, useId, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { FACTIONS, RARITIES, toFighter } from '../services/cards.js';
import Chip, { ChipSelect } from './Chip.jsx';
import FighterCard from './FighterCard.jsx';
import Icon from './Icon.jsx';
import { RARITY_LABELS } from './rarity.js';
import Tag from './Tag.jsx';
import './DeckEditor.css';

const DECK_SIZE = 10;
const MAX_COPIES = 2;
const MAX_EPIC = 2;
const MAX_LEGENDARY = 1;
const POINT_BUDGET = 18;
const POINTS = { comune: 1, rara: 2, epica: 3, leggendaria: 5 };
const NAME_MAX_LENGTH = 50;
const VALIDATION_DELAY = 300;

const ALL = '';
const RARITY_OPTIONS = [
  { value: ALL, label: 'Tutte' },
  ...RARITIES.map((rarity) => ({ value: rarity, label: RARITY_LABELS[rarity] })),
];

const LOAD_ERROR = 'Impossibile caricare il mazzo. Riprova più tardi.';
const CHECK_ERROR = 'Impossibile verificare il mazzo. Riprova tra poco.';
const SAVE_ERROR = 'Impossibile salvare il mazzo. Riprova più tardi.';
const FULL_ERROR = 'Hai raggiunto il numero massimo di mazzi.';

/** Regole mostrate come checklist: `ok` è calcolato dal client solo per il colore, il server resta la fonte di verità. */
function checklistOf({ total, epic, legendary, points, entries }) {
  return [
    { label: `${DECK_SIZE} carte`, ok: total === DECK_SIZE },
    {
      label: `Massimo ${MAX_COPIES} copie per carta`,
      ok: entries.every(({ copies }) => copies <= MAX_COPIES),
    },
    { label: `Massimo ${MAX_EPIC} carte Epiche`, ok: epic <= MAX_EPIC },
    { label: `Massimo ${MAX_LEGENDARY} carta Leggendaria`, ok: legendary <= MAX_LEGENDARY },
    { label: `Massimo ${POINT_BUDGET} punti`, ok: points <= POINT_BUDGET },
  ];
}

function saveErrorOf(failure) {
  if (failure.status === 422) {
    return { message: 'Il mazzo non è valido.', details: failure.data?.details ?? [] };
  }
  if (failure.status === 409) return { message: FULL_ERROR, details: [] };
  return { message: SAVE_ERROR, details: [] };
}

/**
 * Editor del mazzo (Figma: MAZZI da definire).
 * `deckId` nullo → mazzo nuovo; altrimenti il mazzo viene caricato e modificato.
 * `onSaved` è chiamato dopo il salvataggio, `onCancel` alla chiusura senza salvare.
 */
export default function DeckEditor({ deckId = null, onSaved, onCancel }) {
  const titleId = useId();
  const nameId = useId();

  // null finché non arrivano le risposte del backend
  const [collection, setCollection] = useState(null);
  const [deckCards, setDeckCards] = useState([]);
  const [loadError, setLoadError] = useState(false);

  const [name, setName] = useState('');
  // cardId → copie nel mazzo; le carte con 0 copie non sono nella mappa
  const [copies, setCopies] = useState(() => new Map());
  const [faction, setFaction] = useState(ALL);
  const [rarity, setRarity] = useState(ALL);

  // risultato dell'ultima verifica, con la chiave delle carte a cui si riferisce
  const [check, setCheck] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get('/me/collection?size=100'),
      deckId ? api.get(`/me/decks/${deckId}`) : null,
    ]).then(
      ([collectionPage, deck]) => {
        if (cancelled) return;
        setCollection(collectionPage.content);
        if (deck) {
          setName(deck.name);
          setDeckCards(deck.cards);
          setCopies(new Map(deck.cards.map((card) => [card.cardId, card.copies])));
        }
      },
      () => !cancelled && setLoadError(true),
    );
    return () => {
      cancelled = true;
    };
  }, [deckId]);

  const cardById = useMemo(() => {
    const byId = new Map(deckCards.map((card) => [card.cardId, card]));
    collection?.forEach((card) => byId.set(card.cardId, card));
    return byId;
  }, [collection, deckCards]);

  const entries = useMemo(
    () =>
      [...copies]
        .map(([cardId, count]) => ({ cardId, copies: count, card: cardById.get(cardId) }))
        .filter((entry) => entry.card),
    [copies, cardById],
  );

  const total = entries.reduce((sum, entry) => sum + entry.copies, 0);
  const epic = countCopies(entries, 'epica');
  const legendary = countCopies(entries, 'leggendaria');
  const points = entries.reduce(
    (sum, entry) => sum + entry.copies * (POINTS[toFighter(entry.card).rarity] ?? 0),
    0,
  );
  const checklist = checklistOf({ total, epic, legendary, points, entries });

  // payload ordinato: la chiave cambia solo quando cambia il contenuto del mazzo
  const cardsKey = JSON.stringify(
    entries
      .map(({ cardId, copies: count }) => ({ cardId, copies: count }))
      .sort((a, b) => String(a.cardId).localeCompare(String(b.cardId))),
  );
  const ready = collection !== null;

  useEffect(() => {
    if (!ready) return undefined;
    let cancelled = false;
    const timer = setTimeout(() => {
      api.post('/me/decks/validate', { cards: JSON.parse(cardsKey) }).then(
        (result) =>
          !cancelled &&
          setCheck({ key: cardsKey, valid: result.valid, violations: result.violations ?? [] }),
        () => !cancelled && setCheck({ key: cardsKey, error: true }),
      );
    }, VALIDATION_DELAY);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [ready, cardsKey]);

  const isChecked = check?.key === cardsKey;
  const isValid = isChecked && check.valid === true;
  const trimmedName = name.trim();
  const canSave = isValid && trimmedName.length > 0 && !saving;

  function changeCopies(cardId, delta) {
    setCopies((current) => {
      const next = new Map(current);
      const count = (current.get(cardId) ?? 0) + delta;
      if (count > 0) {
        next.set(cardId, count);
      } else {
        next.delete(cardId);
      }
      return next;
    });
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);
    const body = { name: trimmedName, cards: JSON.parse(cardsKey) };
    try {
      if (deckId) {
        await api.put(`/me/decks/${deckId}`, body);
      } else {
        await api.post('/me/decks', body);
      }
      onSaved();
    } catch (failure) {
      setSaveError(saveErrorOf(failure));
      setSaving(false);
    }
  }

  const visibleCards = (collection ?? []).filter(
    (card) =>
      (!faction || card.faction === faction) && (!rarity || toFighter(card).rarity === rarity),
  );

  return (
    <section className="deck-editor" aria-labelledby={titleId}>
      <header className="deck-editor__header">
        <p className="eyebrow">{deckId ? 'Modifica mazzo' : 'Nuovo mazzo'}</p>
        <h2 id={titleId} className="deck-editor__title">
          {deckId ? 'Modifica il mazzo' : 'Crea un mazzo'}
        </h2>
      </header>

      {loadError ? (
        <p className="deck-editor__alert" role="alert">
          {LOAD_ERROR}
        </p>
      ) : !ready ? (
        <p className="deck-editor__status">Caricamento del mazzo…</p>
      ) : (
        <form className="deck-editor__form" onSubmit={save}>
          <label className="deck-editor__field" htmlFor={nameId}>
            <span>Nome del mazzo</span>
            <input
              id={nameId}
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={NAME_MAX_LENGTH}
              autoComplete="off"
              required
            />
          </label>

          <div className="deck-editor__body">
            <div className="deck-editor__collection">
              <div className="deck-editor__filters" role="group" aria-label="Filtra le carte">
                <Chip selected={faction === ALL} onClick={() => setFaction(ALL)}>
                  Tutte
                </Chip>
                {FACTIONS.map((name) => (
                  <Chip key={name} selected={faction === name} onClick={() => setFaction(name)}>
                    {name}
                  </Chip>
                ))}
                <ChipSelect
                  label="Rarità"
                  value={rarity}
                  options={RARITY_OPTIONS}
                  onChange={setRarity}
                />
              </div>

              {visibleCards.length === 0 ? (
                <p className="deck-editor__status">
                  {collection.length === 0
                    ? 'Non possiedi ancora carte.'
                    : 'Nessuna carta corrisponde ai filtri selezionati.'}
                </p>
              ) : (
                <ul className="deck-editor__grid" role="list">
                  {visibleCards.map((card) => {
                    const owned = card.quantity ?? 0;
                    const inDeck = copies.get(card.cardId) ?? 0;
                    const maxCopies = Math.min(MAX_COPIES, owned);
                    return (
                      <li key={card.cardId} className="deck-editor-cell">
                        <FighterCard fighter={toFighter(card)} owned={owned > 0} />
                        <div className="deck-editor-cell__controls">
                          <button
                            type="button"
                            className="deck-editor-cell__button"
                            onClick={() => changeCopies(card.cardId, -1)}
                            disabled={inDeck === 0}
                            aria-label={`Togli una copia di ${card.name}`}
                          >
                            <Icon name="minus" size={14} />
                          </button>
                          <span className="deck-editor-cell__count">
                            {inDeck} / {owned}
                          </span>
                          <button
                            type="button"
                            className="deck-editor-cell__button"
                            onClick={() => changeCopies(card.cardId, 1)}
                            disabled={inDeck >= maxCopies}
                            aria-label={`Aggiungi una copia di ${card.name}`}
                          >
                            <Icon name="plus" size={14} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <aside className="deck-editor__side" aria-label="Riepilogo del mazzo">
              <div className="deck-editor__totals">
                <p className="deck-editor__total">
                  <span className="deck-editor__total-value">
                    {total} / {DECK_SIZE}
                  </span>
                  carte
                </p>
                <p className="deck-editor__total">
                  <span className="deck-editor__total-value">
                    {points} / {POINT_BUDGET}
                  </span>
                  Punti
                </p>
              </div>

              {entries.length === 0 ? (
                <p className="deck-editor__status">Nessuna carta nel mazzo.</p>
              ) : (
                <ul className="deck-editor__entries" role="list">
                  {entries.map(({ cardId, copies: count, card }) => {
                    const fighter = toFighter(card);
                    return (
                      <li key={cardId} className="deck-editor-entry">
                        <div className="deck-editor-entry__info">
                          <span className="deck-editor-entry__name">{card.name}</span>
                          <Tag tone={fighter.rarity}>{RARITY_LABELS[fighter.rarity]}</Tag>
                        </div>
                        <span className="deck-editor-entry__copies">× {count}</span>
                        <button
                          type="button"
                          className="deck-editor-entry__remove"
                          onClick={() => changeCopies(cardId, -count)}
                          aria-label={`Rimuovi ${card.name} dal mazzo`}
                        >
                          <Icon name="close" size={16} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <ul className="deck-editor__rules" aria-label="Regole del mazzo">
                {checklist.map(({ label, ok }) => (
                  <li key={label} className={`deck-editor__rule ${ok ? 'is-ok' : 'is-ko'}`}>
                    <Icon name={ok ? 'check' : 'close'} size={14} />
                    {label}
                  </li>
                ))}
              </ul>

              {!isChecked && <p className="deck-editor__status">Verifica del mazzo in corso…</p>}
              {isChecked && check.error && (
                <p className="deck-editor__alert" role="alert">
                  {CHECK_ERROR}
                </p>
              )}
              {isChecked && check.valid && <p className="deck-editor__valid">Il mazzo è valido.</p>}
              {isChecked && check.violations?.length > 0 && (
                <ul className="deck-editor__violations" role="list">
                  {check.violations.map((violation) => (
                    <li key={violation.message}>{violation.message}</li>
                  ))}
                </ul>
              )}

              {saveError && (
                <div className="deck-editor__alert" role="alert">
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

              <div className="deck-editor__actions">
                <button type="button" className="button button--secondary" onClick={onCancel}>
                  Annulla
                </button>
                <button type="submit" className="button" disabled={!canSave}>
                  {saving ? 'Salvataggio…' : 'Salva'}
                </button>
              </div>
            </aside>
          </div>
        </form>
      )}
    </section>
  );
}

function countCopies(entries, rarity) {
  return entries
    .filter(({ card }) => toFighter(card).rarity === rarity)
    .reduce((sum, { copies }) => sum + copies, 0);
}
