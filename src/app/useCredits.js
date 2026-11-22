import { useEffect, useState } from 'react';
import { getBalance } from '../data/mockShop.js';
import { api } from '../services/api.js';

/** Crediti del giocatore: GET /me, con saldo finto finché il backend non risponde. */
export function useCredits() {
  const [serverCredits, setServerCredits] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/me')
      .then((user) => !cancelled && setServerCredits(user?.credits ?? null))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return getBalance(serverCredits);
}
