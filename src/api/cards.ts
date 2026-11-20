import { send, type HttpClient } from './http'
import type { Card, CardFilter, CardPage } from './types'

export function cardsApi(http: HttpClient) {
  return {
    /** Public catalog, no login needed. Filters use the Italian names, e.g. `{ faction: 'Africana' }`. */
    list: (filter: CardFilter = {}): Promise<CardPage> =>
      send(() => http.GET('/api/cards', { params: { query: filter } })),

    get: (code: string): Promise<Card> =>
      send(() => http.GET('/api/cards/{code}', { params: { path: { code } } })),
  }
}
