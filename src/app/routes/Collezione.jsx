/** Collezione del giocatore (Figma: COLLEZIONE + modale DETTAGLIO CARTA). */
import { useEffect, useMemo, useState } from 'react';
import CardDetail from '../../components/CardDetail.jsx';
import Chip, { ChipSelect } from '../../components/Chip.jsx';
import FighterCard from '../../components/FighterCard.jsx';
import MeterStat from '../../components/MeterStat.jsx';
import { RARITY_LABELS } from '../../components/rarity.js';
import SearchField from '../../components/SearchField.jsx';
import Tag from '../../components/Tag.jsx';
import { api } from '../../services/api.js';
import { CLASSES, FACTIONS, RARITIES, toFighter } from '../../services/cards.js';
import './Collezione.css';

const ALL = '';

const toOptions = (values, labels = {}) => [
  { value: ALL, label: 'Tutte' },
  ...values.map((value) => ({ value, label: labels[value] ?? value })),
];

const RARITY_OPTIONS = toOptions(RARITIES, RARITY_LABELS);
const CLASS_OPTIONS = toOptions(CLASSES);

const RARITY_ORDER = Object.fromEntries(RARITIES.map((rarity, i) => [rarity, i]));

/** Criteri di "Ordina": il valore vuoto è l'ordine del catalogo (per codice). */
const SORTERS = {
  [ALL]: { label: 'Numero', compare: (a, b) => a.number.localeCompare(b.number) },
  rarita: {
    label: 'Rarità',
    compare: (a, b) =>
      RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity] || a.number.localeCompare(b.number),
  },
  nome: { label: 'Nome', compare: (a, b) => a.name.localeCompare(b.name, 'it') },
  copie: {
    label: 'Copie possedute',
    compare: (a, b) => b.copies - a.copies || a.number.localeCompare(b.number),
  },
  attacco: {
    label: 'Attacco',
    compare: (a, b) => b.stats.atk - a.stats.atk || a.number.localeCompare(b.number),
  },
};

const SORT_OPTIONS = Object.entries(SORTERS).map(([value, { label }]) => ({ value, label }));

export default function Collezione() {
  // null finché non arrivano le risposte del backend
  const [catalog, setCatalog] = useState(null);
  const [collection, setCollection] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loadError, setLoadError] = useState(false);

  const [query, setQuery] = useState('');
  const [faction, setFaction] = useState(ALL);
  const [rarity, setRarity] = useState(ALL);
  const [cardClass, setCardClass] = useState(ALL);
  const [sort, setSort] = useState(ALL);
  const [selectedCode, setSelectedCode] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get('/cards?size=100'),
      api.get('/me/collection?size=100'),
      api.get('/me/collection/progress'),
    ])
      .then(([catalogPage, collectionPage, progressList]) => {
        if (cancelled) return;
        setCatalog(catalogPage.content);
        setCollection(collectionPage.content);
        setProgress(progressList);
      })
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo(() => {
    if (!catalog || !collection) return [];
    const copies = new Map(collection.map((item) => [item.code, item.quantity]));
    return catalog.map((card) => {
      const quantity = copies.get(card.code) ?? 0;
      return { ...toFighter({ ...card, quantity }), owned: quantity > 0 };
    });
  }, [catalog, collection]);

  const isLoading = (!catalog || !collection) && !loadError;
  const ownedCount = cards.filter((card) => card.owned).length;

  const visibleCards = useMemo(() => {
    const text = query.trim().toLowerCase();
    return cards
      .filter(
        (card) =>
          (!text || card.name.toLowerCase().includes(text)) &&
          (!faction || card.faction === faction) &&
          (!rarity || card.rarity === rarity) &&
          (!cardClass || card.role === cardClass),
      )
      .sort(SORTERS[sort].compare);
  }, [cards, query, faction, rarity, cardClass, sort]);

  const selectedCard = cards.find((card) => card.number === selectedCode) ?? null;

  // TODO: aprire l'editor dei mazzi con la carta selezionata (pagina Mazzi)
  function handleAddToDeck() {}

  // TODO: avviare una proposta di scambio con la carta selezionata (pagina Scambi)
  function handleProposeTrade() {}

  return (
    <div className="container collection">
      <header className="collection-header">
        <div className="collection-header__total">
          <p className="eyebrow">La mia collezione</p>
          <h1 className="collection-header__count">
            {ownedCount}
            <span className="collection-header__of"> / {cards.length} carte</span>
          </h1>
        </div>

        <ul
          className="collection-header__progress"
          role="list"
          aria-label="Completamento per fazione"
        >
          {progress.map(({ faction: name, owned, total }) => (
            <li key={name}>
              <MeterStat label={name} value={owned} max={total} />
            </li>
          ))}
        </ul>
      </header>

      <div className="collection-filters" role="search" aria-label="Filtra la collezione">
        <div className="collection-filters__group">
          <SearchField
            label="Cerca una carta"
            placeholder="Cerca una carta…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="collection-filters__search"
          />
          <div className="collection-filters__chips" role="group" aria-label="Fazione">
            <Chip selected={faction === ALL} onClick={() => setFaction(ALL)}>
              Tutte
            </Chip>
            {FACTIONS.map((name) => (
              <Chip key={name} selected={faction === name} onClick={() => setFaction(name)}>
                {name}
              </Chip>
            ))}
          </div>
        </div>

        <div className="collection-filters__chips">
          <ChipSelect label="Rarità" value={rarity} options={RARITY_OPTIONS} onChange={setRarity} />
          <ChipSelect
            label="Classe"
            value={cardClass}
            options={CLASS_OPTIONS}
            onChange={setCardClass}
          />
          <ChipSelect label="Ordina" value={sort} options={SORT_OPTIONS} onChange={setSort} />
        </div>
      </div>

      <section aria-label="Carte">
        <p className="visually-hidden" aria-live="polite">
          {visibleCards.length} carte mostrate
        </p>

        {loadError ? (
          <p className="collection-status" role="alert">
            Impossibile caricare la collezione. Riprova più tardi.
          </p>
        ) : isLoading ? (
          <p className="collection-status" aria-live="polite">
            Caricamento della collezione…
          </p>
        ) : visibleCards.length === 0 ? (
          <p className="collection-status">Nessuna carta corrisponde ai filtri selezionati.</p>
        ) : (
          <ul className="collection-grid" role="list">
            {visibleCards.map((card) => (
              <li key={card.number} className="collection-cell">
                <div className="collection-cell__card">
                  <FighterCard fighter={card} owned={card.owned} />
                  <button
                    type="button"
                    className="collection-cell__open"
                    onClick={() => setSelectedCode(card.number)}
                    aria-label={`Dettaglio ${card.name}${card.owned ? '' : ' (non posseduta)'}`}
                  />
                </div>
                {card.owned ? (
                  <Tag tone="outline">
                    <span aria-hidden="true">× {card.copies}</span>
                    <span className="visually-hidden">
                      {card.copies} {card.copies === 1 ? 'copia' : 'copie'}
                    </span>
                  </Tag>
                ) : (
                  <p className="collection-cell__missing">Non posseduta</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <CardDetail
        card={selectedCard}
        onClose={() => setSelectedCode(null)}
        onAddToDeck={handleAddToDeck}
        onProposeTrade={handleProposeTrade}
      />
    </div>
  );
}
