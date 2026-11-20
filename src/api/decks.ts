import { send, type HttpClient } from './http'
import type { Deck, DeckContents, DeckRequest, DeckSummary, DeckValidationResult } from './types'

export function decksApi(http: HttpClient) {
  return {
    list: (): Promise<DeckSummary[]> => send(() => http.GET('/api/me/decks')),

    get: (deckId: number): Promise<Deck> =>
      send(() => http.GET('/api/me/decks/{deckId}', { params: { path: { deckId } } })),

    /** Fails with code `INVALID_DECK` (422) and the violations in `details` if the deck breaks a rule. */
    create: (request: DeckRequest): Promise<Deck> => send(() => http.POST('/api/me/decks', { body: request })),

    update: (deckId: number, request: DeckRequest): Promise<Deck> =>
      send(() => http.PUT('/api/me/decks/{deckId}', { params: { path: { deckId } }, body: request })),

    /** Fails with code `CONFLICT` (409) while the deck waits in a challenge. */
    remove: async (deckId: number): Promise<void> => {
      await send(() => http.DELETE('/api/me/decks/{deckId}', { params: { path: { deckId } } }))
    },

    /** Checks a deck without saving it: always answers, with `valid` and the list of violations. */
    validate: (deck: DeckContents): Promise<DeckValidationResult> =>
      send(() => http.POST('/api/me/decks/validate', { body: deck })),
  }
}
