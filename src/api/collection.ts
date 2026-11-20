import { send, type HttpClient } from './http'
import type { CollectionFilter, CollectionPage, FactionProgress } from './types'

export function collectionApi(http: HttpClient) {
  return {
    /** Cards owned by the current user, with how many copies. */
    list: (filter: CollectionFilter = {}): Promise<CollectionPage> =>
      send(() => http.GET('/api/me/collection', { params: { query: filter } })),

    /** Owned and total cards for each faction. */
    progress: (): Promise<FactionProgress[]> => send(() => http.GET('/api/me/collection/progress')),
  }
}
