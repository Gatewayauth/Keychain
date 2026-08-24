import { ApiError } from '~/plugins/api'

/** Human-readable message from any thrown value (ApiError or otherwise). */
export function apiErrorMessage(e: unknown, fallback = 'Something went wrong'): string {
  if (e instanceof ApiError) return e.message
  if (e instanceof Error && e.message) return e.message
  return fallback
}

/** Machine code from a thrown ApiError, if present. */
export function apiErrorCode(e: unknown): string | null {
  return e instanceof ApiError ? e.code : null
}
