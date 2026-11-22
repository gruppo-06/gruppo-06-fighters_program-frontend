/** Fase 1: avversario trovato e conto alla rovescia (Figma: GIOCA – Matchmaking). */
import { useEffect, useState } from 'react';
import Avatar from '../../../components/Avatar.jsx';
import CardBack from '../../../components/CardBack.jsx';

const COUNTDOWN_SECONDS = 3;
const DECK_PREVIEW = 5;

export default function Matchmaking({ match, onStart }) {
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const { me, opponent } = match.players;

  useEffect(() => {
    if (seconds === 0) {
      onStart();
      return undefined;
    }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds, onStart]);

  return (
    <div className="match matchmaking">
      <p className="eyebrow">
        {match.advanced ? 'Modalità avanzata' : 'Modalità base'} · Avversario trovato
      </p>

      <div className="matchmaking__versus">
        <PlayerIntro player={me} />
        <p className="matchmaking__vs" aria-hidden="true">
          VS
        </p>
        <PlayerIntro player={opponent} />
      </div>

      <div className="matchmaking__countdown">
        <h1 aria-live="polite">{seconds > 0 ? `La partita inizia tra ${seconds}` : 'Si parte!'}</h1>
        <p>Il server mescola i mazzi: nessuno dei due giocatori può influenzarlo</p>
      </div>
    </div>
  );
}

function PlayerIntro({ player }) {
  const cardCount = player.deck.length;
  return (
    <section className="player-intro" aria-label={`@${player.username}`}>
      <Avatar size={160} className="player-intro__avatar" />
      <h2 className="player-intro__name">@{player.username}</h2>
      <p className="player-intro__deck">
        Mazzo: {cardCount} {cardCount === 1 ? 'carta' : 'carte'}
      </p>
      <div className="player-intro__cards">
        {Array.from({ length: Math.min(DECK_PREVIEW, cardCount) }, (_, i) => (
          <CardBack key={i} />
        ))}
      </div>
    </section>
  );
}
