/**
 * Partita (Figma: GIOCA). Una sola rotta con tre fasi:
 *   matchmaking → battaglia → risultato
 *
 * La partita è simulata dal server: il client riceve tutti gli eventi
 * e li riproduce come un replay. Per ora i dati sono finti (mockMatch).
 */
import { useCallback, useState } from 'react';
import { mockMatch } from '../../data/mockMatch.js';
import Battaglia from './partita/Battaglia.jsx';
import Matchmaking from './partita/Matchmaking.jsx';
import Risultato from './partita/Risultato.jsx';
import './partita/Partita.css';

export default function Partita() {
  // TODO: con il backend, avviare la ricerca avversario (es. api.post('/matches'))
  // e ricevere da lì la partita al posto di mockMatch
  const match = mockMatch;

  /** @type {['matchmaking' | 'battaglia' | 'risultato', Function]} */
  const [phase, setPhase] = useState('matchmaking');
  // Cambiando la key, Battaglia riparte da zero (usato da "Rivedi il replay")
  const [replayKey, setReplayKey] = useState(0);

  const startBattle = useCallback(() => setPhase('battaglia'), []);
  const showResult = useCallback(() => setPhase('risultato'), []);

  function replay() {
    setReplayKey((key) => key + 1);
    setPhase('battaglia');
  }

  // TODO: "Rivincita" sfida lo stesso avversario, "Gioca ancora" ne cerca uno nuovo.
  // Senza backend entrambi riavviano la stessa partita finta.
  function newMatch() {
    setReplayKey((key) => key + 1);
    setPhase('matchmaking');
  }

  if (phase === 'matchmaking') {
    return <Matchmaking match={match} onStart={startBattle} />;
  }

  const finished = phase === 'risultato';

  return (
    <>
      <Battaglia key={replayKey} match={match} onEnd={showResult} finished={finished} />
      {finished && (
        <Risultato match={match} onReplay={replay} onRematch={newMatch} onPlayAgain={newMatch} />
      )}
    </>
  );
}
