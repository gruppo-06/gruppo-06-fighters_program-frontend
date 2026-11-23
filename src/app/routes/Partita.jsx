/**
 * Partita (Figma: GIOCA). Una sola rotta con tre fasi:
 *   matchmaking → battaglia → risultato
 *
 * La partita è simulata dal server: il client riceve il replay completo e lo
 * riproduce. L'id arriva dal parametro `match` della query string.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { ApiError, api } from '../../services/api.js';
import { currentPlayer } from '../../services/auth.js';
import { toBattle } from '../../services/replay.js';
import Battaglia from './partita/Battaglia.jsx';
import Matchmaking from './partita/Matchmaking.jsx';
import { EXIT_PATH } from './partita/paths.js';
import Risultato from './partita/Risultato.jsx';
import './partita/Partita.css';

const LOAD_ERROR = 'Impossibile caricare la partita.';

export default function Partita() {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('match');

  const [loaded, setLoaded] = useState(null);
  /** @type {['matchmaking' | 'battaglia' | 'risultato', Function]} */
  const [phase, setPhase] = useState('matchmaking');
  // Cambiando la key, Battaglia riparte da zero (usato da "Rivedi")
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    if (!matchId) return undefined;

    let active = true;

    Promise.all([api.get(`/matches/${encodeURIComponent(matchId)}`), currentPlayer()])
      .then(([replay, player]) => {
        if (!active) return;
        const match = toBattle(replay, player.nickname);
        setPhase('matchmaking');
        setReplayKey((key) => key + 1);
        setLoaded({ matchId, match, error: null });
      })
      .catch((reason) => {
        if (!active) return;
        setLoaded({
          matchId,
          match: null,
          error:
            reason instanceof ApiError && reason.status === 404
              ? 'Partita non trovata.'
              : LOAD_ERROR,
        });
      });

    return () => {
      active = false;
    };
  }, [matchId]);

  const match = loaded?.matchId === matchId ? loaded.match : null;
  const error = loaded?.matchId === matchId ? loaded.error : null;

  const startBattle = useCallback(() => setPhase('battaglia'), []);
  const showResult = useCallback(() => setPhase('risultato'), []);

  function replay() {
    setReplayKey((key) => key + 1);
    setPhase('battaglia');
  }

  if (!matchId) {
    return <Navigate to={EXIT_PATH} replace />;
  }

  if (error) {
    return (
      <div className="match partita-state" role="alert">
        <h1>Partita non disponibile</h1>
        <p>{error}</p>
        <Link className="button button--lg" to={EXIT_PATH}>
          Torna alle sfide
        </Link>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="match partita-state" role="status">
        <p>Caricamento della partita…</p>
      </div>
    );
  }

  if (phase === 'matchmaking') {
    return <Matchmaking match={match} onStart={startBattle} />;
  }

  const finished = phase === 'risultato';

  return (
    <>
      <Battaglia key={replayKey} match={match} onEnd={showResult} finished={finished} />
      {finished && <Risultato match={match} onReplay={replay} />}
    </>
  );
}
