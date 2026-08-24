<script setup lang="ts">
const { token, hasToken, set } = useAdminToken()
const api = useApi()

const input = ref('')
const loading = ref(false)
const error = ref('')

async function unlock() {
  if (!input.value.trim()) {
    error.value = 'Enter the admin token.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    // Validate by hitting a token-guarded endpoint.
    await api.adminClients(input.value.trim())
    set(input.value)
    input.value = ''
  } catch (e) {
    const code = apiErrorCode(e)
    error.value = code === 'unknown_error'
      ? apiErrorMessage(e)
      : 'That admin token was rejected.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- Single root element: an out-in page transition can't animate a
       multi-root fragment and will blank the page on client-side nav. -->
  <div>
    <slot
      v-if="hasToken"
      :token="token"
    />

    <div
      v-else
      class="max-w-md mx-auto py-6"
    >
      <div class="rounded-2xl border border-default bg-elevated/50 p-6 sm:p-7 animate-rise">
        <span class="inline-flex items-center justify-center size-9 rounded-xl bg-brand-500/12 text-primary ring-1 ring-brand-500/25 mb-4">
          <UIcon
            name="i-lucide-shield-alert"
            class="size-4.5"
          />
        </span>
        <h1 class="font-display text-xl font-semibold tracking-tight text-highlighted">
          Admin access
        </h1>
        <p class="text-sm text-muted mt-1 mb-5">
          This area is guarded by the bootstrap admin token. It's held only for this browser tab.
        </p>

        <form
          class="space-y-4"
          @submit.prevent="unlock"
        >
          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            icon="i-lucide-circle-alert"
            :description="error"
          />
          <UFormField
            label="Admin token"
            name="token"
          >
            <UInput
              v-model="input"
              type="password"
              placeholder="X-Admin-Token…"
              icon="i-lucide-key-round"
              autocomplete="off"
              class="w-full font-mono text-sm"
            />
          </UFormField>
          <UButton
            type="submit"
            block
            size="lg"
            :loading="loading"
            icon="i-lucide-unlock"
          >
            Unlock admin
          </UButton>
        </form>
      </div>
    </div>
  </div>
</template>
