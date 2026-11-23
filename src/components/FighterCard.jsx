import Icon from './Icon.jsx';
import { RARITY_LABELS } from './rarity.js';
import Tag from './Tag.jsx';
import './FighterCard.css';

const STATS = [
  { key: 'atk', label: 'ATK', title: 'Attacco' },
  { key: 'def', label: 'DEF', title: 'Difesa' },
  { key: 'vel', label: 'VEL', title: 'Velocità' },
  { key: 'crt', label: 'CRT', title: 'Critico' },
];

/**
 * Carta fighter con statistiche (Figma: FighterCard).
 * Le misure interne sono in unità `cqi`: la carta si adatta alla larghezza
 * del contenitore, quindi basta dimensionarla dall'esterno (es. width: 15rem).
 *
 * Varianti (Figma: rarity):
 * - comune | rara | epica | leggendaria → bordo del colore della rarità;
 *   le leggendarie hanno un bagliore e mostrano l'abilità (`ability`) al posto delle sottocarte
 * - effetto → carta Effetto: bordo tratteggiato, `description` al posto delle statistiche
 *
 * @param {object} fighter  { number, name, role, region, element, rarity, image, stats,
 *                            subcards, maxSubcards, ability, description }
 * @param {boolean} [owned=true]  false → carta non posseduta (opacità 40%)
 */
export default function FighterCard({ fighter, owned = true, className = '' }) {
  const {
    number,
    name,
    role,
    region,
    element,
    rarity,
    image,
    stats,
    subcards = 0,
    maxSubcards = 3,
    ability,
    description,
  } = fighter;
  const isEffect = rarity === 'effetto';

  const classes = ['fighter-card', `fighter-card--${rarity}`, !owned && 'is-locked', className]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={classes}>
      <div className="fighter-card__art">
        {image ? (
          <img src={image} alt="" loading="lazy" />
        ) : (
          <Icon name="image" size={24} className="fighter-card__placeholder" />
        )}
        <span className="fighter-card__number">#{number}</span>
        <Tag tone={isEffect ? 'outline' : rarity} className="fighter-card__rarity">
          {RARITY_LABELS[rarity] ?? rarity}
        </Tag>
        {element && <span className="fighter-card__element">{element}</span>}
      </div>

      <div className="fighter-card__body">
        <h3 className="fighter-card__name">{name}</h3>
        <p className="fighter-card__meta">{isEffect ? 'Carta Effetto' : `${role} · ${region}`}</p>

        {isEffect ? (
          <p className="fighter-card__description">{description}</p>
        ) : (
          <>
            <dl className="fighter-card__stats">
              {STATS.map(({ key, label, title }) => (
                <div key={key}>
                  <dt>
                    <abbr title={title}>{label}</abbr>
                  </dt>
                  <dd>{stats[key]}</dd>
                </div>
              ))}
            </dl>

            {ability ? (
              <p className="fighter-card__ability">
                <Icon name="star" size={16} className="fighter-card__ability-icon" />
                {ability}
              </p>
            ) : (
              <p className="fighter-card__subcards">
                Sottocarte
                <span
                  className="fighter-card__slots"
                  role="img"
                  aria-label={`${subcards} su ${maxSubcards}`}
                >
                  {Array.from({ length: maxSubcards }, (_, i) => (
                    <span key={i} className={i < subcards ? 'is-filled' : undefined} />
                  ))}
                </span>
              </p>
            )}
          </>
        )}
      </div>
    </article>
  );
}
