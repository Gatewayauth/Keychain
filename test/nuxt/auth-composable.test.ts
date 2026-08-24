import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mocks = vi.hoisted(() => ({
  me: vi.fn(),
  login: vi.fn(),
  loginMfa: vi.fn(),
  logout: vi.fn(),
  logoutAll: vi.fn()
}))

mockNuxtImport('useApi', () => () => mocks)

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // reset shared session state between tests
    useAuth().user.value = null
  })

  it('fetchMe populates the user', async () => {
    mocks.me.mockResolvedValueOnce({ id: '1', email: 'a@b.c' })
    const { fetchMe, isAuthenticated } = useAuth()
    const u = await fetchMe()
    expect(u?.email).toBe('a@b.c')
    expect(isAuthenticated.value).toBe(true)
  })

  it('fetchMe swallows errors and clears the user', async () => {
    mocks.me.mockRejectedValueOnce(new Error('401'))
    const { fetchMe, isAuthenticated, ready } = useAuth()
    await fetchMe()
    expect(isAuthenticated.value).toBe(false)
    expect(ready.value).toBe(true)
  })

  it('login does NOT set user on an MFA challenge', async () => {
    mocks.login.mockResolvedValueOnce({ mfaRequired: true, mfaToken: 'tok' })
    const { login, user } = useAuth()
    const res = await login('a@b.c', 'pw')
    expect(res).toMatchObject({ mfaRequired: true })
    expect(user.value).toBeNull()
  })

  it('login sets user on a direct result', async () => {
    mocks.login.mockResolvedValueOnce({ id: '2', email: 'x@y.z' })
    const { login, user } = useAuth()
    await login('x@y.z', 'pw')
    expect(user.value?.email).toBe('x@y.z')
  })

  it('completeMfa sets the user', async () => {
    mocks.loginMfa.mockResolvedValueOnce({ id: '3', email: 'm@f.a' })
    const { completeMfa, user } = useAuth()
    await completeMfa('tok', '123456')
    expect(user.value?.id).toBe('3')
  })

  it('logout clears the user even if the request fails', async () => {
    mocks.logout.mockRejectedValueOnce(new Error('boom'))
    const auth = useAuth()
    auth.user.value = { id: '9' }
    await auth.logout()
    expect(auth.user.value).toBeNull()
  })
})
