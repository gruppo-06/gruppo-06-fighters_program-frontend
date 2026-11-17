import createClient, { type Client } from 'openapi-fetch'

import { ApiRequestError } from './errors'
import type { paths } from './schema'
import { validAccessToken, type TokenStore } from './token-store'

export type HttpClient = Client<paths>

export interface HttpClientOptions {
  baseUrl: string
  tokenStore: TokenStore
  fetch?: typeof globalThis.fetch
  now?: () => number
  onSessionExpired?: () => void
}

export function createHttpClient(options: HttpClientOptions): HttpClient {
  const now = options.now ?? Date.now
  const client = createClient<paths>({ baseUrl: options.baseUrl, fetch: options.fetch })
  client.use({
    onRequest({ request }) {
      const accessToken = validAccessToken(options.tokenStore, now())
      if (accessToken !== null) {
        request.headers.set('Authorization', `Bearer ${accessToken}`)
      }
      return request
    },
    onResponse({ request, response }) {
      if (response.status === 401 && request.headers.has('Authorization')) {
        options.tokenStore.clear()
        options.onSessionExpired?.()
      }
      return response
    },
  })
  return client
}

interface ClientResult<T> {
  data?: T
  error?: unknown
  response: Response
}

/** Runs a call of the generated client and returns its body, or throws an {@link ApiRequestError}. */
export async function send<T>(call: () => Promise<ClientResult<T>>): Promise<T> {
  let result: ClientResult<T>
  try {
    result = await call()
  } catch (cause) {
    throw ApiRequestError.network(cause)
  }
  if (!result.response.ok) {
    throw ApiRequestError.fromResponse(result.response.status, result.error)
  }
  return result.data as T
}
