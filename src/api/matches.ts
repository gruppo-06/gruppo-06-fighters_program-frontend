import { send, type HttpClient } from './http'
import type {
  AcceptMatchRequest,
  CreateMatchRequest,
  MatchHistoryPage,
  MatchListItem,
  MatchReplay,
  PageRequest,
} from './types'

export function matchesApi(http: HttpClient) {
  return {
    /** Challenges another player with one of your decks; the challenge stays `PENDING` until they answer. */
    challenge: (request: CreateMatchRequest): Promise<MatchListItem> =>
      send(() => http.POST('/api/matches', { body: request })),

    /** Pending challenges received by the current user. */
    incoming: (): Promise<MatchListItem[]> => send(() => http.GET('/api/matches/incoming')),

    /** Challenges sent by the current user, in every status. */
    outgoing: (): Promise<MatchListItem[]> => send(() => http.GET('/api/matches/outgoing')),

    /** Accepts with one of your decks: the server plays the match and returns the full replay. */
    accept: (matchId: number, request: AcceptMatchRequest): Promise<MatchReplay> =>
      send(() =>
        http.POST('/api/matches/{matchId}/accept', { params: { path: { matchId } }, body: request }),
      ),

    decline: (matchId: number): Promise<MatchListItem> =>
      send(() => http.POST('/api/matches/{matchId}/decline', { params: { path: { matchId } } })),

    cancel: (matchId: number): Promise<MatchListItem> =>
      send(() => http.POST('/api/matches/{matchId}/cancel', { params: { path: { matchId } } })),

    /** Decks and turn-by-turn log; `log` and the decks are `null` until the match is finished. */
    replay: (matchId: number): Promise<MatchReplay> =>
      send(() => http.GET('/api/matches/{matchId}', { params: { path: { matchId } } })),

    history: (page: PageRequest = {}): Promise<MatchHistoryPage> =>
      send(() => http.GET('/api/matches/history', { params: { query: page } })),
  }
}
