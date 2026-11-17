import { createApi } from './create-api'
import { browserTokenStore } from './token-store'

export const SESSION_EXPIRED_EVENT = 'fighters-program:session-expired'

const DEFAULT_API_URL = 'http://localhost:8080'

/** The API client used by the app. Listen to {@link SESSION_EXPIRED_EVENT} on `window` to go back to the login. */
export const api = createApi({
  baseUrl: import.meta.env.VITE_API_URL ?? DEFAULT_API_URL,
  tokenStore: browserTokenStore(),
  onSessionExpired: () => window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT)),
})

export { createApi, type Api } from './create-api'
export { ApiRequestError, NETWORK_ERROR, UNEXPECTED_RESPONSE } from './errors'
export { browserTokenStore, memoryTokenStore, type TokenStore } from './token-store'
export * from './types'
