<script setup lang="ts">
useSeoMeta({ title: 'Admin' })

// /admin has no content of its own — the global auth middleware enforces the
// admin role; this just lands on the first section.
definePageMeta({
  middleware() {
    return navigateTo('/admin/clients', { replace: true })
  }
})
</script>

<template>
  <div />
</template>
