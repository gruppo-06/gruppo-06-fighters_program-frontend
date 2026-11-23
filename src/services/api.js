/**
 * Client HTTP verso il backend.
 *
 * L'URL base si configura con la variabile VITE_API_URL nel file .env
 * (vedi .env.example). Tutte le chiamate al backend devono passare da qui.
 *
 * Esempio:
 *   import { api } from '../services/api.js';
 *   const carte = await api.get('/cards');
 *   await api.post('/auth/login', { email, password });
 */

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');
const TOKEN_KEY = 'fighters-program.token';

/** Origine del backend (es. http://localhost:8080), per gli URL che il backend restituisce già con /api/... */
export const API_ORIGIN = BASE_URL ? new URL(BASE_URL).origin : '';

/** URL assoluto di una risorsa del backend a partire dal percorso che restituisce (es. imageUrl). */
export function backendUrl(path) {
  return path ? `${API_ORIGIN}${path}` : null;
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // localStorage non disponibile (es. navigazione privata bloccata): la sessione dura quanto la pagina
  }
}

if (!BASE_URL && import.meta.env.DEV) {
  console.warn('[api] VITE_API_URL non impostata: copia .env.example in .env');
}

/** Errore lanciato quando il backend risponde con uno status non 2xx. */
export class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Esegue una richiesta e restituisce il JSON della risposta
 * (o null se la risposta non ha corpo).
 *
 * @param {string} path percorso relativo, es. '/cards'
 * @param {RequestInit & { body?: unknown }} [options]
 */
export async function request(path, options = {}) {
  const { body, headers, ...rest } = options;
  const isJsonBody = body !== undefined && !(body instanceof FormData);
  const token = getToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(isJsonBody && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: isJsonBody ? JSON.stringify(body) : body,
  });

  if (response.status === 401 && token) {
    setToken(null);
  }

  const contentType = response.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(response.status, data?.message ?? response.statusText, data);
  }

  return data;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
