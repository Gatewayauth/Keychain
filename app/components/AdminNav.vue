<script setup lang="ts">
const route = useRoute()

const tabs = [
  { label: 'Clients', to: '/admin/clients', icon: 'i-lucide-app-window' },
  { label: 'Users', to: '/admin/users', icon: 'i-lucide-users-round' },
  { label: 'Audit', to: '/admin/audit', icon: 'i-lucide-scroll-text' },
  { label: 'Keys', to: '/admin/keys', icon: 'i-lucide-key-square' }
]

const isActive = (to: string) => route.path === to || route.path.startsWith(to + '/')
</script>

<template>
  <div class="mb-6 flex items-center justify-between gap-4 border-b border-default">
    <nav class="flex items-center gap-1 -mb-px overflow-x-auto">
      <NuxtLink
        v-for="t in tabs"
        :key="t.to"
        :to="t.to"
        class="inline-flex items-center gap-2 px-3 py-2.5 text-sm border-b-2 transition-colors whitespace-nowrap"
        :class="isActive(t.to)
          ? 'border-primary text-highlighted'
          : 'border-transparent text-muted hover:text-default'"
      >
        <UIcon
          :name="t.icon"
          class="size-4"
        />
        {{ t.label }}
      </NuxtLink>
    </nav>
  </div>
</template>
