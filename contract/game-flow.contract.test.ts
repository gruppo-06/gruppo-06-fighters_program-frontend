import { beforeAll, describe, expect, it } from 'vitest'

import { createApi, type Api } from '../src/api/create-api'
import { ApiRequestError } from '../src/api/errors'
import { memoryTokenStore } from '../src/api/token-store'
import type { CollectionEntry, DeckEntry } from '../src/api/types'

const API_URL = process.env.VITE_API_URL ?? 'http://localhost:8080'
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173'
const PASSWORD = 'contract-test-1'
const DECK_SIZE = 10

const runId = Date.now().toString(36).slice(-6)
const alice = { nickname: `ct_a_${runId}`, email: `ct_a_${runId}@example.com`, password: PASSWORD }
const bob = { nickname: `ct_b_${runId}`, email: `ct_b_${runId}@example.com`, password: PASSWORD }

const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/

/**
 * The backend writes the same instant with a different offset and precision right after saving and when reading it
 * back, so responses are compared as instants rounded to the millisecond.
 */
function withInstants(value: unknown): unknown {
  if (typeof value === 'string' && ISO_DATE_TIME.test(value)) {
    return new Date(value).toISOString()
  }
  if (Array.isArray(value)) {
    return value.map(withInstants)
  }
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, withInstants(inner)]))
  }
  return value
}

function newApi(): Api {
  return createApi({ baseUrl: API_URL, tokenStore: memoryTokenStore() })
}

async function registeredAndLoggedIn(user: typeof alice): Promise<Api> {
  const api = newApi()
  await api.auth.register(user)
  await api.auth.login({ email: user.email, password: user.password })
  return api
}

/** Ten copies of common cards: always valid with the starter collection and the provisional rules. */
function starterDeck(collection: CollectionEntry[]): DeckEntry[] {
  const commons = collection.filter((card) => card.rarity === 'Comune' && card.quantity >= 2)
  return commons.slice(0, DECK_SIZE / 2).map((card) => ({ cardId: card.cardId, copies: 2 }))
}

