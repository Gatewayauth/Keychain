<script setup lang="ts">
import type { UserStatus } from '~/types/gateway'

useSeoMeta({ title: 'Account' })

const { user, fetchMe } = useAuth()
const api = useApi()
const toast = useToast()

const resending = ref(false)

async function resend() {
  resending.value = true
  try {
    await api.resendVerification()
    toast.add({ title: 'Verification email sent', color: 'success', icon: 'i-lucide-mail-check' })
  } catch (e) {
    toast.add({ title: apiErrorMessage(e), color: 'error' })
  } finally {
    resending.value = false
  }
}

// Keep the profile fresh on entry.
onMounted(fetchMe)

const statusColor: Record<UserStatus, 'success' | 'error' | 'warning' | 'neutral'> = {
  ACTIVE: 'success',
  DISABLED: 'error',
  LOCKED: 'error',
  PENDING_VERIFICATION: 'warning'
}
</script>

<template>
  <div>
    <PageHeading
      title="Your account"
      subtitle="Profile and connected sign-in methods."
    />

    <UAlert
      v-if="user && user.emailVerified === false"
      class="mb-6"
      color="warning"
      variant="soft"
      icon="i-lucide-mail-warning"
      title="Verify your email"
      description="Some features stay locked until you confirm your address."
    >
      <template #actions>
        <UButton
          size="sm"
          color="warning"
          :loading="resending"
          @click="resend"
        >
          Resend email
        </UButton>
      </template>
    </UAlert>

    <div class="grid gap-6">
      <SectionPanel
        title="Profile"
        description="How you appear on Keychain."
        icon="i-lucide-user-round"
      >
        <dl class="grid sm:grid-cols-2 gap-x-8 gap-y-5">
          <div>
            <dt class="text-xs uppercase tracking-wide text-dimmed mb-1">
              Display name
            </dt>
            <dd class="text-highlighted">
              {{ user?.displayName || '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-dimmed mb-1">
              Email
            </dt>
            <dd class="text-highlighted flex items-center gap-2">
              {{ user?.email }}
              <UBadge
                v-if="user?.emailVerified"
                color="success"
                variant="soft"
                size="sm"
                icon="i-lucide-badge-check"
              >
                Verified
              </UBadge>
              <UBadge
                v-else
                color="warning"
                variant="soft"
                size="sm"
              >
                Unverified
              </UBadge>
            </dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-dimmed mb-1">
              Status
            </dt>
            <dd>
              <UBadge
                v-if="user?.status"
                :color="statusColor[user.status as UserStatus] || 'neutral'"
                variant="soft"
                size="sm"
              >
                {{ user.status }}
              </UBadge>
              <span v-else>—</span>
            </dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-dimmed mb-1">
              User ID
            </dt>
            <dd class="font-mono text-sm text-muted select-all">
              {{ user?.id }}
            </dd>
          </div>
        </dl>
      </SectionPanel>

      <SectionPanel
        title="Connected accounts"
        description="Link an external identity provider to this account."
        icon="i-lucide-link"
      >
        <ExternalLoginButtons />
        <p class="mt-3 text-xs text-dimmed">
          You'll be redirected to the provider and back. The linked login can then be used to sign in.
        </p>
      </SectionPanel>

      <SectionPanel
        title="Security"
        description="Two-factor, active sessions, and sign-out controls."
        icon="i-lucide-shield-check"
      >
        <UButton
          to="/account/security"
          trailing
          icon="i-lucide-arrow-right"
          variant="subtle"
          color="neutral"
        >
          Manage security
        </UButton>
      </SectionPanel>
    </div>
  </div>
</template>
