import Icon from './Icon.jsx';
import ProgressBar from './ProgressBar.jsx';
import './TrophyCard.css';

/** Premio come testo: i crediti diventano "+100", gli altri premi restano così. */
function formatReward(reward) {
  return typeof reward === 'number' ? `+${reward}` : reward;
}

/**
 * Card di un trofeo nella griglia (Figma: TrophyCard).
 *
 * @param {'unlocked'|'in-progress'|'locked'} status
 * @param {string} category  es. "Bronzo · Partite"
 * @param {{current: number, target: number}} [progress]
 * @param {number|string} [reward]  crediti o premio speciale
 */
export default function TrophyCard({ status, category, title, description, progress, reward }) {
  const unlocked = status === 'unlocked';
  const locked = status === 'locked';
  const percent = progress && !locked ? (progress.current / progress.target) * 100 : 0;

  return (
    <article className={`trophy-card trophy-card--${status}`}>
      <span className="trophy-card__badge">
        <Icon name={locked ? 'lock' : 'trophy'} size={30} />
      </span>
      <p className="trophy-card__category">{category}</p>
      <h3 className="trophy-card__title">{title}</h3>
      <p className="trophy-card__description">{description}</p>

      {unlocked ? (
        <p className="trophy-card__reward-badge">Sbloccato · {formatReward(reward)}</p>
      ) : (
        <>
          <ProgressBar
            value={percent}
            label={
              locked ? 'Trofeo bloccato' : `Avanzamento: ${progress.current} su ${progress.target}`
            }
          />
          <div className="trophy-card__progress">
            <p className="trophy-card__count">
              {locked ? 'Bloccato' : `${progress.current} / ${progress.target}`}
            </p>
            <p className="trophy-card__reward">
              {locked || reward == null ? (
                <>
                  ???<span className="visually-hidden"> premio nascosto</span>
                </>
              ) : (
                <>
                  <span className="visually-hidden">Premio: </span>
                  {formatReward(reward)}
                </>
              )}
            </p>
          </div>
        </>
      )}
    </article>
  );
}
