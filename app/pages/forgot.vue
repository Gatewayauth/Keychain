<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useSeoMeta({ title: 'Reset password' })

const api = useApi()
const email = ref('')
const loading = ref(false)
const sent = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    // Backend always returns 200 (no account enumeration).
    await api.forgotPassword(email.value)
  } catch {
    // Ignore — the response is intentionally uniform.
  } finally {
    loading.value = false
    sent.value = true
  }
}
</script>

<template>
  <AuthCard
    v-if="!sent"
    icon="i-lucide-key-round"
    title="Forgot your password?"
    subtitle="We'll email you a link to set a new one."
  >
    <form
      class="space-y-4"
      @submit.prevent="onSubmit"
    >
      <UFormField
        label="Email"
        name="email"
      >
        <UInput
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          icon="i-lucide-mail"
          required
          class="w-full"
        />
      </UFormField>
      <UButton
        type="submit"
        block
        size="lg"
        :loading="loading"
        icon="i-lucide-send"
      >
        Send reset link
      </UButton>
    </form>

    <template #footer>
      <NuxtLink
        to="/login"
        class="text-primary hover:underline"
      >Back to sign in</NuxtLink>
    </template>
  </AuthCard>

  <AuthCard
    v-else
    icon="i-lucide-mail-check"
    title="Check your email"
    subtitle="If an account exists for that address, a reset link is on its way."
  >
    <UAlert
      color="info"
      variant="soft"
      icon="i-lucide-info"
      description="On a dev backend, the reset link is printed to the server console."
    />
    <div class="mt-5 space-y-2">
      <UButton
        to="/reset"
        block
        color="neutral"
        variant="subtle"
        icon="i-lucide-ticket"
      >
        I have a reset token
      </UButton>
      <UButton
        to="/login"
        block
        variant="ghost"
        color="neutral"
      >
        Back to sign in
      </UButton>
    </div>
  </AuthCard>
</template>
