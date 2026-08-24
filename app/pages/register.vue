<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useSeoMeta({ title: 'Create account' })

const api = useApi()
const loading = ref(false)
const error = ref('')
const done = ref(false)

const form = reactive({ email: '', displayName: '', password: '' })

const canSubmit = computed(() =>
  form.email.includes('@') && form.password.length >= 12)

async function onSubmit() {
  if (!canSubmit.value) {
    error.value = 'Password must be at least 12 characters.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await api.register({
      email: form.email,
      password: form.password,
      displayName: form.displayName || null
    })
    done.value = true
  } catch (e) {
    error.value = apiErrorMessage(e, 'Could not create the account')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthCard
    v-if="!done"
    icon="i-lucide-user-round-plus"
    title="Create your account"
    subtitle="Local account with a verified email address."
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
        label="Email"
        name="email"
      >
        <UInput
          v-model="form.email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          icon="i-lucide-mail"
          required
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Display name"
        name="displayName"
        hint="Optional"
      >
        <UInput
          v-model="form.displayName"
          autocomplete="name"
          placeholder="Ada Lovelace"
          icon="i-lucide-user-round"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Password"
        name="password"
        hint="At least 12 characters"
      >
        <PasswordField
          v-model="form.password"
          autocomplete="new-password"
          meter
        />
      </UFormField>

      <UButton
        type="submit"
        block
        size="lg"
        :loading="loading"
        :disabled="!canSubmit"
      >
        Create account
      </UButton>
    </form>

    <template #footer>
      Already have an account?
      <NuxtLink
        to="/login"
        class="text-primary font-medium hover:underline"
      >Sign in</NuxtLink>
    </template>
  </AuthCard>

  <AuthCard
    v-else
    icon="i-lucide-mail-check"
    title="Check your email"
    :subtitle="`We sent a verification link to ${form.email}.`"
  >
    <UAlert
      color="info"
      variant="soft"
      icon="i-lucide-info"
      title="Verify to activate"
      description="Open the link to verify your address, then sign in. On a dev backend the link is printed to the server console."
    />
    <div class="mt-5 space-y-2">
      <UButton
        to="/verify"
        block
        color="neutral"
        variant="subtle"
        icon="i-lucide-ticket"
      >
        I have a verification token
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
