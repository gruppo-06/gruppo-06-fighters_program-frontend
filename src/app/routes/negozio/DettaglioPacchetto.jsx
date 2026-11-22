/** Modale di dettaglio e acquisto (Figma: Modale · Dettaglio pacchetto, 258:6200). */
import { useEffect, useId, useRef } from 'react';
import Icon from '../../../components/Icon.jsx';
import Price from '../../../components/Price.jsx';
import { RARITY_LABELS } from '../../../components/rarity.js';
import './DettaglioPacchetto.css';

/** Titoletto + elenco "voce valore" (composizione). */
function Legend({ title, items }) {
  return (
    <div className="pack-dialog__legend">
      <h3 className="eyebrow">{title}</h3>
      <dl>
        {items.map(({ label, value }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * @param {object} pack  { id, name, description, price, totalCards, contents:[{rarity, cardCount}], image? }
 * @param {number|null} credits  saldo del giocatore; null finché non è caricato
 * @param {boolean} purchasing  acquisto in corso: il bottone è disabilitato
 * @param {string|null} error  errore dell'ultimo tentativo di acquisto
 */
export default function DettaglioPacchetto({
  pack,
  credits,
  purchasing,
  error,
  onClose,
  onPurchase,
}) {
  const dialogRef = useRef(null);
  const titleRef = useRef(null);
  const titleId = useId();
  const { name, description, image, price, totalCards, contents = [] } = pack;
  const balanceAfter = credits - price;
  const affordable = credits != null && balanceAfter >= 0;

  useEffect(() => {
    // showModal gestisce focus, Esc e blocco della pagina sottostante
    if (!dialogRef.current.open) dialogRef.current.showModal();
    titleRef.current.focus({ preventScroll: true });
  }, []);

  // Si passa sempre da close(): riporta il focus sul bottone che ha aperto la modale
  const close = () => dialogRef.current.close();

  const composition = contents.map(({ rarity, cardCount }) => ({
    label: RARITY_LABELS[rarity?.toLowerCase()] ?? rarity,
    value: cardCount,
  }));

  return (
    <dialog
      ref={dialogRef}
      className="pack-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <button type="button" className="pack-dialog__close" onClick={close} aria-label="Chiudi">
        <Icon name="close" size={20} />
      </button>

      <div className="pack-dialog__scroll">
        <div className="pack-dialog__layout">
          <div className="pack-dialog__artwork">
            {image ? (
              <img className="pack-dialog__image" src={image} alt="" />
            ) : (
              <div className="pack-dialog__placeholder">
                <Icon name="image" size={24} />
                <span>Artwork {name}</span>
              </div>
            )}
          </div>

          <div className="pack-dialog__content">
            <div className="pack-dialog__info">
              <header className="pack-dialog__heading">
                <p className="eyebrow">Pacchetto</p>
                <h2 ref={titleRef} id={titleId} className="pack-dialog__title" tabIndex={-1}>
                  {name}
                </h2>
              </header>
              <p className="pack-dialog__description">{description}</p>
              {totalCards != null && (
                <ul className="pack-dialog__summary" role="list">
                  <li>
                    <span className="pack-dialog__stat-value">{totalCards}</span>{' '}
                    <span className="pack-dialog__stat-label">carte</span>
                  </li>
                </ul>
              )}
              <hr className="pack-dialog__divider" />
              {composition.length > 0 && <Legend title="Cosa contiene" items={composition} />}
            </div>

            <div className="pack-dialog__bottom">
              <div className="pack-dialog__purchase">
                <div className="pack-dialog__price">
                  <Price amount={price} size="xl" />
                  {credits == null ? null : affordable ? (
                    <div className="pack-dialog__balance">
                      <span>Saldo dopo l&apos;acquisto</span>
                      <Price amount={balanceAfter} size="sm" />
                    </div>
                  ) : (
                    <p className="pack-dialog__error">Crediti insufficienti</p>
                  )}
                </div>
                <button
                  type="button"
                  className="button button--lg pack-dialog__buy"
                  disabled={!affordable || purchasing}
                  onClick={() => onPurchase(pack)}
                >
                  <Icon name="play" size={16} />
                  {purchasing ? 'Apertura…' : 'Acquista e apri'}
                </button>
              </div>
              {error && (
                <p className="pack-dialog__error" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
