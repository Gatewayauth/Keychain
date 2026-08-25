import { EXTERNAL_PROVIDERS, type ExternalProvider } from '~/types/gateway'

// Which external providers the backend actually has configured (both client id
// and secret set). The backend only wires up enabled providers, so the login /
// account UI can render just those instead of the full known set.
//
// Cached in useState so login.vue, account, and the buttons component share one
// request per session.
export function useExternalProviders() {
  const providers = useState<ExternalProvider[]>('external-providers', () => [])
  const loaded = useState<boolean>('external-providers-loaded', () => false)

  async function load() {
    if (loaded.value) return
    try {
      const ids = await useApi().externalProviders()
      // Keep our known order (google, github, discord) and drop anything the
      // backend doesn't report as enabled.
      providers.value = EXTERNAL_PROVIDERS.filter(p => ids.includes(p))
    } catch {
      providers.value = []
    } finally {
      loaded.value = true
    }
  }

  return { providers, load }
}
