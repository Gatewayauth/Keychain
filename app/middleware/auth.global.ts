/**
 * Session guard. `/account/*` requires a resolved user; unauthenticated
 * visitors are bounced to /login with a redirect back. Admin (`/admin`) is
 * gated by its own token, and the OIDC `/oauth2/authorize` route drives its
 * own login handshake — neither is guarded here.
 */
const PROTECTED = ['/account']
const AUTH_PAGES = ['/login', '/register']

export default defineNuxtRouteMiddleware(async (to) => {
  const { ready, isAuthenticated, fetchMe } = useAuth()

  // Resolve session once per app load.
  if (!ready.value) await fetchMe()

  // Landing route: send straight to the right place in a single hop.
  if (to.path === '/') {
    return navigateTo(isAuthenticated.value ? '/account' : '/login', { replace: true })
  }

  const needsAuth = PROTECTED.some(p => to.path === p || to.path.startsWith(p + '/'))

  if (needsAuth && !isAuthenticated.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  // Keep signed-in users out of the login/register screens.
  if (AUTH_PAGES.includes(to.path) && isAuthenticated.value) {
    return navigateTo('/account')
  }
})
