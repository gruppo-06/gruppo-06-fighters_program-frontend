import { describe, expect, it, vi } from 'vitest'

import { createApi } from './create-api'
import { ApiRequestError, NETWORK_ERROR, UNEXPECTED_RESPONSE } from './errors'
import { memoryTokenStore, type TokenStore } from './token-store'

const BASE_URL = 'http://api.test'
const NOW = 1_000_000

interface FakeServer {
  requests: Request[]
  fetch: typeof globalThis.fetch
}

function fakeServer(...responses: Response[]): FakeServer {
  const requests: Request[] = []
  const queue = [...responses]
  const fetch = vi.fn(async (input: RequestInfo | URL) => {
    requests.push(input as Request)
    const next = queue.shift()
    if (next === undefined) {
      throw new Error('No fake response left')
    }
    return next
  })
  return { requests, fetch: fetch as unknown as typeof globalThis.fetch }
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function apiWith(server: FakeServer, tokenStore: TokenStore = memoryTokenStore(), onSessionExpired = vi.fn()) {
  return createApi({ baseUrl: BASE_URL, tokenStore, fetch: server.fetch, now: () => NOW, onSessionExpired })
}

function loggedInStore(): TokenStore {
  const store = memoryTokenStore()
  store.write({ accessToken: 'token-123', expiresAt: NOW + 60_000 })
  return store
}

describe('auth', () => {
  it('logs in, keeps the token until it expires and sends it on the next calls', async () => {
    const server = fakeServer(
      json(200, { accessToken: 'token-123', expiresIn: 3600 }),
      json(200, { id: 1, nickname: 'alice', email: 'alice@example.com', role: 'PLAYER' }),
    )
    const tokenStore = memoryTokenStore()
    const api = apiWith(server, tokenStore)

    await api.auth.login({ email: 'alice@example.com', password: 'secret-123' })
    const profile = await api.auth.me()

    expect(server.requests[0].method).toBe('POST')
    expect(server.requests[0].url).toBe(`${BASE_URL}/api/auth/login`)
    expect(await server.requests[0].json()).toEqual({ email: 'alice@example.com', password: 'secret-123' })
    expect(tokenStore.read()).toEqual({ accessToken: 'token-123', expiresAt: NOW + 3_600_000 })
    expect(server.requests[1].headers.get('Authorization')).toBe('Bearer token-123')
    expect(profile.nickname).toBe('alice')
    expect(api.auth.isLoggedIn()).toBe(true)
  })

  it('does not send an expired token and forgets it', async () => {
    const server = fakeServer(json(200, { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 }))
    const tokenStore = memoryTokenStore()
    tokenStore.write({ accessToken: 'old', expiresAt: NOW - 1 })
    const api = apiWith(server, tokenStore)

    await api.cards.list()

    expect(server.requests[0].headers.has('Authorization')).toBe(false)
    expect(tokenStore.read()).toBeNull()
    expect(api.auth.isLoggedIn()).toBe(false)
  })

  it('forgets the token on logout', () => {
    const tokenStore = loggedInStore()
    const api = apiWith(fakeServer(), tokenStore)

    api.auth.logout()

    expect(tokenStore.read()).toBeNull()
  })

  it('clears the session and notifies when the backend rejects the token', async () => {
    const server = fakeServer(json(401, { code: 'UNAUTHORIZED', message: 'Authentication required', details: [] }))
    const tokenStore = loggedInStore()
    const onSessionExpired = vi.fn()
    const api = apiWith(server, tokenStore, onSessionExpired)

    await expect(api.auth.me()).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' })
    expect(tokenStore.read()).toBeNull()
    expect(onSessionExpired).toHaveBeenCalledOnce()
  })

  it('does not report an expired session for wrong credentials', async () => {
    const server = fakeServer(json(401, { code: 'UNAUTHORIZED', message: 'Invalid email or password', details: [] }))
    const onSessionExpired = vi.fn()
    const api = apiWith(server, memoryTokenStore(), onSessionExpired)

    await expect(api.auth.login({ email: 'a@example.com', password: 'wrong-pass' })).rejects.toBeInstanceOf(
      ApiRequestError,
    )
    expect(onSessionExpired).not.toHaveBeenCalled()
  })
})

describe('errors', () => {
  it('exposes code, message and details of the backend error', async () => {
    const server = fakeServer(
      json(422, { code: 'INVALID_DECK', message: 'The deck breaks the rules', details: ['WRONG_SIZE: ...'] }),
    )
    const api = apiWith(server, loggedInStore())

    const error = await api.decks.create({ name: 'Deck', cards: [] }).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiRequestError)
    expect(error).toMatchObject({
      status: 422,
      code: 'INVALID_DECK',
      message: 'The deck breaks the rules',
      details: ['WRONG_SIZE: ...'],
    })
  })

  it('reports an answer that is not in the backend format', async () => {
    const server = fakeServer(new Response('<html>Bad gateway</html>', { status: 502 }))
    const api = apiWith(server)

    await expect(api.cards.get('AF01')).rejects.toMatchObject({ status: 502, code: UNEXPECTED_RESPONSE })
  })

  it('reports a backend that cannot be reached', async () => {
    const fetch = vi.fn(async () => {
      throw new TypeError('Failed to fetch')
    }) as unknown as typeof globalThis.fetch
    const api = createApi({ baseUrl: BASE_URL, tokenStore: memoryTokenStore(), fetch })

    await expect(api.cards.list()).rejects.toMatchObject({ status: 0, code: NETWORK_ERROR })
  })
})

