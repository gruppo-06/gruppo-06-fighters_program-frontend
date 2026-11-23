import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';
import { RARITY_LABELS } from './rarity.js';
import Tag from './Tag.jsx';
import { LEGENDARY_ABILITIES } from '../data/previewEffects.js';
import './CardDetail.css';

const STATS = [
  { key: 'atk', label: 'Attacco' },
  { key: 'def', label: 'Difesa' },
  { key: 'vel', label: 'Velocità' },
  { key: 'crt', label: 'Critico' },
];

/**
 * Modale con il dettaglio di una carta (Figma: DETTAGLIO CARTA).
 * Usa <dialog> nativo: focus intrappolato, chiusura con Esc e clic sullo sfondo.
 *
 * @param {object|null} card   carta da mostrare (forma di toFighter); null = modale chiusa
 * @param {() => void} onClose
 * @param {(card) => void} [onAddToDeck]
 * @param {(card) => void} [onProposeTrade]
 */
export default function CardDetail({ card, onClose, onAddToDeck, onProposeTrade }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (card && !dialog.open) dialog.showModal();
    if (!card && dialog.open) dialog.close();
  }, [card]);

  // Clic sullo sfondo (fuori dal riquadro): il target è il <dialog> stesso
  function handleClick(event) {
    if (event.target === dialogRef.current) onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className="card-detail"
      aria-labelledby="card-detail-title"
      onClose={onClose}
      onClick={handleClick}
    >
      {card && (
        <CardDetailContent
          card={card}
          onClose={onClose}
          onAddToDeck={onAddToDeck}
          onProposeTrade={onProposeTrade}
        />
      )}
    </dialog>
  );
}

function CardDetailContent({ card, onClose, onAddToDeck, onProposeTrade }) {
  const rarityLabel = RARITY_LABELS[card.rarity] ?? card.rarity;
  const eyebrow = `${card.region} · ${rarityLabel} · ${card.number}`;

  return (
    <div className="card-detail__panel">
      <div className="card-detail__art">
        {card.image ? (
          <img src={card.image} alt="" />
        ) : (
          <div className="card-detail__placeholder">
            <Icon name="image" size={24} />
            <span>Illustrazione carta in alta risoluzione</span>
          </div>
        )}
      </div>

      <div className="card-detail__info">
        <div className="card-detail__header">
          <p className="eyebrow">{eyebrow}</p>
          <button
            type="button"
            className="card-detail__close"
            onClick={onClose}
            aria-label="Chiudi dettaglio"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <h2 id="card-detail-title" className="card-detail__title">
          {card.name}
        </h2>
        {card.lore && <p className="card-detail__lore">{card.lore}</p>}

        <dl className="card-detail__stats">
          {STATS.map(({ key, label }) => (
            <div key={key} className="card-detail__stat">
              <dt>{label}</dt>
              <dd>{card.stats[key]}</dd>
            </div>
          ))}
        </dl>

        <div className="card-detail__tags">
          <Tag tone={card.rarity}>{rarityLabel}</Tag>
          <Tag tone="outline">Classe · {card.role}</Tag>
          <Tag tone="outline">Fazione · {card.faction}</Tag>
        </div>

        {card.rarity === 'leggendaria' && LEGENDARY_ABILITIES[card.number] && (
          <div className="card-detail__legendary-ability">
            <div className="card-detail__legendary-ability-header">
              <span className="card-detail__legendary-ability-label">Abilità speciale</span>
              <span className="card-detail__legendary-ability-preview-badge">Anteprima</span>
            </div>
            <p className="card-detail__legendary-ability-text">
              {LEGENDARY_ABILITIES[card.number].text}
            </p>
          </div>
        )}

        <p className="card-detail__owned">
          {card.owned
            ? `Possiedi ${card.copies} ${card.copies === 1 ? 'copia' : 'copie'}`
            : 'Non possiedi ancora questa carta'}
        </p>

        <div className="card-detail__actions">
          <button
            type="button"
            className="button button--lg"
            onClick={() => onAddToDeck?.(card)}
            disabled={!card.owned}
          >
            Aggiungi a un mazzo
          </button>
          <button
            type="button"
            className="button button--secondary button--lg"
            onClick={() => onProposeTrade?.(card)}
          >
            Proponi scambio
          </button>
        </div>
      </div>
    </div>
  );
}
