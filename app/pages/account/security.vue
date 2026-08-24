<script setup lang="ts">
import type { SessionSummary } from '~/types/gateway'

useSeoMeta({ title: 'Security' })

const api = useApi()
const { logoutAll } = useAuth()
const toast = useToast()

const sessions = ref<SessionSummary[]>([])
const pending = ref(true)
const revoking = ref<string | null>(null)
const loggingOutAll = ref(false)

async function loadSessions() {
  pending.value = true
  try {
    sessions.value = await api.sessions()
  } catch (e) {
    toast.add({ title: apiErrorMessage(e), color: 'error' })
  } finally {
    pending.value = false
  }
}

async function revoke(s: SessionSummary) {
  if (!s.id || s.current) return
  revoking.value = s.id
  try {
    await api.revokeSession(s.id)
    sessions.value = sessions.value.filter(x => x.id !== s.id)
    toast.add({ title: 'Session revoked', color: 'success', icon: 'i-lucide-check' })
  } catch (e) {
    toast.add({ title: apiErrorMessage(e), color: 'error' })
  } finally {
    revoking.value = null
  }
}

async function onLogoutAll() {
  loggingOutAll.value = true
  try {
    await logoutAll()
    await navigateTo('/login')
  } catch (e) {
    toast.add({ title: apiErrorMessage(e), color: 'error' })
    loggingOutAll.value = false
  }
}

onMounted(loadSessions)
</script>

<template>
  <div>
    <PageHeading
      title="Security"
      subtitle="Two-factor authentication and active sessions."
    />

    <div class="grid gap-6">
      <SectionPanel
        title="Two-factor authentication"
        description="Protect your account with a second factor."
        icon="i-lucide-shield-check"
      >
        <MfaEnroll />
      </SectionPanel>

      <SectionPanel
        title="Active sessions"
        description="Devices currently signed in to your account."
        icon="i-lucide-monitor-smartphone"
      >
        <template #actions>
          <UButton
            color="error"
            variant="subtle"
            size="sm"
            icon="i-lucide-log-out"
            :loading="loggingOutAll"
            @click="onLogoutAll"
          >
            Sign out everywhere
          </UButton>
        </template>

        <div
          v-if="pending"
          class="space-y-3"
        >
          <USkeleton
            v-for="i in 3"
            :key="i"
            class="h-14 w-full rounded-lg"
          />
        </div>

        <ul
          v-else
          class="divide-y divide-default -my-2"
        >
          <TransitionGroup name="list">
            <li
              v-for="s in sessions"
              :key="s.id"
              class="flex items-center gap-4 py-3"
            >
              <span
                class="inline-flex items-center justify-center size-9 rounded-lg bg-muted/60 text-dimmed shrink-0"
              >
                <UIcon
                  name="i-lucide-monitor"
                  class="size-4.5"
                />
              </span>

              <div class="min-w-0 flex-1">
                <p class="text-sm text-highlighted flex items-center gap-2">
                  {{ deviceLabel(s.user_agent) }}
                  <UBadge
                    v-if="s.current"
                    color="primary"
                    variant="soft"
                    size="sm"
                  >
                    This device
                  </UBadge>
                </p>
                <p class="text-xs text-muted mt-0.5">
                  {{ s.ip || 'unknown IP' }} · active {{ timeAgo(s.last_seen_at) }}
                  <span class="text-dimmed">· since {{ formatTime(s.created_at) }}</span>
                </p>
              </div>

              <UButton
                v-if="!s.current"
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-lucide-x"
                :loading="revoking === s.id"
                aria-label="Revoke session"
                @click="revoke(s)"
              >
                Revoke
              </UButton>
            </li>
          </TransitionGroup>
        </ul>

        <p
          v-if="!pending && !sessions.length"
          class="text-sm text-muted py-2"
        >
          No active sessions found.
        </p>
      </SectionPanel>
    </div>
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  .list-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  .list-leave-to {
    opacity: 0;
    transform: translateX(8px);
  }
  .list-leave-active {
    position: relative;
  }
}
</style>
