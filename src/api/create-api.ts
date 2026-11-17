import { authApi } from './auth'
import { cardsApi } from './cards'
import { collectionApi } from './collection'
import { decksApi } from './decks'
import { createHttpClient, type HttpClientOptions } from './http'
import { matchesApi } from './matches'

export function createApi(options: HttpClientOptions) {
  const now = options.now ?? Date.now
  const http = createHttpClient({ ...options, now })
  return {
    auth: authApi(http, options.tokenStore, now),
    cards: cardsApi(http),
    collection: collectionApi(http),
    decks: decksApi(http),
    matches: matchesApi(http),
  }
}

export type Api = ReturnType<typeof createApi>
