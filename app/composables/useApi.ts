import type {
  User,
  LoginResult,
  LoginRequest,
  RegisterRequest,
  MfaLoginRequest,
  SessionSummary,
  TotpSetup,
  RecoveryCodes,
  ConsentRequest,
  CreateClientRequest,
  ClientResponse,
  UserStatus,
  MessageResponse,
  AuditEntry
} from '~/types/gateway'

// Typed, spec-derived client for the Gateway API. Thin wrappers over the shared
// $api fetch instance — cookie auth and error normalization live in that plugin.
export function useApi() {
  const { $api } = useNuxtApp()
  const admin = (token: string) => ({ 'X-Admin-Token': token })

  return {
    // auth
    register: (body: RegisterRequest) =>
      $api<User>('/api/auth/register', { method: 'POST', body }),
    login: (body: LoginRequest) =>
      $api<LoginResult>('/api/auth/login', { method: 'POST', body }),
    loginMfa: (body: MfaLoginRequest) =>
      $api<User>('/api/auth/login/mfa', { method: 'POST', body }),
    me: () => $api<User>('/api/auth/me'),
    logout: () => $api<MessageResponse>('/api/auth/logout', { method: 'POST' }),
    logoutAll: () =>
      $api<MessageResponse>('/api/auth/logout-all', { method: 'POST' }),
    verify: (token: string) =>
      $api<User>('/api/auth/verify', { method: 'POST', body: { token } }),
    resendVerification: () =>
      $api<MessageResponse>('/api/auth/verify/send', { method: 'POST' }),
    forgotPassword: (email: string) =>
      $api<MessageResponse>('/api/auth/password/forgot', {
        method: 'POST',
        body: { email }
      }),
    resetPassword: (token: string, password: string) =>
      $api<MessageResponse>('/api/auth/password/reset', {
        method: 'POST',
        body: { token, password }
      }),

    // external identity providers actually configured on the backend
    externalProviders: () => $api<string[]>('/api/auth/external/providers'),
    // providers the current user has linked (connected) to their account
    identities: () => $api<string[]>('/api/auth/identities'),

    // sessions
    sessions: () => $api<SessionSummary[]>('/api/auth/sessions'),
    revokeSession: (id: string) =>
      $api(`/api/auth/sessions/${id}`, { method: 'DELETE' }),

    // MFA (TOTP)
    mfaStatus: () => $api<{ enabled: boolean }>('/api/mfa/totp/status'),
    mfaSetup: () => $api<TotpSetup>('/api/mfa/totp/setup', { method: 'POST' }),
    mfaConfirm: (code: string) =>
      $api<RecoveryCodes>('/api/mfa/totp/confirm', {
        method: 'POST',
        body: { code }
      }),
    mfaDisable: () =>
      $api<MessageResponse>('/api/mfa/totp', { method: 'DELETE' }),

    // OIDC consent screen
    consent: (body: ConsentRequest) =>
      $api<MessageResponse>('/oauth2/consent', { method: 'POST', body }),

    // admin routes, gated by the X-Admin-Token bootstrap header
    adminClients: (token: string) =>
      $api<ClientResponse[]>('/api/admin/clients', { headers: admin(token) }),
    adminCreateClient: (token: string, body: CreateClientRequest) =>
      $api<ClientResponse>('/api/admin/clients', {
        method: 'POST',
        headers: admin(token),
        body
      }),
    adminDeleteClient: (token: string, id: string) =>
      $api(`/api/admin/clients/${id}`, {
        method: 'DELETE',
        headers: admin(token)
      }),
    adminUsers: (token: string, params?: { limit?: number, offset?: number }) =>
      $api<User[]>('/api/admin/users', { headers: admin(token), params }),
    adminUser: (token: string, id: string) =>
      $api<User>(`/api/admin/users/${id}`, { headers: admin(token) }),
    adminSetUserStatus: (token: string, id: string, status: UserStatus) =>
      $api<User>(`/api/admin/users/${id}/status`, {
        method: 'POST',
        headers: admin(token),
        body: { status }
      }),
    adminUserSessions: (token: string, id: string) =>
      $api<SessionSummary[]>(`/api/admin/users/${id}/sessions`, {
        headers: admin(token)
      }),
    adminRevokeUserSessions: (token: string, id: string) =>
      $api(`/api/admin/users/${id}/revoke-sessions`, {
        method: 'POST',
        headers: admin(token)
      }),
    adminAudit: (token: string, limit = 100) =>
      $api<AuditEntry[]>('/api/admin/audit', {
        headers: admin(token),
        params: { limit }
      }),
    adminRotateKeys: (token: string) =>
      $api<MessageResponse>('/api/admin/keys/rotate', {
        method: 'POST',
        headers: admin(token)
      })
  }
}
