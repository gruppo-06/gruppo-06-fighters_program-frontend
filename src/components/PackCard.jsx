import Icon from './Icon.jsx';
import Price from './Price.jsx';
import { RARITY_LABELS } from './rarity.js';
import Tag from './Tag.jsx';
import './PackCard.css';

const RARITY_TONES = {
  Comune: 'comune',
  Rara: 'rara',
  Epica: 'epica',
  Leggendaria: 'leggendaria',
};

/** Composizione di un pacchetto per rarità (es. 4 Comuni, 1 Rara). */
export function PackContents({ contents = [], className = '' }) {
  if (!contents.length) return null;

  return (
    <ul
      className={`pack-contents ${className}`.trim()}
      role="list"
      aria-label="Composizione del pacchetto"
    >
      {contents.map(({ rarity, cardCount }) => (
        <li key={rarity}>
          <Tag tone={RARITY_TONES[rarity] ?? 'outline'}>
            {cardCount} × {RARITY_LABELS[rarity?.toLowerCase()] ?? rarity}
          </Tag>
        </li>
      ))}
    </ul>
  );
}

/**
 * Card di un pacchetto del negozio (Figma: PackCard).
 * Senza `image` mostra il segnaposto "Artwork pacchetto".
 */
export default function PackCard({
  name,
  description,
  price,
  totalCards,
  contents = [],
  image,
  onBuy,
  buying = false,
}) {
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
        {contents.length > 0 && (
          <div className="pack-card__composition">
            <p className="pack-card__composition-label">
              {totalCards != null ? `${totalCards} carte` : 'Composizione'}
            </p>
            <PackContents contents={contents} />
          </div>
        )}
        <div className="pack-card__footer">
          <Price amount={price} />
          <button
            type="button"
            className="button"
            onClick={onBuy}
            disabled={buying}
            aria-label={`Apri ${name}`}
          >
            {buying ? 'Apertura…' : 'Apri'}
          </button>
        </div>
      </div>
    </article>
  );
}
