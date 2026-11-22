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

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(isJsonBody && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: isJsonBody ? JSON.stringify(body) : body,
    // TODO: decidere con il backend come gestire l'autenticazione
    // (cookie di sessione → 'include'; token → header Authorization).
    credentials: 'include',
  });

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