describe('game flow against the running backend', () => {
  let aliceApi: Api
  let bobApi: Api
  let aliceDeckId: number
  let bobDeckId: number

  beforeAll(async () => {
    aliceApi = await registeredAndLoggedIn(alice)
    bobApi = await registeredAndLoggedIn(bob)
  })

  it('lets the frontend dev server call the API from the browser (CORS)', async () => {
    const preflight = await fetch(`${API_URL}/api/me/decks`, {
      method: 'OPTIONS',
      headers: {
        Origin: FRONTEND_ORIGIN,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization,content-type',
      },
    })

    expect(preflight.status).toBe(200)
    expect(preflight.headers.get('Access-Control-Allow-Origin')).toBe(FRONTEND_ORIGIN)
  })

  it('reads the profile and the public catalog', async () => {
    const profile = await aliceApi.auth.me()
    const catalog = await newApi().cards.list({ size: 5 })
    const firstCard = await newApi().cards.get(catalog.content[0].code)

    expect(profile).toMatchObject({ nickname: alice.nickname, email: alice.email, role: 'PLAYER' })
    expect(catalog.content).toHaveLength(5)
    expect(catalog.totalElements).toBeGreaterThan(5)
    expect(firstCard.code).toBe(catalog.content[0].code)
  })

  it('rejects wrong credentials with the backend error format', async () => {
    const error = await newApi()
      .auth.login({ email: alice.email, password: 'wrong-password' })
      .catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiRequestError)
    expect(error).toMatchObject({ status: 401, code: 'UNAUTHORIZED' })
  })

  it('reads the starter collection and the progress per faction', async () => {
    const collection = await aliceApi.collection.list({ size: 100 })
    const progress = await aliceApi.collection.progress()

    expect(collection.content.length).toBeGreaterThan(0)
    expect(progress.length).toBe(5)
  })

  it('validates, saves and reads a deck', async () => {
    const aliceCards = starterDeck((await aliceApi.collection.list({ size: 100 })).content)
    const bobCards = starterDeck((await bobApi.collection.list({ size: 100 })).content)

    const validation = await aliceApi.decks.validate({ cards: aliceCards })
    const aliceDeck = await aliceApi.decks.create({ name: 'Contract deck', cards: aliceCards })
    const bobDeck = await bobApi.decks.create({ name: 'Contract deck', cards: bobCards })
    aliceDeckId = aliceDeck.id
    bobDeckId = bobDeck.id

    expect(validation).toEqual({ valid: true, violations: [] })
    expect(aliceDeck.cards.reduce((total, card) => total + card.copies, 0)).toBe(DECK_SIZE)
    expect(withInstants(await aliceApi.decks.get(aliceDeckId))).toEqual(withInstants(aliceDeck))
    expect((await aliceApi.decks.list()).map((deck) => deck.id)).toContain(aliceDeckId)
  })

  it('refuses an invalid deck with the list of violations', async () => {
    const validation = await aliceApi.decks.validate({ cards: [] })
    const error = await aliceApi.decks
      .create({ name: 'Empty', cards: [] })
      .catch((caught: unknown) => caught)

    expect(validation.valid).toBe(false)
    expect(validation.violations.map((violation) => violation.code)).toContain('WRONG_SIZE')
    expect(error).toMatchObject({ status: 422, code: 'INVALID_DECK' })
    expect((error as ApiRequestError).details.length).toBeGreaterThan(0)
  })

  it('plays a challenge and reads its replay and the history', async () => {
    const challenge = await aliceApi.matches.challenge({ opponentNickname: bob.nickname, deckId: aliceDeckId })
    const incoming = await bobApi.matches.incoming()
    const pending = await aliceApi.matches.replay(challenge.id)

    const replay = await bobApi.matches.accept(challenge.id, { deckId: bobDeckId })
    const sameReplay = await aliceApi.matches.replay(challenge.id)
    const history = await aliceApi.matches.history({ size: 10 })

    expect(challenge.status).toBe('PENDING')
    expect(incoming.map((match) => match.id)).toContain(challenge.id)
    expect(pending.log).toBeNull()
    expect(replay.status).toBe('FINISHED')
    expect(replay.log?.turns.length).toBeGreaterThan(0)
    expect(replay.challengerDeck).toHaveLength(DECK_SIZE)
    expect(withInstants(sameReplay)).toEqual(withInstants(replay))
    expect(history.content[0]).toMatchObject({ matchId: challenge.id, opponentNickname: bob.nickname })
    expect(['WIN', 'LOSS', 'DRAW']).toContain(history.content[0].result)
  })

  it('cancels and declines challenges', async () => {
    const toCancel = await aliceApi.matches.challenge({ opponentNickname: bob.nickname, deckId: aliceDeckId })
    const toDecline = await aliceApi.matches.challenge({ opponentNickname: bob.nickname, deckId: aliceDeckId })

    const cancelled = await aliceApi.matches.cancel(toCancel.id)
    const declined = await bobApi.matches.decline(toDecline.id)
    const outgoing = await aliceApi.matches.outgoing()

    expect(cancelled.status).toBe('CANCELLED')
    expect(declined.status).toBe('DECLINED')
    expect(outgoing.map((match) => match.id)).toEqual(expect.arrayContaining([toCancel.id, toDecline.id]))
  })

  it('deletes a deck that is not in a pending challenge', async () => {
    const cards = starterDeck((await aliceApi.collection.list({ size: 100 })).content)
    const spare = await aliceApi.decks.create({ name: 'Spare deck', cards })

    await aliceApi.decks.remove(spare.id)

    expect((await aliceApi.decks.list()).map((deck) => deck.id)).not.toContain(spare.id)
  })
})
