/** Modale di dettaglio e acquisto (Figma: Modale · Dettaglio pacchetto, 258:6200). */
import { useEffect, useId, useRef } from 'react';
import Icon from '../../../components/Icon.jsx';
import Price from '../../../components/Price.jsx';
import Tag from '../../../components/Tag.jsx';
import './DettaglioPacchetto.css';

/** Titoletto + elenco "voce valore" (composizione, probabilità). */
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

export default function DettaglioPacchetto({ pack, credits, availability, onClose, onPurchase }) {
  const dialogRef = useRef(null);
  const titleRef = useRef(null);
  const titleId = useId();
  // Un ref e non uno state: deve bloccare anche un secondo click prima del nuovo render
  const purchasedRef = useRef(false);
  const { name, tier, image, price, details } = pack;
  const { season, summary, contents, odds, notes } = details;
  const balanceAfter = credits - price;
  const affordable = balanceAfter >= 0;

  useEffect(() => {
    // showModal gestisce focus, Esc e blocco della pagina sottostante
    if (!dialogRef.current.open) dialogRef.current.showModal();
    titleRef.current.focus({ preventScroll: true });
  }, []);

  // Si passa sempre da close(): riporta il focus sul bottone che ha aperto la modale
  const close = () => dialogRef.current.close();

  function purchase() {
    if (purchasedRef.current) return;
    purchasedRef.current = true;
    onPurchase(pack);
  }

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
            <div className="pack-dialog__labels">
              <Tag tone={tier.tone}>{tier.label}</Tag>
              {season && <Tag tone="elemento">{season}</Tag>}
            </div>
            {availability && <p className="pack-dialog__availability">{availability}</p>}
          </div>

          <div className="pack-dialog__content">
            <div className="pack-dialog__info">
              <header className="pack-dialog__heading">
                <p className="eyebrow">{season ? `Pacchetto · ${season}` : 'Pacchetto'}</p>
                <h2 ref={titleRef} id={titleId} className="pack-dialog__title" tabIndex={-1}>
                  {name}
                </h2>
              </header>
              <p className="pack-dialog__description">{details.description ?? pack.description}</p>
              <ul className="pack-dialog__summary" role="list">
                {summary.map(({ value, label }) => (
                  <li key={label}>
                    <span className="pack-dialog__stat-value">{value}</span>{' '}
                    <span className="pack-dialog__stat-label">{label}</span>
                  </li>
                ))}
              </ul>
              <hr className="pack-dialog__divider" />
              <Legend title="Cosa contiene" items={contents} />
              {odds && <Legend title="Slot bonus · probabilità" items={odds} />}
            </div>

            <div className="pack-dialog__bottom">
              {notes && (
                <ul className="pack-dialog__notes">
                  {notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              )}
              <div className="pack-dialog__purchase">
                <div className="pack-dialog__price">
                  <Price amount={price} size="xl" />
                  {affordable ? (
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
                  disabled={!affordable}
                  onClick={purchase}
                >
                  <Icon name="play" size={16} />
                  Acquista e apri
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
