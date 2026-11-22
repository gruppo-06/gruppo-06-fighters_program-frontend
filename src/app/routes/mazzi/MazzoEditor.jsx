/** Editor di un mazzo (Figma: MAZZI – editor). Rotte /mazzi/:deckId e /mazzi/nuovo. */
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Chip, { ChipSelect } from '../../../components/Chip.jsx';
import Icon from '../../../components/Icon.jsx';
import MeterStat from '../../../components/MeterStat.jsx';
import { RARITY_LABELS } from '../../../components/rarity.js';
import SearchField from '../../../components/SearchField.jsx';
import Tag from '../../../components/Tag.jsx';
import { ApiError, api } from '../../../services/api.js';
import { FACTIONS, RARITIES, toFighter } from '../../../services/cards.js';
import DeckCardCell from './DeckCardCell.jsx';
import DeckPanel from './DeckPanel.jsx';
import {
  DECK_SIZE,
  MAX_POWER,
  NEW_DECK_ID,
  addBlockReason,
  canAddSubcard,
  deckEntries,
  summarizeDeck,
} from './deckRules.js';
import './Mazzo.css';

const ALL = '';
const VALIDATION_DELAY = 300;

const FACTION_OPTIONS = [
  { value: ALL, label: 'Tutte' },
  ...FACTIONS.map((name) => ({ value: name, label: name })),
];

const RARITY_OPTIONS = [
  { value: ALL, label: 'Tutte' },
  ...RARITIES.map((value) => ({ value, label: RARITY_LABELS[value] })),
];

const RARITY_ORDER = Object.fromEntries(RARITIES.map((rarity, i) => [rarity, i]));

const sortByNumber = (a, b) =>
  a.number.localeCompare(b.number, 'it', { numeric: true }) ||
  String(a.cardId).localeCompare(String(b.cardId));

const SORTERS = {
  [ALL]: { label: 'Numero', compare: sortByNumber },
  rarita: {
    label: 'Rarità',
    compare: (a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity] || sortByNumber(a, b),
  },
  nome: { label: 'Nome', compare: (a, b) => a.name.localeCompare(b.name, 'it') },
  attacco: {
    label: 'Attacco',
    compare: (a, b) => b.stats.atk - a.stats.atk || sortByNumber(a, b),
  },
};

const SORT_OPTIONS = Object.entries(SORTERS).map(([value, { label }]) => ({ value, label }));

const LOAD_ERROR = 'Impossibile caricare il mazzo. Riprova più tardi.';
const SAVE_ERROR = 'Impossibile salvare il mazzo. Riprova più tardi.';
const FULL_ERROR = 'Hai raggiunto il numero massimo di mazzi.';

/** Carta della collezione nella forma usata da FighterCard e dal riepilogo. */
function collectionCard(card) {
  return {
    ...toFighter(card),
    cardId: card.cardId,
    owned: (card.quantity ?? 0) > 0,
  };
}

/** Carta del dettaglio del mazzo non (più) presente in collezione. */
function deckCard(card) {
  return { ...toFighter(card), cardId: card.cardId, owned: false, copies: 0 };
}

function saveErrorOf(failure) {
  if (failure instanceof ApiError && failure.status === 422) {
    return {
      message: 'Il mazzo non è valido.',
      details: Array.isArray(failure.data?.details) ? failure.data.details : [],
    };
  }
  if (failure instanceof ApiError && failure.status === 409) {
    return { message: FULL_ERROR, details: [] };
  }
  return { message: SAVE_ERROR, details: [] };
}

