import type { components, operations } from './schema'

type Schemas = components['schemas']

export type ApiError = Schemas['ApiError']

export type RegisterRequest = Schemas['RegisterRequest']
export type LoginRequest = Schemas['LoginRequest']
export type TokenResponse = Schemas['TokenResponse']
export type UserProfile = Schemas['UserProfile']

export type Card = Schemas['CardResponse']
export type CardPage = Schemas['PageResponseCardResponse']
export type CardFilter = NonNullable<operations['list_2']['parameters']['query']>

export type CollectionEntry = Schemas['CollectionEntry']
export type CollectionPage = Schemas['PageResponseCollectionEntry']
export type CollectionFilter = NonNullable<operations['list_1']['parameters']['query']>
export type FactionProgress = Schemas['FactionProgress']

export type DeckSummary = Schemas['DeckSummary']
export type Deck = Schemas['DeckDetail']
export type DeckCard = Schemas['DeckCardView']
export type DeckEntry = Schemas['DeckEntry']
export type DeckRequest = Schemas['DeckRequest']
export type DeckContents = Schemas['DeckContents']
export type DeckValidationResult = Schemas['DeckValidationResult']
export type Violation = Schemas['Violation']

export type CreateMatchRequest = Schemas['CreateMatchRequest']
export type AcceptMatchRequest = Schemas['AcceptMatchRequest']
export type MatchListItem = Schemas['MatchListItem']
export type MatchReplay = Schemas['MatchReplay']
export type MatchLog = Schemas['MatchLog']
export type TurnLog = Schemas['TurnLog']
export type FighterLog = Schemas['FighterLog']
export type CardRef = Schemas['CardRef']
export type MatchSummary = Schemas['MatchSummary']
export type CardSummary = Schemas['CardSummary']
export type SnapshotCard = Schemas['SnapshotCard']
export type MatchHistoryItem = Schemas['MatchHistoryItem']
export type MatchHistoryPage = Schemas['PageResponseMatchHistoryItem']
export type PageRequest = NonNullable<operations['history']['parameters']['query']>

/** Values of `MatchListItem.status` and `MatchReplay.status`, from the `match` table of the backend. */
export const MATCH_STATUSES = ['PENDING', 'FINISHED', 'DECLINED', 'CANCELLED'] as const
export type MatchStatus = (typeof MATCH_STATUSES)[number]

/** Values of `MatchHistoryItem.result`, seen from the current user. */
export const MATCH_RESULTS = ['WIN', 'LOSS', 'DRAW'] as const
export type MatchResult = (typeof MATCH_RESULTS)[number]
