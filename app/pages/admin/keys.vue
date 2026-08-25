<script setup lang="ts">
useSeoMeta({ title: 'Admin · Keys' })

const api = useApi()
const toast = useToast()

const confirmOpen = ref(false)
const rotating = ref(false)
const lastRotated = ref<string>('')

async function rotate() {
  rotating.value = true
  try {
    const res = await api.adminRotateKeys()
    lastRotated.value = new Date().toLocaleString()
    confirmOpen.value = false
    toast.add({
      title: res.message || 'Signing key rotated',
      color: 'success',
      icon: 'i-lucide-check'
    })
  } catch (e) {
    toast.add({ title: apiErrorMessage(e), color: 'error' })
  } finally {
    rotating.value = false
  }
}
</script>

<template>
  <div>
    <PageHeading
      title="Signing keys"
      subtitle="Rotate the JWT signing key used for issued tokens."
    />
    <AdminNav />

    <SectionPanel
      title="JWT signing key"
      description="Rotation publishes a new key to the JWKS; existing tokens remain valid until they expire."
      icon="i-lucide-key-square"
    >
      <UAlert
        color="warning"
        variant="soft"
        icon="i-lucide-triangle-alert"
        title="This affects all relying parties"
        description="Newly issued tokens will be signed with the new key. Ensure clients fetch keys from the JWKS endpoint."
        class="mb-5"
      />

      <div class="flex items-center justify-between gap-4">
        <p
          v-if="lastRotated"
          class="text-sm text-muted"
        >
          Last rotated in this session: <span class="text-highlighted">{{ lastRotated }}</span>
        </p>
        <p
          v-else
          class="text-sm text-muted"
        >
          No rotation performed this session.
        </p>

        <UButton
          color="warning"
          icon="i-lucide-refresh-cw"
          @click="confirmOpen = true"
        >
          Rotate key
        </UButton>
      </div>
    </SectionPanel>

    <UModal
      v-model:open="confirmOpen"
      title="Rotate signing key?"
    >
      <template #body>
        <p class="text-sm text-muted">
          This immediately begins signing new tokens with a fresh key. This cannot be undone.
          Existing tokens stay valid until expiry.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton
            color="neutral"
            variant="ghost"
            @click="confirmOpen = false"
          >
            Cancel
          </UButton>
          <UButton
            color="warning"
            :loading="rotating"
            icon="i-lucide-refresh-cw"
            @click="rotate"
          >
            Rotate key
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
