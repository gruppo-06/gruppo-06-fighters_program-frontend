export interface StoredToken {
  accessToken: string
  expiresAt: number
}

export interface TokenStore {
  read(): StoredToken | null
  write(token: StoredToken): void
  clear(): void
}

const STORAGE_KEY = 'fighters-program.token'

export function memoryTokenStore(): TokenStore {
  let token: StoredToken | null = null
  return {
    read: () => token,
    write: (next) => {
      token = next
    },
    clear: () => {
      token = null
    },
  }
}

export function browserTokenStore(storage: Storage = window.localStorage): TokenStore {
  return {
    read: () => {
      const raw = storage.getItem(STORAGE_KEY)
      if (raw === null) {
        return null
      }
      try {
        return JSON.parse(raw) as StoredToken
      } catch {
        storage.removeItem(STORAGE_KEY)
        return null
      }
    },
    write: (token) => storage.setItem(STORAGE_KEY, JSON.stringify(token)),
    clear: () => storage.removeItem(STORAGE_KEY),
  }
}

export function validAccessToken(store: TokenStore, now: number): string | null {
  const token = store.read()
  if (token === null) {
    return null
  }
  if (token.expiresAt <= now) {
    store.clear()
    return null
  }
  return token.accessToken
}
