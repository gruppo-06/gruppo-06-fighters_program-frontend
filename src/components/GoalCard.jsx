import Icon from './Icon.jsx';
import ProgressBar from './ProgressBar.jsx';
import Tag from './Tag.jsx';
import './GoalCard.css';

/**
 * Card grande di un traguardo vicino (Figma: GoalCard), usata in "Prossimi traguardi".
 * Senza `image` mostra il segnaposto dell'illustrazione del trofeo.
 *
 * @param {string} tag  es. "Collezione · Oro"
 * @param {{current: number, target: number}} progress
 * @param {number|string} reward  crediti o premio speciale (es. "Cornice avatar")
 */
export default function GoalCard({ tag, title, description, progress, reward, image }) {
  const percent = (progress.current / progress.target) * 100;

  return (
    <article className="goal-card">
      {image ? (
        <img className="goal-card__image" src={image} alt="" />
      ) : (
        <div className="goal-card__image goal-card__image--placeholder">
          <Icon name="image" size={24} />
        </div>
      )}
      <Tag tone="outline">{tag}</Tag>
      <h3 className="goal-card__title">{title}</h3>
      <p className="goal-card__description">{description}</p>
      <ProgressBar
        value={percent}
        label={`Avanzamento: ${progress.current} su ${progress.target}`}
      />
      <div className="goal-card__progress">
        <p className="goal-card__count">
          {progress.current} / {progress.target}
        </p>
        <p className="goal-card__reward">
          Premio:{' '}
          {typeof reward === 'number' ? (
            <>
              +{reward} <Icon name="credits" size={12} />
              <span className="visually-hidden"> crediti</span>
            </>
          ) : (
            reward
          )}
        </p>
      </div>
    </article>
  );
}
