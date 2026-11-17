import { describe, expect, it } from 'vitest'

import { browserTokenStore } from './token-store'

function fakeStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => {
      values.delete(key)
    },
    setItem: (key, value) => {
      values.set(key, value)
    },
  }
}

describe('browserTokenStore', () => {
  it('keeps the token across page reloads', () => {
    const storage = fakeStorage()
    browserTokenStore(storage).write({ accessToken: 'token-123', expiresAt: 42 })

    expect(browserTokenStore(storage).read()).toEqual({ accessToken: 'token-123', expiresAt: 42 })
  })

  it('forgets a corrupted value instead of failing', () => {
    const storage = fakeStorage()
    storage.setItem('fighters-program.token', '{not json')

    expect(browserTokenStore(storage).read()).toBeNull()
    expect(storage.length).toBe(0)
  })

  it('clears the token', () => {
    const storage = fakeStorage()
    const store = browserTokenStore(storage)
    store.write({ accessToken: 'token-123', expiresAt: 42 })

    store.clear()

    expect(store.read()).toBeNull()
  })
})
