import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api.js';
import { toFighter } from '../services/cards.js';
import CardBack from './CardBack.jsx';
import FighterCard from './FighterCard.jsx';
import Icon from './Icon.jsx';
import './PackReveal.css';

const GLOWING_RARITIES = new Set(['epica', 'leggendaria']);

/**
 * Modale di apertura di un pacchetto (Figma: apertura pacchetto).
 * Carica i dettagli delle carte aperte, poi le scopre una alla volta.
 *
 * @param {object|null} opening  risposta di POST /packs/{id}/open; null = modale chiusa
 * @param {() => void} onClose
 */
export default function PackReveal({ opening, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (opening && !dialog.open) dialog.showModal();
    if (!opening && dialog.open) dialog.close();
  }, [opening]);

  // Clic sullo sfondo (fuori dal riquadro): il target è il <dialog> stesso
  function handleClick(event) {
    if (event.target === dialogRef.current) onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className="pack-reveal"
      aria-labelledby="pack-reveal-title"
      onClose={onClose}
      onClick={handleClick}
    >
      {opening && <PackRevealContent key={opening.openingId} opening={opening} onClose={onClose} />}
    </dialog>
  );
}

function PackRevealContent({ opening, onClose }) {
  const [cards, setCards] = useState([]);
  const [revealed, setRevealed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const codes = [...new Set(opening.cards.map((card) => card.code))];

    Promise.allSettled(codes.map((code) => api.get(`/cards/${encodeURIComponent(code)}`))).then(
      (results) => {
        if (cancelled) return;
        const details = new Map();
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') details.set(codes[index], result.value);
        });

        setCards(
          opening.cards.map((card, index) => {
            const detail = details.get(card.code) ?? card;
            return {
              key: `${card.code}-${index}`,
              fighter: toFighter(detail),
            };
          }),
        );
        setLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [opening]);

  const total = cards.length;
  const allRevealed = total > 0 && revealed >= total;

  function revealNext() {
    setRevealed((count) => Math.min(count + 1, total));
  }

  function revealAll() {
    setRevealed(total);
  }

  return (
    <div className="pack-reveal__panel">
      <header className="pack-reveal__header">
        <div className="pack-reveal__heading">
          <p className="eyebrow">Pacchetto aperto</p>
          <h2 id="pack-reveal-title" className="pack-reveal__title">
            {opening.packName}
          </h2>
          <p className="pack-reveal__subtitle">
            {loading ? 'Preparazione delle carte…' : `${total} carte · saldo ${opening.balance}`}
          </p>
        </div>
        <button type="button" className="pack-reveal__close" onClick={onClose} aria-label="Chiudi">
          <Icon name="close" size={20} />
        </button>
      </header>

      {loading ? (
        <p className="pack-reveal__loading" aria-live="polite">
          Apertura del pacchetto…
        </p>
      ) : (
        <ul className="pack-reveal__grid" role="list" aria-label="Carte del pacchetto">
          {cards.map((card, index) => {
            const isRevealed = index < revealed;
            const { rarity } = card.fighter;
            const glows = GLOWING_RARITIES.has(rarity);

            return (
              <li
                key={card.key}
                className={[
                  'pack-reveal__cell',
                  isRevealed && 'is-revealed',
                  glows && `pack-reveal__cell--${rarity}`,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {isRevealed ? (
                  <div className="pack-reveal__card">
                    <FighterCard fighter={card.fighter} />
                  </div>
                ) : (
                  <button
                    type="button"
                    className="pack-reveal__back"
                    onClick={revealNext}
                    aria-label={`Rivela la carta ${index + 1} di ${total}`}
                  >
                    <CardBack />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="visually-hidden" aria-live="polite">
        {revealed} carte rivelate su {total}
      </p>

      <footer className="pack-reveal__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={revealNext}
          disabled={loading || allRevealed}
        >
          Rivela carta
        </button>
        <button
          type="button"
          className="button"
          onClick={revealAll}
          disabled={loading || allRevealed}
        >
          Rivela tutte
        </button>
        <button type="button" className="button button--secondary" onClick={onClose}>
          Chiudi
        </button>
      </footer>
    </div>
  );
}
