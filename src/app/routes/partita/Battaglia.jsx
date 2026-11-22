/** Fase 2: replay della partita simulata dal server (Figma: GIOCA – Area di gioco). */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../../components/Avatar.jsx';
import CardBack from '../../../components/CardBack.jsx';
import FighterCard from '../../../components/FighterCard.jsx';
import Icon from '../../../components/Icon.jsx';
import Tag from '../../../components/Tag.jsx';
import { EXIT_PATH } from './paths.js';

/** Durata di un round a velocità 1x (ms). */
const ROUND_MS = 2400;
const SPEEDS = [1, 2];

/**
 * @param {boolean} finished  partita conclusa: mostra l'ultimo round, fermo,
 *                            e rende inerte la schermata (sopra c'è il risultato)
 * @param {Function} onEnd    chiamata a fine replay o con "Salta al risultato"
 */
export default function Battaglia({ match, onEnd, finished = false }) {
  const { events, players, startingHp, maxTurns } = match;
  const lastIndex = events.length - 1;

  const [index, setIndex] = useState(finished ? lastIndex : 0);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const logRef = useRef(null);

  // Avanza di un round alla volta; dopo l'ultimo passa al risultato
  useEffect(() => {
    if (finished || paused) return undefined;
    const id = setTimeout(() => {
      if (index < lastIndex) setIndex((i) => i + 1);
      else onEnd();
    }, ROUND_MS / speed);
    return () => clearTimeout(id);
  }, [index, lastIndex, paused, speed, finished, onEnd]);

  // Tiene visibile l'ultimo round della cronaca
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [index, finished]);

  const shownIndex = finished ? lastIndex : index;
  const event = events[shownIndex];
  const { state } = event;
  // La key fa ripartire le animazioni di ingresso a ogni round
  const roundKey = `${event.turn}-${event.round}`;

  return (
    <div className="match battle" inert={finished}>
      <header className="battle-bar">
        <Link className="battle-bar__exit" to={EXIT_PATH}>
          <Icon name="chevron-left" size={16} />
          Esci
        </Link>

        <div className="battle-bar__title">
          <p className="battle-bar__eyebrow">{match.mode} · Replay</p>
          <h1>
            Turno {event.turn} · Round {event.round}
          </h1>
        </div>

        <div className="battle-bar__controls">
          <div className="speed-toggle" role="group" aria-label="Velocità">
            {SPEEDS.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={speed === value}
                onClick={() => setSpeed(value)}
              >
                {value}x
              </button>
            ))}
          </div>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => setPaused((p) => !p)}
          >
            <Icon name={paused ? 'play' : 'pause'} size={14} />
            {paused ? 'Riprendi' : 'Pausa'}
          </button>
          <button type="button" className="button button--secondary" onClick={onEnd}>
            Salta al risultato
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </header>

      <div className="battle-players">
        <PlayerStatus player={players.me} side="me" state={state} startingHp={startingHp} />
        <PlayerStatus
          player={players.opponent}
          side="opponent"
          state={state}
          startingHp={startingHp}
        />
      </div>

      <section className="arena" aria-label="Campo di gioco">
        <div className="arena__deck arena__deck--me">
          <CardBack />
          <p>Mazzo · {state.deck.me}</p>
        </div>

        <Combatant key={`me-${roundKey}`} side="me" hit={event.me} advanced={match.advanced} />

        <div className="arena__vs">
          <p className="arena__vs-label" aria-hidden="true">
            VS
          </p>
          <p>Round {event.round}</p>
        </div>

        <Combatant
          key={`opp-${roundKey}`}
          side="opponent"
          hit={event.opponent}
          advanced={match.advanced}
        />

        <div className="arena__deck arena__deck--opponent">
          <CardBack />
          <p>Mazzo · {state.deck.opponent}</p>
        </div>
      </section>

      <section className="battle-log" aria-label="Cronaca della partita">
        <h2 className="battle-log__title">Cronaca</h2>
        <ol className="battle-log__list" ref={logRef} role="list" aria-live="polite">
          {events.slice(0, shownIndex + 1).map((round, i) => (
            <li
              key={`${round.turn}-${round.round}-${i}`}
              className="battle-log__item"
              aria-current={i === shownIndex ? 'true' : undefined}
            >
              <p className="battle-log__round">
                Turno {round.turn} · Round {round.round}
              </p>
              <p className="battle-log__narration">{round.log}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="battle-progress">
        <div className="battle-progress__labels">
          <span>Avanzamento partita</span>
          <span>
            Turno {event.turn} di {maxTurns}
          </span>
        </div>
        <ProgressBar
          value={event.turn}
          max={maxTurns}
          label={`Turno ${event.turn} di ${maxTurns}`}
        />
      </footer>
    </div>
  );
}

function PlayerStatus({ player, side, state, startingHp }) {
  const hp = state.hp[side];
  return (
    <section className={`player-status player-status--${side}`} aria-label={`@${player.username}`}>
      <Avatar size={48} className="player-status__avatar" />
      <div className="player-status__info">
        <p className="player-status__name">@{player.username}</p>
        <ProgressBar value={hp} max={startingHp} label={`Punti vita di @${player.username}`} />
        <p className="player-status__meta">
          PV {hp} / {startingHp} · Mazzo {state.deck[side]} · Sconfitti {state.defeated[side]}
        </p>
      </div>
    </section>
  );
}

/** Carta in campo con i danni subiti nel round. */
function Combatant({ side, hit, advanced }) {
  return (
    <div className={`combatant combatant--${side} ${hit.ko ? 'is-ko' : ''}`.trim()}>
      <div className="combatant__hit">
        <p className={`combatant__damage ${hit.damage > 0 ? 'is-damage' : ''}`.trim()}>
          {hit.damage > 0 ? `−${hit.damage}` : '0'}
        </p>
        {hit.ko ? (
          <Tag>Sconfitto</Tag>
        ) : (
          <span className="combatant__no-tag" aria-hidden="true">
            <Tag>&nbsp;</Tag>
          </span>
        )}
      </div>
      <div className="combatant__frame">
        <FighterCard fighter={hit.fighter} className="combatant__card" />
        {advanced && <CombatFlags hit={hit} />}
      </div>
    </div>
  );
}

/** Etichette della modalità avanzata, sopra la carta: primo colpo, schivata, critico. */
function CombatFlags({ hit }) {
  if (!hit.first && !hit.dodged && !hit.critical) return null;
  return (
    <div className="combatant__flags">
      {hit.first && (
        <Tag tone="outline" className="combatant__flag combatant__flag--first">
          Primo colpo
        </Tag>
      )}
      {hit.dodged && <Tag className="combatant__flag combatant__flag--dodge">Schivata!</Tag>}
      {hit.critical && <Tag className="combatant__flag combatant__flag--critical">Critico!</Tag>}
    </div>
  );
}

function ProgressBar({ value, max, label }) {
  return (
    <div
      className="progress-bar"
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <span className="progress-bar__fill" style={{ '--value': `${(value / max) * 100}%` }} />
    </div>
  );
}
