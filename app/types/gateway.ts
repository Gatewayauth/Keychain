import type { components } from './api'

type S = components['schemas']

export type User = S['UserResponse']
export type MfaChallenge = S['MfaChallengeResponse']
export type LoginRequest = S['LoginRequest']
export type RegisterRequest = S['RegisterRequest']
export type MfaLoginRequest = S['MfaLoginRequest']
export type SessionSummary = S['SessionSummary']
export type TotpSetup = S['TotpSetupResponse']
export type RecoveryCodes = S['RecoveryCodesResponse']
export type ConsentRequired = S['ConsentRequired']
export type ConsentRequest = S['ConsentRequest']
export type CreateClientRequest = S['CreateClientRequest']
export type UpdateClientRequest = S['UpdateClientRequest']
export type ClientResponse = S['ClientResponse']
export type UserStatus = S['UserStatusRequest']['status']
export type UserRole = S['UserRoleRequest']['role']
export type RbacRole = S['RoleResponse']
export type CreateRoleRequest = S['CreateRoleRequest']
export type UpdateRoleRequest = S['UpdateRoleRequest']
export type MessageResponse = S['MessageResponse']
export type ApiErrorBody = S['ErrorResponse']

/** login can resolve to a user OR an MFA challenge. */
export type LoginResult = User | MfaChallenge

export function isMfaChallenge(r: LoginResult): r is MfaChallenge {
  return (r as MfaChallenge)?.mfaRequired === true
}

/** Admin audit rows are untyped in the spec; keep them loose but useful. */
export interface AuditEntry {
  id?: string
  // Actual backend shape:
  at?: number
  event_type?: string
  actor_user_id?: string
  actor_label?: string
  // Legacy/defensive fallbacks:
  ts?: number
  time?: number
  action?: string
  event?: string
  actor?: string
  actor_id?: string
  user_id?: string
  ip?: string
  detail?: string
  data?: unknown
  [k: string]: unknown
}

export const EXTERNAL_PROVIDERS = ['google', 'github', 'discord'] as const
export type ExternalProvider = (typeof EXTERNAL_PROVIDERS)[number]
