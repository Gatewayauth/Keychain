import type { $Fetch } from 'ofetch'
import type { ApiErrorBody } from '~/types/gateway'

// Every failed request throws one of these — it carries the backend's
// { code, message } envelope plus the HTTP status.
export class ApiError extends Error {
  code: string
  status: number
  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

// Central fetch instance for the whole portal. credentials:'include' ships the
// HttpOnly gw_session cookie on every call; error bodies get normalized to
// ApiError. No Authorization header ever — this portal is cookie-only.
export default defineNuxtPlugin(() => {
  const { public: { apiBase, tenantSlug } } = useRuntimeConfig()

  const api = $fetch.create({
    // All portal + OIDC endpoints are tenant-scoped under /t/{slug}.
    baseURL: `${apiBase}/t/${tenantSlug}`,
    credentials: 'include',
    headers: { Accept: 'application/json' },
    onResponseError({ response }) {
      const body = response._data as ApiErrorBody | undefined
      const code = body?.code || 'unknown_error'
      const message = body?.message || response.statusText || 'Request failed'
      throw new ApiError(response.status, code, message)
    }
  }) as $Fetch

  return {
    provide: { api }
  }
})
