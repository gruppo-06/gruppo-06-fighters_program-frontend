import Icon from './Icon.jsx';
import Price from './Price.jsx';
import './PackCard.css';

/**
 * Card di un pacchetto del negozio (Figma: PackCard).
 * Senza `image` mostra il segnaposto "Artwork pacchetto".
 */
export default function PackCard({ name, description, price, image, onBuy }) {
  return (
    <article className="pack-card">
      {image ? (
        <img className="pack-card__image" src={image} alt="" />
      ) : (
        <div className="pack-card__image pack-card__image--placeholder">
          <Icon name="image" size={24} />
          <span>Artwork pacchetto</span>
        </div>
      )}
      <div className="pack-card__body">
        <h3 className="pack-card__title">{name}</h3>
        <p className="pack-card__description">{description}</p>
        <div className="pack-card__footer">
          <Price amount={price} />
          <button type="button" className="button" onClick={onBuy} aria-label={`Acquista ${name}`}>
            Acquista
          </button>
        </div>
      </div>
    </article>
  );
}
