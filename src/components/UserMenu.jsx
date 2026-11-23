import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { currentPlayer, logout, onCreditsChanged } from '../services/auth.js';
import Avatar from './Avatar.jsx';
import CreditsPill from './CreditsPill.jsx';
import './UserMenu.css';

/**
 * Parte destra dell'header: saldo crediti, nickname e uscita del giocatore autenticato.
 * Il saldo si aggiorna quando una pagina segnala un cambio (notifyCreditsChanged).
 */
export default function UserMenu() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      currentPlayer()
        .then((data) => !cancelled && setPlayer(data))
        .catch(() => !cancelled && setPlayer(null));
    load();
    const stopListening = onCreditsChanged(load);
    return () => {
      cancelled = true;
      stopListening();
    };
  }, []);

  if (!player) return null;

  return (
    <div className="user-menu">
      <CreditsPill amount={player.balance} />
      <span className="user-menu__nickname">{player.nickname}</span>
      <Avatar />
      <button
        className="button button--secondary user-menu__logout"
        type="button"
        onClick={() => {
          logout();
          navigate('/accesso');
        }}
      >
        Esci
      </button>
    </div>
  );
}
