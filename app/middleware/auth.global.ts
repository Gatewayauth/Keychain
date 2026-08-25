/**
 * Session guard. `/account/*` and `/admin/*` require a resolved user;
 * unauthenticated visitors are bounced to /login with a redirect back. `/admin`
 * additionally requires an admin role. The OIDC `/oauth2/authorize` route drives
 * its own login handshake and is not guarded here.
 */
const PROTECTED = ['/account', '/admin']
const AUTH_PAGES = ['/login', '/register']

const isUnder = (path: string, base: string) => path === base || path.startsWith(base + '/')

export default defineNuxtRouteMiddleware(async (to) => {
  const { ready, isAuthenticated, isAdmin, fetchMe } = useAuth()

  // Resolve session once per app load.
  if (!ready.value) await fetchMe()

  // Landing route: send straight to the right place in a single hop.
  if (to.path === '/') {
    return navigateTo(isAuthenticated.value ? '/account' : '/login', { replace: true })
  }

  const needsAuth = PROTECTED.some(p => isUnder(to.path, p))

  if (needsAuth && !isAuthenticated.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  // Admin area requires an admin role; other signed-in users are sent to /account.
  if (isUnder(to.path, '/admin') && isAuthenticated.value && !isAdmin.value) {
    return navigateTo('/account')
  }

  // Keep signed-in users out of the login/register screens.
  if (AUTH_PAGES.includes(to.path) && isAuthenticated.value) {
    return navigateTo('/account')
  }
})
