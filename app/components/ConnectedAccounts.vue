<script setup lang="ts">
import type { ExternalProvider } from '~/types/gateway'

// Full-page navigation (backend 302s to the provider), so real anchors — never fetch.
const { public: { apiBase, tenantSlug } } = useRuntimeConfig()

// Only providers the backend has configured; connected = already linked to this user.
const { providers, load } = useExternalProviders()
const api = useApi()
const connected = ref<string[]>([])

onMounted(async () => {
  await load()
  try {
    connected.value = await api.identities()
  } catch {
    connected.value = []
  }
})

const meta: Record<ExternalProvider, { label: string, icon: string }> = {
  google: { label: 'Google', icon: 'i-simple-icons-google' },
  github: { label: 'GitHub', icon: 'i-simple-icons-github' },
  discord: { label: 'Discord', icon: 'i-simple-icons-discord' }
}

const startHref = (p: ExternalProvider) =>
  `${apiBase}/t/${tenantSlug}/api/auth/external/${p}/start`

const isConnected = (p: ExternalProvider) => connected.value.includes(p)
</script>

<template>
  <ul class="space-y-2">
    <li
      v-for="p in providers"
      :key="p"
      class="flex items-center justify-between gap-3 rounded-lg border border-default px-3 py-2"
    >
      <span class="flex items-center gap-2">
        <UIcon
          :name="meta[p].icon"
          class="size-5"
        />
        <span class="text-sm font-medium">{{ meta[p].label }}</span>
      </span>
      <UBadge
        v-if="isConnected(p)"
        color="success"
        variant="subtle"
        icon="i-lucide-check"
      >
        Connected
      </UBadge>
      <UButton
        v-else
        :href="startHref(p)"
        size="xs"
        color="neutral"
        variant="outline"
      >
        Connect
      </UButton>
    </li>
  </ul>
</template>
