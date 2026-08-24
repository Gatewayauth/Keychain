<script setup lang="ts">
import type { ConsentRequired } from '~/types/gateway'

// This route receives the OIDC authorization request (the relying party sends
// the browser here). We probe the backend authorize endpoint and drive login
// / consent as needed. Token + userinfo are RP-only and never touched here.
definePageMeta({ layout: 'auth' })
useSeoMeta({ title: 'Authorize' })

const { public: { apiBase, tenantSlug } } = useRuntimeConfig()
const api = useApi()
const route = useRoute()
const toast = useToast()

type Phase = 'checking' | 'consent' | 'redirecting' | 'error'
const phase = ref<Phase>('checking')
const error = ref('')
const errorCode = ref('')
const consent = ref<ConsentRequired | null>(null)
const submitting = ref(false)

// Preserve the exact query string the RP sent.
const authorizeUrl = computed(() => `${apiBase}/t/${tenantSlug}/oauth2/authorize${window.location.search}`)

const SCOPE_LABELS: Record<string, { label: string, icon: string }> = {
  openid: { label: 'Confirm your identity', icon: 'i-lucide-badge-check' },
  profile: { label: 'View your profile (name)', icon: 'i-lucide-user-round' },
  email: { label: 'View your email address', icon: 'i-lucide-mail' },
  offline_access: { label: 'Stay signed in (refresh access)', icon: 'i-lucide-refresh-cw' }
}
function scopeMeta(s: string) {
  return SCOPE_LABELS[s] || { label: s, icon: 'i-lucide-dot' }
}

async function probe() {
  phase.value = 'checking'
  error.value = ''
  try {
    const res = await fetch(authorizeUrl.value, {
      credentials: 'include',
      redirect: 'manual',
      headers: { Accept: 'application/json' }
    })

    // A cross-origin 302 to the RP's redirect_uri — the browser must follow it
    // via a real navigation (fetch can't read the opaque target).
    if (res.type === 'opaqueredirect' || res.status === 0) {
      phase.value = 'redirecting'
      window.location.href = authorizeUrl.value
      return
    }

    if (res.status === 200) {
      consent.value = await res.json()
      phase.value = 'consent'
      return
    }

    const body = await res.json().catch(() => null)

    // A 401 is only a login prompt when the server says login_required. Other
    // 401s (invalid_client, invalid credentials for the RP, …) are real errors
    // the user/admin must see — don't bounce them to /login.
    if (res.status === 401 && body?.error === 'login_required') {
      await navigateTo({ path: '/login', query: { redirect: route.fullPath } })
      return
    }

    errorCode.value = body?.error || ''
    error.value = body?.error_description || body?.message || `Authorization failed (${res.status})`
    phase.value = 'error'
  } catch (e) {
    error.value = apiErrorMessage(e, 'Could not reach the authorization server')
    phase.value = 'error'
  }
}

async function approve() {
  if (!consent.value?.client_id) return
  submitting.value = true
  try {
    await api.consent({
      client_id: consent.value.client_id,
      scopes: consent.value.scopes || []
    })
    // Consent granted — re-probe; should now redirect to the RP.
    await probe()
  } catch (e) {
    toast.add({ title: apiErrorMessage(e), color: 'error' })
  } finally {
    submitting.value = false
  }
}

// Plain-language guidance for the common authorize failures.
const errorHint = computed(() => {
  switch (errorCode.value) {
    case 'invalid_client':
      return 'This application isn\'t registered with Keychain (or was removed). An administrator needs to register it under Admin → Clients.'
    case 'invalid_request':
      return 'The application sent an invalid request. If it needs PKCE, enable it in the app\'s OAuth settings; otherwise re-check its client configuration.'
    case 'invalid_scope':
      return 'The application requested a scope this client isn\'t allowed to use.'
    case 'access_denied':
      return 'The request was denied.'
    default:
      return ''
  }
})

function deny() {
  // Send the user back to their account rather than the RP.
  navigateTo('/account')
}

onMounted(probe)
</script>

<template>
  <AuthCard
    v-if="phase === 'checking' || phase === 'redirecting'"
    icon="i-lucide-key-round"
    title="Authorizing…"
    :subtitle="phase === 'redirecting' ? 'Redirecting you back to the app.' : 'Checking your session.'"
  >
    <div class="flex justify-center py-4">
      <UIcon
        name="i-lucide-loader-circle"
        class="size-7 animate-spin text-primary"
      />
    </div>
  </AuthCard>

  <AuthCard
    v-else-if="phase === 'consent' && consent"
    icon="i-lucide-shield-check"
    :title="`Authorize ${consent.client_name || 'application'}`"
    subtitle="This application is requesting access to your account."
  >
    <div class="rounded-xl border border-default bg-muted/30 p-4 mb-5">
      <p class="text-xs uppercase tracking-wide text-dimmed mb-3">
        It will be able to
      </p>
      <ul class="space-y-2.5">
        <li
          v-for="s in consent.scopes"
          :key="s"
          class="flex items-center gap-3 text-sm"
        >
          <span class="inline-flex items-center justify-center size-7 rounded-lg bg-brand-500/12 text-primary ring-1 ring-brand-500/20 shrink-0">
            <UIcon
              :name="scopeMeta(s).icon"
              class="size-4"
            />
          </span>
          <span class="text-highlighted">{{ scopeMeta(s).label }}</span>
        </li>
      </ul>
    </div>

    <div class="flex gap-2">
      <UButton
        block
        size="lg"
        :loading="submitting"
        icon="i-lucide-check"
        @click="approve"
      >
        Allow access
      </UButton>
      <UButton
        block
        size="lg"
        color="neutral"
        variant="subtle"
        :disabled="submitting"
        @click="deny"
      >
        Deny
      </UButton>
    </div>

    <template #footer>
      Signed in as your Keychain account ·
      <NuxtLink
        to="/account"
        class="text-primary hover:underline"
      >Not you?</NuxtLink>
    </template>
  </AuthCard>

  <AuthCard
    v-else
    icon="i-lucide-circle-alert"
    title="Authorization error"
    :subtitle="error"
  >
    <div
      v-if="errorHint || errorCode"
      class="rounded-xl border border-default bg-muted/30 p-4 mb-5 space-y-2"
    >
      <p
        v-if="errorHint"
        class="text-sm text-muted"
      >
        {{ errorHint }}
      </p>
      <p
        v-if="errorCode"
        class="text-xs font-mono text-dimmed"
      >
        error: {{ errorCode }}
      </p>
    </div>

    <div class="flex gap-2">
      <UButton
        block
        color="neutral"
        variant="subtle"
        icon="i-lucide-rotate-cw"
        @click="probe"
      >
        Try again
      </UButton>
      <UButton
        block
        to="/account"
        variant="ghost"
        color="neutral"
      >
        Go to account
      </UButton>
    </div>
  </AuthCard>
</template>
