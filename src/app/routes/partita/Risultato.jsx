/** Fase 3: esito della partita e statistiche delle carte (Figma: GIOCA – Fine partita). */
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import FighterCard from '../../../components/FighterCard.jsx';
import Icon from '../../../components/Icon.jsx';
import { EXIT_PATH } from './paths.js';

const END_REASONS = {
  HEALTH_DEPLETED: 'Punti vita esauriti',
  DECK_EXHAUSTED: 'Mazzo esaurito',
  TURN_LIMIT: 'Limite di turni raggiunto',
};

const RESULT_LABELS = {
  won: { title: 'Vittoria!', icon: 'trophy' },
  lost: { title: 'Sconfitta', icon: 'close' },
  draw: { title: 'Pareggio', icon: 'minus' },
};

export default function Risultato({ match, onReplay }) {
  const { result, players, events } = match;
  const last = events.at(-1);
  const opponent = `@${players.opponent.username}`;
  const finalHp = `PV finali ${last.state.hp.me} – ${last.state.hp.opponent}`;
  const outcome = result.winner === 'me' ? 'won' : result.winner === 'opponent' ? 'lost' : 'draw';
  const { title, icon } = RESULT_LABELS[outcome];
  const exitRef = useRef(null);

  // Porta il focus nella finestra appena si apre
  useEffect(() => {
    exitRef.current?.focus();
  }, []);

  const summary =
    outcome === 'won'
      ? `Hai sconfitto ${opponent}`
      : outcome === 'lost'
        ? `${opponent} ti ha sconfitto`
        : `Pareggio con ${opponent}`;

  return (
    <div className="result-backdrop">
      <section
        className={`result result--${outcome}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-title"
      >
        <span className="result__badge">
          <Icon name={icon} size={32} />
        </span>

        <p className="eyebrow">
          Partita conclusa · Turno {last.turn}
          {result.endReason && ` · ${END_REASONS[result.endReason] ?? result.endReason}`}
        </p>
        <h1 id="result-title" className="result__title">
          {title}
        </h1>
        <p className="result__summary">
          {summary} · {finalHp}
        </p>

        <section className="result__cards" aria-labelledby="result-cards-title">
          <h2 id="result-cards-title" className="result__cards-title">
            Carte scese in campo
          </h2>
          <DeckCards
            title="Il tuo mazzo"
            cards={result.cards.filter((card) => card.side === 'me')}
          />
          <DeckCards
            title="Mazzo avversario"
            cards={result.cards.filter((card) => card.side === 'opponent')}
          />
        </section>

        <div className="result__actions">
          <button type="button" className="button button--secondary button--lg" onClick={onReplay}>
            Rivedi
          </button>
          <Link ref={exitRef} className="button button--lg" to={EXIT_PATH}>
            Torna alle sfide
          </Link>
        </div>
      </section>
    </div>
  );
}

function DeckCards({ title, cards }) {
  if (cards.length === 0) return null;
  return (
    <div className="result__deck">
      <h3 className="result__deck-title">{title}</h3>
      <ul className="result__card-list" role="list">
        {cards.map((card) => (
          <li key={`${card.side}-${card.deckPosition}`} className="result__card">
            <FighterCard fighter={card.fighter} className="result__card-fighter" />
            <dl className="result__card-stats">
              <div>
                <dt>Round</dt>
                <dd>{card.roundsPlayed}</dd>
              </div>
              <div>
                <dt>Danni inflitti</dt>
                <dd>{card.damageDealt}</dd>
              </div>
              <div>
                <dt>Danni subiti</dt>
                <dd>{card.damageTaken}</dd>
              </div>
              <div>
                <dt>KO</dt>
                <dd>{card.knockouts}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
