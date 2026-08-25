import type { User, LoginResult } from '~/types/gateway'
import { isMfaChallenge } from '~/types/gateway'

// Portal session state. The HttpOnly cookie is the source of truth; this store
// just mirrors the resolved user for the UI. Tokens are never kept here.
export function useAuth() {
  const api = useApi()
  const user = useState<User | null>('auth.user', () => null)
  const ready = useState<boolean>('auth.ready', () => false)

  const isAuthenticated = computed(() => !!user.value)
  // Admin gating is role-based (see backend user-bound admin). OWNER implies ADMIN.
  const isAdmin = computed(() => user.value?.role === 'ADMIN' || user.value?.role === 'OWNER')
  const isOwner = computed(() => user.value?.role === 'OWNER')
  const isSuperAdmin = computed(() => user.value?.superAdmin === true)

  // resolve the current user from the cookie; never throws
  async function fetchMe(): Promise<User | null> {
    try {
      user.value = await api.me()
    } catch {
      user.value = null
    } finally {
      ready.value = true
    }
    return user.value
  }

  // Returns the raw result so the caller can branch on an MFA challenge.
  // A direct (non-challenge) user result populates session state here.
  async function login(email: string, password: string): Promise<LoginResult> {
    const res = await api.login({ email, password })
    if (!isMfaChallenge(res)) user.value = res
    return res
  }

  // finish an MFA challenge; on success the user is stored
  async function completeMfa(mfaToken: string, code: string): Promise<User> {
    const u = await api.loginMfa({ mfaToken, code })
    user.value = u
    return u
  }

  // Logout always clears local state, even if the server call fails, so the
  // caller's post-logout redirect still runs.
  async function logout() {
    try {
      await api.logout()
    } catch {
      // ignore — clear local session regardless
    } finally {
      user.value = null
    }
  }

  async function logoutAll() {
    try {
      await api.logoutAll()
    } catch {
      // ignore — clear local session regardless
    } finally {
      user.value = null
    }
  }

  return {
    user,
    ready,
    isAuthenticated,
    isAdmin,
    isOwner,
    isSuperAdmin,
    fetchMe,
    login,
    completeMfa,
    logout,
    logoutAll
  }
}
