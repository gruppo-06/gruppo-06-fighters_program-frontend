import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { onCreditsChanged } from '../services/auth.js';

/** Saldo crediti del giocatore (GET /me/credits), riletto a ogni cambio di saldo. null finché non arriva. */
export function useCredits() {
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    let cancelled = false;

    function refresh() {
      api
        .get('/me/credits')
        .then((credits) => !cancelled && setBalance(credits.balance))
        .catch(() => {});
    }

    refresh();
    const unsubscribe = onCreditsChanged(refresh);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return balance;
}
