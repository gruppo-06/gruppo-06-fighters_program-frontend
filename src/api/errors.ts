import type { ApiError } from './types'

export const NETWORK_ERROR = 'NETWORK_ERROR'
export const UNEXPECTED_RESPONSE = 'UNEXPECTED_RESPONSE'

/**
 * Thrown by every API function when the backend answers with an error, in the backend's own format
 * `{ code, message, details }`. `status` is 0 when the backend could not be reached at all.
 */
export class ApiRequestError extends Error {
  readonly status: number
  readonly code: string
  readonly details: string[]

  constructor(status: number, error: ApiError) {
    super(error.message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = error.code
    this.details = error.details
  }

  static fromResponse(status: number, body: unknown): ApiRequestError {
    if (isApiError(body)) {
      return new ApiRequestError(status, body)
    }
    return new ApiRequestError(status, {
      code: UNEXPECTED_RESPONSE,
      message: `Unexpected response from the server (HTTP ${status})`,
      details: [],
    })
  }

  static network(cause: unknown): ApiRequestError {
    const error = new ApiRequestError(0, {
      code: NETWORK_ERROR,
      message: 'The server cannot be reached',
      details: [],
    })
    error.cause = cause
    return error
  }
}

function isApiError(body: unknown): body is ApiError {
  if (typeof body !== 'object' || body === null) {
    return false
  }
  const candidate = body as Record<string, unknown>
  return (
    typeof candidate.code === 'string' &&
    typeof candidate.message === 'string' &&
    Array.isArray(candidate.details)
  )
}
