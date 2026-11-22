/** Editor di un mazzo (Figma: MAZZI – editor). Rotte /mazzi/:deckId e /mazzi/nuovo. */
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Chip, { ChipSelect } from '../../../components/Chip.jsx';
import Icon from '../../../components/Icon.jsx';
import MeterStat from '../../../components/MeterStat.jsx';
import { RARITY_LABELS } from '../../../components/rarity.js';
import SearchField from '../../../components/SearchField.jsx';
import Tag from '../../../components/Tag.jsx';
import { FACTIONS, RARITIES, mockCollection } from '../../../data/mockCollection.js';
import { mockDecks } from '../../../data/mockDecks.js';
import DeckCardCell from './DeckCardCell.jsx';
import DeckPanel from './DeckPanel.jsx';
import {
  DECK_SIZE,
  MAX_POWER,
  NEW_DECK_ID,
  addBlockReason,
  deckEntries,
  summarizeDeck,
} from './deckRules.js';
import './Mazzo.css';

const ALL = '';

const TYPES = [
  { value: ALL, label: 'Tutte' },
  { value: 'fighter', label: 'Fighter' },
  { value: 'effetto', label: 'Effetto' },
];

const FACTION_OPTIONS = [
  { value: ALL, label: 'Tutte' },
  ...FACTIONS.map((name) => ({ value: name, label: name })),
];

const RARITY_OPTIONS = [
  { value: ALL, label: 'Tutte' },
  ...RARITIES.filter((rarity) => rarity !== 'effetto').map((value) => ({
    value,
    label: RARITY_LABELS[value],
  })),
];

const RARITY_ORDER = Object.fromEntries(RARITIES.map((rarity, i) => [rarity, i]));

const SORTERS = {
  [ALL]: { label: 'Numero', compare: (a, b) => a.id - b.id },
  rarita: {
    label: 'Rarità',
    compare: (a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity] || a.id - b.id,
  },
  nome: { label: 'Nome', compare: (a, b) => a.name.localeCompare(b.name, 'it') },
  attacco: {
    label: 'Attacco',
    compare: (a, b) => (b.stats?.atk ?? -1) - (a.stats?.atk ?? -1) || a.id - b.id,
  },
};

const SORT_OPTIONS = Object.entries(SORTERS).map(([value, { label }]) => ({ value, label }));

/** Filtro "Mostra": possedute (default), non possedute o tutte (nessuno dei due chip attivo). */
const OWNED = 'owned';
const MISSING = 'missing';

export default function MazzoEditor() {
  const { deckId } = useParams();

  // TODO: caricare il mazzo dal backend (es. api.get(`/decks/${deckId}`)) quando l'endpoint esiste
  const deck =
    deckId === NEW_DECK_ID
      ? { id: null, name: 'Nuovo mazzo', cards: {} }
      : mockDecks.find((item) => item.id === deckId);

  if (!deck) {
    return (
      <section className="container app-page">
        <h1>Mazzo non trovato</h1>
        <p>
          Il mazzo che cerchi non esiste. <Link to="/mazzi">Torna ai tuoi mazzi</Link>
        </p>
      </section>
    );
  }

  // key: passando da un mazzo all'altro lo stato dell'editor riparte da zero
  return <DeckEditor key={deckId} deck={deck} />;
}

function DeckEditor({ deck }) {
  const navigate = useNavigate();

  // TODO: caricare la collezione dal backend (es. api.get('/collection')) quando l'endpoint esiste
  const collection = mockCollection;
  const cardsById = useMemo(() => new Map(collection.map((card) => [card.id, card])), [collection]);

  const [name, setName] = useState(deck.name);
  const [cards, setCards] = useState(deck.cards);
  const [saved, setSaved] = useState(false);

  const [query, setQuery] = useState('');
  const [type, setType] = useState(ALL);
  const [faction, setFaction] = useState(ALL);
  const [rarity, setRarity] = useState(ALL);
  const [sort, setSort] = useState(ALL);
  const [ownership, setOwnership] = useState(OWNED);
  const [showInDeck, setShowInDeck] = useState(true);

  const entries = useMemo(() => deckEntries(cards, cardsById), [cards, cardsById]);
  const summary = useMemo(() => summarizeDeck(cards, cardsById), [cards, cardsById]);
  const getBlockReason = (card) => addBlockReason(card, cards[card.id] ?? 0, summary);

  const visibleCards = useMemo(() => {
    const text = query.trim().toLowerCase();
    return collection
      .filter((card) => {
        const isEffect = card.rarity === 'effetto';
        return (
          (!text || card.name.toLowerCase().includes(text)) &&
          (!type || (type === 'effetto') === isEffect) &&
          (!faction || card.faction === faction) &&
          (!rarity || card.rarity === rarity) &&
          (ownership !== OWNED || card.owned) &&
          (ownership !== MISSING || !card.owned) &&
          (showInDeck || !cards[card.id])
        );
      })
      .sort(SORTERS[sort].compare);
  }, [collection, query, type, faction, rarity, sort, ownership, showInDeck, cards]);

  function changeCount(card, delta) {
    setSaved(false);
    setCards((current) => {
      const count = (current[card.id] ?? 0) + delta;
      const next = { ...current };
      if (count > 0) next[card.id] = count;
      else delete next[card.id];
      return next;
    });
  }

  const addCard = (card) => {
    if (getBlockReason(card) === null) changeCount(card, 1);
  };
  const removeCard = (card) => changeCount(card, -1);

  function handleSave() {
    if (!summary.valid) return;
    // TODO: salvare sul backend (api.post('/decks') per un mazzo nuovo, api.put(`/decks/${deck.id}`) altrimenti)
    setSaved(true);
  }

  const toggleOwnership = (value) => setOwnership((current) => (current === value ? ALL : value));
  const problemCount = summary.problems.length;

  return (
    <div className="deck-editor">
      <header className="deck-bar">
        <div className="container deck-bar__inner">
          <div className="deck-bar__title">
            <Link className="deck-bar__back" to="/mazzi">
              <Icon name="chevron-left" size={16} />I miei mazzi
            </Link>
            <DeckName
              value={name}
              onChange={(value) => {
                setName(value);
                setSaved(false);
              }}
            />
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
            {problemCount > 0 && (
              <Tag tone="alert">
                {problemCount} {problemCount === 1 ? 'problema' : 'problemi'}
              </Tag>
            )}
            <button
              type="button"
              className="button button--secondary"
              onClick={() => navigate('/mazzi')}
            >
              Annulla
            </button>
            <button type="button" className="button" onClick={handleSave} disabled={!summary.valid}>
              Salva mazzo
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
              <div className="segmented" role="group" aria-label="Tipo di carta">
                {TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className="segmented__option"
                    aria-pressed={type === value}
                    onClick={() => setType(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
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
              <Chip selected={ownership === OWNED} onClick={() => toggleOwnership(OWNED)}>
                Solo possedute
              </Chip>
              <Chip selected={showInDeck} onClick={() => setShowInDeck((value) => !value)}>
                Anche nel mazzo
              </Chip>
              <Chip selected={ownership === MISSING} onClick={() => toggleOwnership(MISSING)}>
                Non possedute
              </Chip>
            </div>
          </div>

          {visibleCards.length === 0 ? (
            <p className="deck-empty">Nessuna carta corrisponde ai filtri selezionati.</p>
          ) : (
            <ul className="deck-grid" role="list">
              {visibleCards.map((card) => (
                <DeckCardCell
                  key={card.id}
                  card={card}
                  inDeck={cards[card.id] ?? 0}
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
          onSave={handleSave}
          saved={saved}
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