describe('requests', () => {
  it('sends catalog and collection filters as query parameters', async () => {
    const page = { content: [], page: 1, size: 5, totalElements: 0, totalPages: 0 }
    const server = fakeServer(json(200, page), json(200, page))
    const api = apiWith(server, loggedInStore())

    await api.cards.list({ faction: 'Africana', rarity: 'Rara', page: 1, size: 5 })
    await api.collection.list({ class: 'Assassini' })

    expect(server.requests[0].url).toBe(`${BASE_URL}/api/cards?faction=Africana&rarity=Rara&page=1&size=5`)
    expect(server.requests[1].url).toBe(`${BASE_URL}/api/me/collection?class=Assassini`)
  })

  it('uses the right method, path and body for every deck call', async () => {
    const deck = { id: 7, name: 'Deck', createdAt: '2026-11-17T10:00:00Z', cards: [] }
    const server = fakeServer(
      json(200, []),
      json(200, deck),
      json(201, deck),
      json(200, deck),
      new Response(null, { status: 204 }),
      json(200, { valid: true, violations: [] }),
    )
    const api = apiWith(server, loggedInStore())
    const request = { name: 'Deck', cards: [{ cardId: 3, copies: 2 }] }

    await api.decks.list()
    await api.decks.get(7)
    await api.decks.create(request)
    await api.decks.update(7, request)
    await expect(api.decks.remove(7)).resolves.toBeUndefined()
    await api.decks.validate({ cards: request.cards })

    expect(server.requests.map((sent) => `${sent.method} ${new URL(sent.url).pathname}`)).toEqual([
      'GET /api/me/decks',
      'GET /api/me/decks/7',
      'POST /api/me/decks',
      'PUT /api/me/decks/7',
      'DELETE /api/me/decks/7',
      'POST /api/me/decks/validate',
    ])
    expect(await server.requests[2].json()).toEqual(request)
    expect(await server.requests[5].json()).toEqual({ cards: request.cards })
  })

  it('uses the right method, path and body for every match call', async () => {
    const item = { id: 9, challengerNickname: 'a', opponentNickname: 'b', status: 'PENDING', createdAt: '' }
    const page = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }
    const server = fakeServer(
      json(201, item),
      json(200, []),
      json(200, []),
      json(200, item),
      json(200, item),
      json(200, item),
      json(200, item),
      json(200, page),
    )
    const api = apiWith(server, loggedInStore())

    await api.matches.challenge({ opponentNickname: 'bob', deckId: 4 })
    await api.matches.incoming()
    await api.matches.outgoing()
    await api.matches.accept(9, { deckId: 5 })
    await api.matches.decline(9)
    await api.matches.cancel(9)
    await api.matches.replay(9)
    await api.matches.history({ page: 0, size: 10 })

    expect(server.requests.map((sent) => `${sent.method} ${new URL(sent.url).pathname}`)).toEqual([
      'POST /api/matches',
      'GET /api/matches/incoming',
      'GET /api/matches/outgoing',
      'POST /api/matches/9/accept',
      'POST /api/matches/9/decline',
      'POST /api/matches/9/cancel',
      'GET /api/matches/9',
      'GET /api/matches/history',
    ])
    expect(await server.requests[0].json()).toEqual({ opponentNickname: 'bob', deckId: 4 })
    expect(await server.requests[3].json()).toEqual({ deckId: 5 })
    expect(new URL(server.requests[7].url).search).toBe('?page=0&size=10')
  })
})
