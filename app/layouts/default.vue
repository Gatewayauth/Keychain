<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { user, isAuthenticated, logout } = useAuth()
const route = useRoute()

const nav = [
  { label: 'Account', to: '/account', icon: 'i-lucide-user-round' },
  { label: 'Security', to: '/account/security', icon: 'i-lucide-shield-check' },
  { label: 'Admin', to: '/admin', icon: 'i-lucide-sliders-horizontal' }
]

function isActive(to: string) {
  return to === '/account' ? route.path === to : route.path.startsWith(to)
}

const initials = computed(() => {
  const s = user.value?.displayName || user.value?.email || '?'
  return s.slice(0, 2).toUpperCase()
})

async function onLogout() {
  await logout()
  await navigateTo('/login')
}

const menu: DropdownMenuItem[][] = [
  [{ label: 'Signed in', type: 'label' as const, avatar: undefined }],
  [
    { label: 'Account', icon: 'i-lucide-user-round', to: '/account' },
    { label: 'Security', icon: 'i-lucide-shield-check', to: '/account/security' }
  ],
  [{ label: 'Sign out', icon: 'i-lucide-log-out', color: 'error' as const, onSelect: onLogout }]
]
</script>

<template>
  <div class="min-h-svh flex flex-col bg-default">
    <header
      class="sticky top-0 z-40 border-b border-default bg-default/80 backdrop-blur supports-[backdrop-filter]:bg-default/65"
    >
      <div class="mx-auto max-w-5xl w-full px-4 h-16 flex items-center gap-4">
        <NuxtLink
          to="/account"
          class="rounded-md p-1 -ms-1 focus-visible:outline-2 outline-primary/40"
        >
          <AppLogo />
        </NuxtLink>

        <nav class="hidden sm:flex items-center gap-1 ms-2">
          <UButton
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            :icon="item.icon"
            :color="isActive(item.to) ? 'primary' : 'neutral'"
            :variant="isActive(item.to) ? 'soft' : 'ghost'"
            size="sm"
          >
            {{ item.label }}
          </UButton>
        </nav>

        <div class="ms-auto flex items-center gap-1.5">
          <UDropdownMenu
            v-if="isAuthenticated"
            :items="menu"
            :content="{ align: 'end' }"
          >
            <UButton
              color="neutral"
              variant="ghost"
              class="px-1.5"
            >
              <span
                class="inline-flex items-center justify-center size-7 rounded-full bg-brand-500/15 text-primary text-xs font-semibold ring-1 ring-brand-500/25"
              >{{ initials }}</span>
              <UIcon
                name="i-lucide-chevron-down"
                class="size-4 text-dimmed"
              />
            </UButton>
          </UDropdownMenu>
          <UButton
            v-else
            to="/login"
            size="sm"
            color="neutral"
            variant="subtle"
          >
            Sign in
          </UButton>
        </div>
      </div>
    </header>

    <main class="flex-1 w-full">
      <div class="mx-auto max-w-5xl w-full px-4 py-8 sm:py-10">
        <slot />
      </div>
    </main>

    <footer class="border-t border-default">
      <div class="mx-auto max-w-5xl w-full px-4 py-5 flex items-center justify-between text-xs text-muted">
        <span class="inline-flex items-center gap-1.5">
          <UIcon
            name="i-lucide-key-round"
            class="size-3.5"
          /> Keychain
        </span>
        <span>© {{ new Date().getFullYear() }}</span>
      </div>
    </footer>
  </div>
</template>
