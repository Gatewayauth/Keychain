<script setup lang="ts">
import { isMfaChallenge } from '~/types/gateway'

definePageMeta({ layout: 'auth' })
useSeoMeta({ title: 'Sign in' })

const { login, completeMfa } = useAuth()
const route = useRoute()
const toast = useToast()

const redirect = computed(() => (route.query.redirect as string) || '/account')

const step = ref<'credentials' | 'mfa'>('credentials')
const loading = ref(false)
const error = ref('')

const form = reactive({ email: '', password: '' })
const mfaToken = ref('')
const mfaCode = ref('')

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    const res = await login(form.email, form.password)
    if (isMfaChallenge(res)) {
      mfaToken.value = res.mfaToken || ''
      step.value = 'mfa'
    } else {
      await navigateTo(redirect.value)
    }
  } catch (e) {
    error.value = apiErrorMessage(e, 'Invalid email or password')
  } finally {
    loading.value = false
  }
}

async function onSubmitMfa() {
  error.value = ''
  loading.value = true
  try {
    await completeMfa(mfaToken.value, mfaCode.value.trim())
    toast.add({ title: 'Signed in', color: 'success', icon: 'i-lucide-check' })
    await navigateTo(redirect.value)
  } catch (e) {
    error.value = apiErrorMessage(e, 'That code did not match')
  } finally {
    loading.value = false
  }
}

function backToCredentials() {
  step.value = 'credentials'
  mfaCode.value = ''
  error.value = ''
}
</script>

<template>
  <AuthCard
    v-if="step === 'credentials'"
    icon="i-lucide-key-round"
    title="Welcome back"
    subtitle="Sign in to your Keychain account."
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
        name="password"
        :ui="{ label: 'w-full' }"
      >
        <template #label>
          <div class="flex items-center justify-between w-full">
            <span>Password</span>
            <NuxtLink
              to="/forgot"
              class="text-xs text-primary hover:underline"
            >Forgot?</NuxtLink>
          </div>
        </template>
        <PasswordField
          v-model="form.password"
          autocomplete="current-password"
        />
      </UFormField>

      <UButton
        type="submit"
        block
        size="lg"
        :loading="loading"
        icon="i-lucide-arrow-right"
        trailing
      >
        Sign in
      </UButton>
    </form>

    <div class="my-5 flex items-center gap-3 text-xs text-dimmed">
      <span class="h-px flex-1 bg-border" />
      or continue with
      <span class="h-px flex-1 bg-border" />
    </div>

    <ExternalLoginButtons :redirect="(route.query.redirect as string) || undefined" />

    <template #footer>
      New here?
      <NuxtLink
        to="/register"
        class="text-primary font-medium hover:underline"
      >Create an account</NuxtLink>
    </template>
  </AuthCard>

  <AuthCard
    v-else
    icon="i-lucide-shield-check"
    title="Two-factor authentication"
    subtitle="Enter the 6-digit code from your authenticator app, or a recovery code."
  >
    <form
      class="space-y-4"
      @submit.prevent="onSubmitMfa"
    >
      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        :description="error"
      />

      <UFormField
        label="Verification code"
        name="code"
      >
        <UInput
          v-model="mfaCode"
          placeholder="123456"
          autocomplete="one-time-code"
          inputmode="numeric"
          icon="i-lucide-shield"
          autofocus
          class="w-full font-mono tracking-widest"
        />
      </UFormField>

      <UButton
        type="submit"
        block
        size="lg"
        :loading="loading"
        icon="i-lucide-arrow-right"
        trailing
      >
        Verify
      </UButton>

      <UButton
        block
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-lucide-arrow-left"
        @click="backToCredentials"
      >
        Back
      </UButton>
    </form>
  </AuthCard>
</template>
