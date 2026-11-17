import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import Avatar from './Avatar.jsx';
import CreditsPill from './CreditsPill.jsx';
import './UserMenu.css';

/**
 * Parte destra dell'header che dipende dall'utente:
 * - giocatore autenticato → crediti + avatar (link al profilo)
 * - visitatore            → bottone "Accedi"
 *
 * Si aspetta che il backend risponda a GET /me con
 * { username, credits, avatarUrl } (da concordare con il backend).
 */
export default function UserMenu() {
  // undefined = in caricamento, null = non autenticato
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/me')
      .then((data) => !cancelled && setUser(data ?? null))
      .catch(() => !cancelled && setUser(null));
    return () => {
      cancelled = true;
    };
  }, []);

  // Durante il caricamento non mostriamo nulla per evitare uno "sfarfallio"
  if (user === undefined) return null;

  if (!user) {
    return (
      <a className="button button--secondary" href="/app/login">
        Accedi
      </a>
    );
  }

  return (
    <div className="user-menu">
      <CreditsPill amount={user.credits ?? 0} />
      <a className="user-menu__profile" href="/app/profilo" aria-label="Il tuo profilo">
        <Avatar src={user.avatarUrl} />
      </a>
    </div>
  );
}
