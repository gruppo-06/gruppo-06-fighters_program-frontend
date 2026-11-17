import { send, type HttpClient } from './http'
import type { TokenStore } from './token-store'
import { validAccessToken } from './token-store'
import type { LoginRequest, RegisterRequest, TokenResponse, UserProfile } from './types'

const MILLISECONDS_PER_SECOND = 1000

export function authApi(http: HttpClient, tokenStore: TokenStore, now: () => number) {
  return {
    /** Creates a player. It does not log in: call `login` afterwards. */
    register: (request: RegisterRequest): Promise<UserProfile> =>
      send(() => http.POST('/api/auth/register', { body: request })),

    /** Logs in and keeps the token, so every following call is authenticated. */
    login: async (request: LoginRequest): Promise<TokenResponse> => {
      const token = await send(() => http.POST('/api/auth/login', { body: request }))
      tokenStore.write({
        accessToken: token.accessToken,
        expiresAt: now() + token.expiresIn * MILLISECONDS_PER_SECOND,
      })
      return token
    },

    logout: (): void => tokenStore.clear(),

    isLoggedIn: (): boolean => validAccessToken(tokenStore, now()) !== null,

    me: (): Promise<UserProfile> => send(() => http.GET('/api/me')),
  }
}
