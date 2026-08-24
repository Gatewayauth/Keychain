<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useSeoMeta({ title: 'Set new password' })

const api = useApi()
const route = useRoute()
const toast = useToast()

const token = ref((route.query.token as string) || '')
const password = ref('')
const confirm = ref('')
const loading = ref(false)
const error = ref('')
const done = ref(false)

const mismatch = computed(() => confirm.value.length > 0 && confirm.value !== password.value)
const canSubmit = computed(() =>
  token.value.trim().length > 0 && password.value.length >= 12 && !mismatch.value)

async function onSubmit() {
  if (!canSubmit.value) {
    error.value = 'Check the token and that both passwords match (min 12 chars).'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await api.resetPassword(token.value.trim(), password.value)
    done.value = true
    toast.add({ title: 'Password updated', color: 'success', icon: 'i-lucide-check' })
  } catch (e) {
    error.value = apiErrorMessage(e, 'This reset token is invalid or expired')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthCard
    v-if="!done"
    icon="i-lucide-lock-keyhole"
    title="Set a new password"
    subtitle="Resetting your password signs out all other sessions."
  >
    <form
      class="space-y-4"
      @submit.prevent="onSubmit"
    >
      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        :description="error"
      />

      <UFormField
        v-if="!route.query.token"
        label="Reset token"
        name="token"
      >
        <UInput
          v-model="token"
          placeholder="paste token…"
          icon="i-lucide-ticket"
          class="w-full font-mono text-sm"
        />
      </UFormField>

      <UFormField
        label="New password"
        name="password"
        hint="At least 12 characters"
      >
        <PasswordField
          v-model="password"
          autocomplete="new-password"
          meter
        />
      </UFormField>

      <UFormField
        label="Confirm password"
        name="confirm"
        :error="mismatch ? 'Passwords do not match' : undefined"
      >
        <PasswordField
          v-model="confirm"
          autocomplete="new-password"
        />
      </UFormField>

      <UButton
        type="submit"
        block
        size="lg"
        :loading="loading"
        :disabled="!canSubmit"
      >
        Update password
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
    title="Password updated"
    subtitle="Sign in with your new password."
  >
    <UButton
      to="/login"
      block
      size="lg"
      icon="i-lucide-arrow-right"
      trailing
    >
      Back to sign in
    </UButton>
  </AuthCard>
</template>
