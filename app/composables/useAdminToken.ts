const STORAGE_KEY = 'gw_admin_token'

// Holds the admin bootstrap token for the session: in memory, mirrored to
// sessionStorage so a refresh doesn't force re-entry. It's privileged, so it
// goes to sessionStorage (cleared on tab close), never localStorage.
export function useAdminToken() {
  const token = useState<string>('admin.token', () => '')

  // rehydrate once, client-side only
  if (import.meta.client && !token.value) {
    token.value = sessionStorage.getItem(STORAGE_KEY) || ''
  }

  const hasToken = computed(() => token.value.trim().length > 0)

  function set(value: string) {
    token.value = value.trim()
    if (import.meta.client) sessionStorage.setItem(STORAGE_KEY, token.value)
  }

  function clear() {
    token.value = ''
    if (import.meta.client) sessionStorage.removeItem(STORAGE_KEY)
  }

  return { token, hasToken, set, clear }
}
