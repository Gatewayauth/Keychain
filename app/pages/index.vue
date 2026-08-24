<script setup lang="ts">
definePageMeta({ layout: false })
// The global auth guard redirects `/` to /account or /login once the session
// resolves. This page is only the fallback spinner shown during that resolve —
// no top-level await here, so the SPA never stalls on an async setup.
</script>

<template>
  <div class="min-h-svh grid place-items-center bg-default">
    <UIcon
      name="i-lucide-loader-circle"
      class="size-6 animate-spin text-dimmed"
    />
  </div>
</template>
