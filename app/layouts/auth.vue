<script setup lang="ts">
// Centered, single-column shell for the pre-authentication flows.
</script>

<template>
  <div class="min-h-svh flex flex-col bg-default">
    <!-- subtle top wash, not a loud gradient hero -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-brand-500/[0.06] to-transparent"
    />

    <header class="relative flex items-center px-6 h-16">
      <NuxtLink
        to="/"
        class="rounded-md p-1 -ms-1 focus-visible:outline-2 outline-primary/40"
      >
        <AppLogo />
      </NuxtLink>
    </header>

    <main class="relative flex-1 flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-sm">
        <slot />
      </div>
    </main>

    <footer class="relative px-6 py-5 text-center text-xs text-muted">
      Protected by Keychain · <NuxtLink
        to="/login"
        class="hover:text-default"
      >Sign in</NuxtLink>
    </footer>
  </div>
</template>