export default function MazzoEditor() {
  const { deckId } = useParams();
  const isNew = deckId === NEW_DECK_ID;
  const requestKey = isNew ? NEW_DECK_ID : String(deckId);

  // null finché non arrivano le risposte del backend
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      api.get('/me/collection?size=100'),
      isNew ? Promise.resolve(null) : api.get(`/me/decks/${deckId}`),
      api.get('/subcards'),
    ]).then(
      ([collectionPage, deck, subcardCatalog]) => {
        if (cancelled) return;
        setResult({
          key: requestKey,
          status: 'ready',
          collection: collectionPage?.content ?? [],
          deck,
          subcardCatalog: subcardCatalog ?? [],
        });
      },
      (error) => {
        if (cancelled) return;
        setResult({
          key: requestKey,
          status: error instanceof ApiError && error.status === 404 ? 'notFound' : 'error',
        });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [deckId, isNew, requestKey]);

  const current = result?.key === requestKey ? result : { status: 'loading' };

  if (current.status === 'notFound') {
    return (
      <section className="container app-page">
        <h1>Mazzo non trovato</h1>
        <p>
          Il mazzo che cerchi non esiste. <Link to="/mazzi">Torna ai tuoi mazzi</Link>
        </p>
      </section>
    );
  }

  if (current.status === 'error') {
    return (
      <section className="container app-page">
        <h1>Impossibile caricare il mazzo</h1>
        <p role="alert">{LOAD_ERROR}</p>
        <p>
          <Link to="/mazzi">Torna ai tuoi mazzi</Link>
        </p>
      </section>
    );
  }

  if (current.status !== 'ready') {
    return (
      <section className="container app-page">
        <p className="deck-status" role="status">
          Caricamento del mazzo…
        </p>
      </section>
    );
  }

  // key: passando da un mazzo all'altro lo stato dell'editor riparte da zero
  return (
    <DeckEditor
      key={deckId}
      deckId={isNew ? null : deckId}
      deck={current.deck}
      collection={current.collection}
      subcardCatalog={current.subcardCatalog}
    />
  );
}

