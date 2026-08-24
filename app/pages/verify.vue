<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useSeoMeta({ title: 'Verify email' })

const api = useApi()
const auth = useAuth()
const route = useRoute()

const token = ref((route.query.token as string) || '')
const state = ref<'idle' | 'verifying' | 'done' | 'error'>('idle')
const error = ref('')

async function verify() {
  if (!token.value.trim()) {
    error.value = 'Enter your verification token.'
    return
  }
  state.value = 'verifying'
  error.value = ''
  try {
    const u = await api.verify(token.value.trim())
    auth.user.value = u
    state.value = 'done'
  } catch (e) {
    error.value = apiErrorMessage(e, 'This token is invalid or expired')
    state.value = 'error'
  }
}

// Auto-verify when arriving via an emailed link.
onMounted(() => {
  if (token.value) verify()
})
</script>

<template>
  <AuthCard
    v-if="state !== 'done'"
    icon="i-lucide-mail-check"
    title="Verify your email"
    subtitle="Paste the token from your verification email."
  >
    <form
      class="space-y-4"
      @submit.prevent="verify"
    >
      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        :description="error"
      />

      <UFormField
        label="Verification token"
        name="token"
      >
        <UInput
          v-model="token"
          placeholder="paste token…"
          icon="i-lucide-ticket"
          class="w-full font-mono text-sm"
        />
      </UFormField>

      <UButton
        type="submit"
        block
        size="lg"
        :loading="state === 'verifying'"
        icon="i-lucide-check"
      >
        Verify email
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
    icon="i-lucide-badge-check"
    title="Email verified"
    subtitle="Your address is confirmed. You're all set."
  >
    <UButton
      to="/account"
      block
      size="lg"
      icon="i-lucide-arrow-right"
      trailing
    >
      Go to your account
    </UButton>
  </AuthCard>
</template>
