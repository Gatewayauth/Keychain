<script setup lang="ts">
import type { TotpSetup } from '~/types/gateway'

const emit = defineEmits<{ enrolled: [] }>()

const api = useApi()
const toast = useToast()

type Step = 'idle' | 'scan' | 'recovery'
const step = ref<Step>('idle')
const loading = ref(false)
const error = ref('')

// Whether TOTP is already active on this account. Loaded on mount so the panel
// reflects reality instead of always offering "Enable 2FA".
const enabled = ref(false)
const loadingStatus = ref(true)

onMounted(async () => {
  try {
    enabled.value = (await api.mfaStatus()).enabled
  } catch {
    // Leave as not-enabled; the enroll flow still works.
  } finally {
    loadingStatus.value = false
  }
})

const setup = ref<TotpSetup | null>(null)
const code = ref('')
const recoveryCodes = ref<string[]>([])
const secretCopied = ref(false)

async function begin() {
  error.value = ''
  loading.value = true
  try {
    setup.value = await api.mfaSetup()
    step.value = 'scan'
  } catch (e) {
    toast.add({ title: apiErrorMessage(e), color: 'error' })
  } finally {
    loading.value = false
  }
}

async function confirm() {
  if (code.value.trim().length < 6) {
    error.value = 'Enter the 6-digit code from your app.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    const res = await api.mfaConfirm(code.value.trim())
    recoveryCodes.value = res.recovery_codes || []
    step.value = 'recovery'
  } catch (e) {
    error.value = apiErrorMessage(e, 'That code did not match — try the next one')
  } finally {
    loading.value = false
  }
}

const disabling = ref(false)
const confirmOpen = ref(false)

async function confirmDisable() {
  disabling.value = true
  try {
    await api.mfaDisable()
    enabled.value = false
    confirmOpen.value = false
    toast.add({ title: 'Two-factor authentication disabled', color: 'warning', icon: 'i-lucide-shield-off' })
  } catch (e) {
    toast.add({ title: apiErrorMessage(e), color: 'error' })
  } finally {
    disabling.value = false
  }
}

async function copySecret() {
  if (!setup.value?.secret) return
  await navigator.clipboard.writeText(setup.value.secret)
  secretCopied.value = true
  setTimeout(() => (secretCopied.value = false), 1600)
}

function finish() {
  step.value = 'idle'
  setup.value = null
  code.value = ''
  recoveryCodes.value = []
  enabled.value = true
  emit('enrolled')
  toast.add({ title: 'Two-factor authentication enabled', color: 'success', icon: 'i-lucide-shield-check' })
}
</script>

<template>
  <div>
    <!-- loading current status -->
    <USkeleton
      v-if="loadingStatus"
      class="h-9 w-full rounded-lg"
    />

    <!-- already enabled -->
    <div
      v-else-if="enabled && step === 'idle'"
      class="flex items-center gap-3"
    >
      <span class="inline-flex items-center justify-center size-9 rounded-lg bg-success/10 text-success shrink-0">
        <UIcon
          name="i-lucide-shield-check"
          class="size-4.5"
        />
      </span>
      <div class="min-w-0 flex-1">
        <p class="text-sm text-highlighted font-medium">
          Two-factor authentication is on
        </p>
        <p class="text-xs text-muted">
          Your account is protected with an authenticator app.
        </p>
      </div>
      <UButton
        color="error"
        variant="subtle"
        size="sm"
        icon="i-lucide-shield-off"
        @click="confirmOpen = true"
      >
        Disable
      </UButton>
    </div>

    <!-- idle -->
    <div
      v-else-if="step === 'idle'"
      class="flex items-center justify-between gap-4"
    >
      <p class="text-sm text-muted">
        Add a time-based one-time code (TOTP) from an authenticator app as a second factor.
      </p>
      <UButton
        :loading="loading"
        icon="i-lucide-shield-plus"
        @click="begin"
      >
        Enable 2FA
      </UButton>
    </div>

    <!-- scan + confirm -->
    <div
      v-else-if="step === 'scan'"
      class="animate-rise grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start"
    >
      <QrCode
        v-if="setup?.provisioning_uri"
        :value="setup.provisioning_uri"
        :size="180"
      />

      <div class="space-y-4">
        <div>
          <p class="text-sm text-highlighted font-medium mb-1">
            1 · Scan the QR code
          </p>
          <p class="text-sm text-muted">
            Open your authenticator app and scan the code, or enter the secret manually.
          </p>
        </div>

        <div v-if="setup?.secret">
          <p class="text-xs uppercase tracking-wide text-dimmed mb-1">
            Manual secret
          </p>
          <div class="flex items-center gap-2">
            <code class="flex-1 font-mono text-sm bg-muted/60 rounded-md px-3 py-2 break-all select-all">
              {{ setup.secret }}
            </code>
            <UButton
              :icon="secretCopied ? 'i-lucide-check' : 'i-lucide-copy'"
              :color="secretCopied ? 'success' : 'neutral'"
              variant="subtle"
              square
              @click="copySecret"
            />
          </div>
        </div>

        <form
          class="space-y-3"
          @submit.prevent="confirm"
        >
          <div>
            <p class="text-sm text-highlighted font-medium mb-1">
              2 · Enter the 6-digit code
            </p>
            <UInput
              v-model="code"
              placeholder="123456"
              inputmode="numeric"
              autocomplete="one-time-code"
              icon="i-lucide-shield"
              class="w-full font-mono tracking-widest"
            />
          </div>

          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            icon="i-lucide-circle-alert"
            :description="error"
          />

          <div class="flex gap-2">
            <UButton
              type="submit"
              :loading="loading"
              icon="i-lucide-check"
            >
              Confirm
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              @click="step = 'idle'"
            >
              Cancel
            </UButton>
          </div>
        </form>
      </div>
    </div>

    <!-- recovery codes -->
    <div
      v-else
      class="animate-rise space-y-4"
    >
      <RecoveryCodes :codes="recoveryCodes" />
      <UButton
        block
        icon="i-lucide-check"
        @click="finish"
      >
        I've saved my recovery codes
      </UButton>
    </div>

    <!-- disable confirmation (outside the step chain; teleported when open) -->
    <UModal
      v-model:open="confirmOpen"
      title="Disable two-factor authentication?"
      description="Your account will be protected by password only. You can re-enable it at any time."
    >
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton
            color="neutral"
            variant="ghost"
            :disabled="disabling"
            @click="confirmOpen = false"
          >
            Cancel
          </UButton>
          <UButton
            color="error"
            icon="i-lucide-shield-off"
            :loading="disabling"
            @click="confirmDisable"
          >
            Disable 2FA
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