function DeckEditor({ deckId, deck, collection, subcardCatalog }) {
  const navigate = useNavigate();

  const [name, setName] = useState(deck?.name ?? 'Nuovo mazzo');
  const [cards, setCards] = useState(() =>
    Object.fromEntries((deck?.cards ?? []).map((card) => [String(card.cardId), card.copies])),
  );
  // Codici delle sottocarte per carta: { [cardId]: ['SC01', …] }
  const [subcards, setSubcards] = useState(() =>
    Object.fromEntries(
      (deck?.cards ?? [])
        .filter((card) => card.subcards?.length > 0)
        .map((card) => [String(card.cardId), card.subcards.map((subcard) => subcard.code).sort()]),
    ),
  );

  const [query, setQuery] = useState('');
  const [faction, setFaction] = useState(ALL);
  const [rarity, setRarity] = useState(ALL);
  const [sort, setSort] = useState(ALL);
  const [showInDeck, setShowInDeck] = useState(true);

  const [check, setCheck] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const collectionCards = useMemo(() => collection.map(collectionCard), [collection]);
  const cardsById = useMemo(() => {
    const byId = new Map();
    (deck?.cards ?? []).forEach((card) => byId.set(String(card.cardId), deckCard(card)));
    collectionCards.forEach((card) => byId.set(String(card.cardId), card));
    return byId;
  }, [collectionCards, deck]);

  const entries = useMemo(() => deckEntries(cards, cardsById), [cards, cardsById]);
  const summary = useMemo(() => summarizeDeck(cards, cardsById), [cards, cardsById]);
  const getBlockReason = (card) => addBlockReason(card, cards[String(card.cardId)] ?? 0, summary);

  const visibleCards = useMemo(() => {
    const text = query.trim().toLowerCase();
    return collectionCards
      .filter(
        (card) =>
          (!text || card.name.toLowerCase().includes(text)) &&
          (!faction || card.faction === faction) &&
          (!rarity || card.rarity === rarity) &&
          (showInDeck || !cards[String(card.cardId)]),
      )
      .sort(SORTERS[sort].compare);
  }, [collectionCards, query, faction, rarity, sort, showInDeck, cards]);

  // Payload ordinato: la chiave cambia solo quando cambia il contenuto del mazzo.
  const payloadCards = useMemo(
    () =>
      entries
        .map(({ card, count }) => ({
          cardId: card.cardId,
          copies: count,
          subcards: subcards[String(card.cardId)] ?? [],
        }))
        .sort((a, b) => String(a.cardId).localeCompare(String(b.cardId))),
    [entries, subcards],
  );
  const cardsKey = JSON.stringify(payloadCards);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      api.post('/me/decks/validate', { cards: payloadCards }).then(
        (result) =>
          !cancelled &&
          setCheck({
            key: cardsKey,
            valid: result?.valid === true,
            violations: result?.violations ?? [],
          }),
        () => !cancelled && setCheck({ key: cardsKey, error: true, violations: [] }),
      );
    }, VALIDATION_DELAY);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cardsKey, payloadCards]);

  const isChecked = check?.key === cardsKey;
  const validation = isChecked
    ? {
        status: check.error ? 'error' : check.valid ? 'valid' : 'invalid',
        violations: check.violations,
      }
    : { status: 'pending', violations: [] };
  const serverViolations = validation.violations ?? [];
  const issueCount =
    validation.status === 'pending' || validation.status === 'error'
      ? summary.problems.length
      : serverViolations.length;
  const canSave = validation.status === 'valid' && name.trim().length > 0 && !saving;

  function changeCount(card, delta) {
    const key = String(card.cardId);
    setCards((current) => {
      const count = (current[key] ?? 0) + delta;
      const next = { ...current };
      if (count > 0) next[key] = count;
      else delete next[key];
      return next;
    });
    // Le sottocarte valgono per tutte le copie: senza copie la carta non le conserva
    if ((cards[key] ?? 0) + delta <= 0) {
      setSubcards((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  }

  const addCard = (card) => {
    if (getBlockReason(card) === null) changeCount(card, 1);
  };
  const removeCard = (card) => changeCount(card, -1);

  const subcardsOf = (card) => subcards[String(card.cardId)] ?? [];

  const addSubcard = (card, code) => {
    const key = String(card.cardId);
    if (!canAddSubcard(card, subcardsOf(card), code)) return;
    setSubcards((current) => ({
      ...current,
      [key]: [...(current[key] ?? []), code].sort(),
    }));
  };

  const removeSubcard = (card, code) => {
    const key = String(card.cardId);
    setSubcards((current) => {
      const codes = (current[key] ?? []).filter((value) => value !== code);
      const next = { ...current };
      if (codes.length > 0) next[key] = codes;
      else delete next[key];
      return next;
    });
  };

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);
    const body = { name: name.trim(), cards: payloadCards };
    try {
      if (deckId) await api.put(`/me/decks/${deckId}`, body);
      else await api.post('/me/decks', body);
      navigate('/mazzi');
    } catch (failure) {
      setSaveError(saveErrorOf(failure));
      setSaving(false);
    }
  }

  return (
    <div className="deck-editor">
      <header className="deck-bar">
        <div className="container deck-bar__inner">
          <div className="deck-bar__title">
            <Link className="deck-bar__back" to="/mazzi">
              <Icon name="chevron-left" size={16} />I miei mazzi
            </Link>
            <DeckName value={name} onChange={setName} />
          </div>

          <div className="deck-bar__meters">
            <MeterStat label="Carte" value={summary.count} max={DECK_SIZE} className="deck-meter" />
            <MeterStat
              label="Forza"
              value={summary.power}
              max={MAX_POWER}
              className={`deck-meter ${summary.power > MAX_POWER ? 'is-over' : ''}`}
            />
          </div>

          <div className="deck-bar__actions">
            {issueCount > 0 && (
              <Tag tone="alert">
                {issueCount} {issueCount === 1 ? 'problema' : 'problemi'}
              </Tag>
            )}
            <button
              type="button"
              className="button button--secondary"
              onClick={() => navigate('/mazzi')}
            >
              Annulla
            </button>
            <button type="button" className="button" onClick={handleSave} disabled={!canSave}>
              {saving ? 'Salvataggio…' : 'Salva mazzo'}
            </button>
          </div>
        </div>
      </header>

      <div className="container deck-layout">
        <section className="deck-collection" aria-labelledby="deck-collection-title">
          <header className="deck-collection__header">
            <div>
              <p className="eyebrow">Passo 1 · Scegli le carte</p>
              <h2 id="deck-collection-title" className="deck-collection__title">
                La tua collezione
              </h2>
            </div>
            <p className="deck-collection__count" aria-live="polite">
              {visibleCards.length} {visibleCards.length === 1 ? 'carta' : 'carte'} disponibili
            </p>
          </header>

          <div className="deck-filters" role="search" aria-label="Filtra le carte">
            <div className="deck-filters__row">
              <SearchField
                label="Cerca una carta"
                placeholder="Cerca una carta…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="deck-filters__search"
              />
              <div className="deck-filters__selects">
                <ChipSelect
                  label="Fazione"
                  value={faction}
                  options={FACTION_OPTIONS}
                  onChange={setFaction}
                />
                <ChipSelect
                  label="Rarità"
                  value={rarity}
                  options={RARITY_OPTIONS}
                  onChange={setRarity}
                />
                <ChipSelect label="Ordina" value={sort} options={SORT_OPTIONS} onChange={setSort} />
              </div>
            </div>

            <div className="deck-filters__row" role="group" aria-labelledby="deck-filters-show">
              <span id="deck-filters-show" className="deck-filters__label">
                Mostra:
              </span>
              <Chip selected={showInDeck} onClick={() => setShowInDeck((value) => !value)}>
                Anche nel mazzo
              </Chip>
            </div>
          </div>

          {visibleCards.length === 0 ? (
            <p className="deck-empty">
              {collectionCards.length === 0
                ? 'Non possiedi ancora carte.'
                : 'Nessuna carta corrisponde ai filtri selezionati.'}
            </p>
          ) : (
            <ul className="deck-grid" role="list">
              {visibleCards.map((card) => (
                <DeckCardCell
                  key={card.cardId}
                  card={card}
                  inDeck={cards[String(card.cardId)] ?? 0}
                  blockReason={getBlockReason(card)}
                  onAdd={() => addCard(card)}
                  onRemove={() => removeCard(card)}
                />
              ))}
            </ul>
          )}
        </section>

        <DeckPanel
          entries={entries}
          summary={summary}
          getBlockReason={getBlockReason}
          onAdd={addCard}
          onRemove={removeCard}
          subcardCatalog={subcardCatalog}
          subcardsOf={subcardsOf}
          onAddSubcard={addSubcard}
          onRemoveSubcard={removeSubcard}
          onSave={handleSave}
          validation={validation}
          canSave={canSave}
          nameMissing={!name.trim()}
          saving={saving}
          saveError={saveError}
        />
      </div>
    </div>
  );
}

/** Titolo del mazzo con rinomina in linea (matita → campo di testo). */
function DeckName({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed) onChange(trimmed);
    else setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <form
        className="deck-name"
        onSubmit={(event) => {
          event.preventDefault();
          commit();
        }}
      >
        <label className="visually-hidden" htmlFor="deck-name-input">
          Nome del mazzo
        </label>
        <input
          id="deck-name-input"
          className="deck-name__input"
          value={draft}
          maxLength={40}
          autoFocus
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setDraft(value);
              setEditing(false);
            }
          }}
        />
      </form>
    );
  }

  return (
    <div className="deck-name">
      <h1 className="deck-name__title">{value}</h1>
      <button
        type="button"
        className="deck-name__edit"
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        aria-label="Rinomina il mazzo"
      >
        <Icon name="edit" size={18} />
      </button>
    </div>
  );
}
