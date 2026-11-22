/** Fase 3: esito della partita e ricompense (Figma: GIOCA – Fine partita). */
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/Icon.jsx';
import Tag from '../../../components/Tag.jsx';
import { EXIT_PATH } from './paths.js';

const numberFormat = new Intl.NumberFormat('it-IT');

export default function Risultato({ match, onReplay, onRematch, onPlayAgain }) {
  const { result, players, events } = match;
  const last = events.at(-1);
  const won = result.winner === 'me';
  const { rewards, trophies, progress } = result;
  const playAgainRef = useRef(null);

  // Porta il focus nella finestra appena si apre
  useEffect(() => {
    playAgainRef.current?.focus();
  }, []);

  const opponent = `@${players.opponent.username}`;
  const finalHp = `PV finali ${last.state.hp.me} – ${last.state.hp.opponent}`;

  return (
    <div className="result-backdrop">
      <section
        className={`result ${won ? 'result--won' : 'result--lost'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-title"
      >
        <span className="result__badge">
          <Icon name="trophy" size={32} />
        </span>

        <p className="eyebrow">Partita conclusa · Turno {last.turn}</p>
        <h1 id="result-title" className="result__title">
          {won ? 'Vittoria!' : 'Sconfitta'}
        </h1>
        <p className="result__summary">
          {won ? `Hai sconfitto ${opponent}` : `${opponent} ti ha sconfitto`} · {finalHp}
        </p>

        <ul className="result__rewards" role="list" aria-label="Ricompense">
          <li>
            <Tag tone="rara">+{rewards.credits} crediti</Tag>
          </li>
          <li>
            <Tag tone="epica">+{rewards.xp} XP</Tag>
          </li>
          {rewards.levelTo > rewards.levelFrom && (
            <li>
              <Tag tone="leggendaria">
                Liv. {rewards.levelFrom} → {rewards.levelTo}
              </Tag>
            </li>
          )}
        </ul>

        {trophies.map((trophy) => (
          <div key={trophy.title} className="result__trophy">
            <span className="result__trophy-badge">
              <Icon name="trophy" size={18} />
            </span>
            <div>
              <p className="result__trophy-title">Trofeo sbloccato · {trophy.title}</p>
              <p className="result__trophy-reward">Premio: +{trophy.reward} crediti</p>
              <p className="result__trophy-status">Sbloccato · +{trophy.reward}</p>
            </div>
          </div>
        ))}

        <div className="result__level">
          <div
            className="progress-bar"
            role="progressbar"
            aria-label={`Esperienza livello ${progress.level}`}
            aria-valuenow={progress.xp}
            aria-valuemin={0}
            aria-valuemax={progress.xpNext}
          >
            <span
              className="progress-bar__fill"
              style={{ '--value': `${(progress.xp / progress.xpNext) * 100}%` }}
            />
          </div>
          <p>
            Livello {progress.level} · {numberFormat.format(progress.xp)} /{' '}
            {numberFormat.format(progress.xpNext)} XP
          </p>
        </div>

        <div className="result__actions">
          <button type="button" className="button button--secondary button--lg" onClick={onReplay}>
            Rivedi il replay
          </button>
          <button type="button" className="button button--secondary button--lg" onClick={onRematch}>
            Rivincita
          </button>
          <button
            ref={playAgainRef}
            type="button"
            className="button button--lg"
            onClick={onPlayAgain}
          >
            <Icon name="play" size={16} />
            Gioca ancora
          </button>
        </div>

        <Link className="result__exit" to={EXIT_PATH}>
          Torna alla dashboard
        </Link>
      </section>
    </div>
  );
}
