<script setup lang="ts">
useSeoMeta({ title: 'Admin' })

// Redirect before the page renders (not after mount) so navigating here while
// unlocked doesn't trigger a second page transition that can blank the view.
definePageMeta({
  middleware() {
    const { hasToken } = useAdminToken()
    if (hasToken.value) return navigateTo('/admin/clients', { replace: true })
  }
})
</script>

<template>
  <div>
    <PageHeading
      title="Admin"
      subtitle="Manage clients, users, keys, and audit logs."
    />
    <AdminTokenGate />
  </div>
</template>
