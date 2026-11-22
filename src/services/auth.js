/**
 * Accesso del giocatore: il backend restituisce un token JWT che api.js
 * aggiunge a ogni richiesta (header Authorization).
 */
import { api, getToken, setToken } from './api.js';

export function isLoggedIn() {
  return Boolean(getToken());
}

export async function login(email, password) {
  const { accessToken } = await api.post('/auth/login', { email, password });
  setToken(accessToken);
}

export async function register(nickname, email, password) {
  await api.post('/auth/register', { nickname, email, password });
  await login(email, password);
}

export function logout() {
  setToken(null);
}

/** Profilo e saldo dell'utente corrente: { nickname, role, balance }. */
export async function currentPlayer() {
  const [profile, credits] = await Promise.all([api.get('/me'), api.get('/me/credits')]);
  return { nickname: profile.nickname, role: profile.role, balance: credits.balance };
}

const CREDITS_CHANGED = 'fighters-program:credits-changed';

/** Da chiamare dopo un'operazione che cambia il saldo (es. apertura di un pacchetto). */
export function notifyCreditsChanged() {
  window.dispatchEvent(new Event(CREDITS_CHANGED));
}

/** Registra `listener` per i cambi di saldo e restituisce la funzione per rimuoverlo. */
export function onCreditsChanged(listener) {
  window.addEventListener(CREDITS_CHANGED, listener);
  return () => window.removeEventListener(CREDITS_CHANGED, listener);
}
