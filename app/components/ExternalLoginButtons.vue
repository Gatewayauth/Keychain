<script setup lang="ts">
import type { ExternalProvider } from '~/types/gateway'

// These MUST be full-page navigations (the backend 302s to the provider),
// never fetch — so we render real anchors to the backend start endpoint.
const { public: { apiBase, tenantSlug } } = useRuntimeConfig()

// Only render providers the backend actually has configured.
const { providers, load } = useExternalProviders()
onMounted(load)

// Where to send the browser after login. Passed through the external flow so a
// pending OIDC authorize request resumes instead of dumping the user on /account.
const props = defineProps<{ redirect?: string }>()

const meta: Record<ExternalProvider, { label: string, icon: string }> = {
  google: { label: 'Google', icon: 'i-simple-icons-google' },
  github: { label: 'GitHub', icon: 'i-simple-icons-github' },
  discord: { label: 'Discord', icon: 'i-simple-icons-discord' }
}

const href = (p: ExternalProvider) => {
  const base = `${apiBase}/t/${tenantSlug}/api/auth/external/${p}/start`
  return props.redirect ? `${base}?redirect=${encodeURIComponent(props.redirect)}` : base
}
</script>

<template>
  <div class="grid grid-cols-3 gap-2">
    <UButton
      v-for="p in providers"
      :key="p"
      :href="href(p)"
      :icon="meta[p].icon"
      :aria-label="`Continue with ${meta[p].label}`"
      color="neutral"
      variant="outline"
      block
      class="justify-center"
    />
  </div>
</template>
