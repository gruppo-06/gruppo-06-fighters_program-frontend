import Icon from './Icon.jsx';
import Tag from './Tag.jsx';
import './FighterCard.css';

const RARITY_LABELS = {
  comune: 'Comune',
  rara: 'Rara',
  epica: 'Epica',
  leggendaria: 'Leggendaria',
};

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
 * @param {object} fighter  { number, name, role, region, element, rarity, image, stats, subcards, maxSubcards }
 */
export default function FighterCard({ fighter, className = '' }) {
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
  } = fighter;

  return (
    <article className={`fighter-card ${className}`.trim()}>
      <div className="fighter-card__art">
        {image ? (
          <img src={image} alt="" loading="lazy" />
        ) : (
          <Icon name="image" size={24} className="fighter-card__placeholder" />
        )}
        <span className="fighter-card__number">#{number}</span>
        <Tag tone={rarity} className="fighter-card__rarity">
          {RARITY_LABELS[rarity] ?? rarity}
        </Tag>
        <span className="fighter-card__element">{element}</span>
      </div>

      <div className="fighter-card__body">
        <h3 className="fighter-card__name">{name}</h3>
        <p className="fighter-card__meta">
          {role} · {region}
        </p>

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
      </div>
    </article>
  );
}
