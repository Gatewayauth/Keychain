<script setup lang="ts">
import type { User, SessionSummary, UserStatus } from '~/types/gateway'

useSeoMeta({ title: 'Admin · Users' })

const api = useApi()
const { token } = useAdminToken()
const toast = useToast()

const users = ref<User[]>([])
const pending = ref(true)
const limit = 50
const offset = ref(0)

const STATUSES: UserStatus[] = ['ACTIVE', 'DISABLED', 'LOCKED', 'PENDING_VERIFICATION']
const statusColor: Record<UserStatus, 'success' | 'error' | 'warning'> = {
  ACTIVE: 'success',
  DISABLED: 'error',
  LOCKED: 'error',
  PENDING_VERIFICATION: 'warning'
}

async function load() {
  pending.value = true
  try {
    users.value = await api.adminUsers(token.value, { limit, offset: offset.value })
  } catch (e) {
    toast.add({ title: apiErrorMessage(e), color: 'error' })
  } finally {
    pending.value = false
  }
}

function next() {
  offset.value += limit
  load()
}
function prev() {
  offset.value = Math.max(0, offset.value - limit)
  load()
}

// ---- Detail slideover ----
const detailOpen = ref(false)
const selected = ref<User | null>(null)
const sessions = ref<SessionSummary[]>([])
const sessionsPending = ref(false)
const savingStatus = ref(false)
const revokingAll = ref(false)
const statusDraft = ref<UserStatus>('ACTIVE')

async function openUser(u: User) {
  selected.value = u
  statusDraft.value = (u.status as UserStatus) || 'ACTIVE'
  detailOpen.value = true
  sessions.value = []
  sessionsPending.value = true
  try {
    sessions.value = await api.adminUserSessions(token.value, u.id!)
  } catch (e) {
    toast.add({ title: apiErrorMessage(e), color: 'error' })
  } finally {
    sessionsPending.value = false
  }
}

async function saveStatus() {
  if (!selected.value?.id) return
  savingStatus.value = true
  try {
    const updated = await api.adminSetUserStatus(token.value, selected.value.id, statusDraft.value)
    selected.value = updated
    const i = users.value.findIndex(x => x.id === updated.id)
    if (i >= 0) users.value[i] = updated
    toast.add({ title: 'Status updated', color: 'success', icon: 'i-lucide-check' })
  } catch (e) {
    toast.add({ title: apiErrorMessage(e), color: 'error' })
  } finally {
    savingStatus.value = false
  }
}

async function revokeAll() {
  if (!selected.value?.id) return
  revokingAll.value = true
  try {
    await api.adminRevokeUserSessions(token.value, selected.value.id)
    sessions.value = []
    toast.add({ title: 'Sessions revoked', color: 'success', icon: 'i-lucide-check' })
  } catch (e) {
    toast.add({ title: apiErrorMessage(e), color: 'error' })
  } finally {
    revokingAll.value = false
  }
}

onMounted(load)
</script>

<template>
  <AdminTokenGate>
    <PageHeading
      title="Users"
      subtitle="Accounts registered on this identity provider."
    />
    <AdminNav />

    <div
      v-if="pending"
      class="grid gap-2"
    >
      <USkeleton
        v-for="i in 6"
        :key="i"
        class="h-14 w-full rounded-lg"
      />
    </div>

    <div
      v-else
      class="rounded-xl border border-default overflow-hidden"
    >
      <div
        v-if="!users.length"
        class="text-center py-16 text-muted"
      >
        No users found.
      </div>
      <ul
        v-else
        class="divide-y divide-default"
      >
        <li
          v-for="u in users"
          :key="u.id"
        >
          <button
            class="w-full text-left px-4 sm:px-5 py-3 flex items-center gap-4 hover:bg-elevated/50 transition-colors"
            @click="openUser(u)"
          >
            <span class="inline-flex items-center justify-center size-9 rounded-full bg-brand-500/12 text-primary text-xs font-semibold ring-1 ring-brand-500/20 shrink-0">
              {{ (u.displayName || u.email || '?').slice(0, 2).toUpperCase() }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-highlighted truncate flex items-center gap-2">
                {{ u.displayName || u.email }}
                <UIcon
                  v-if="u.emailVerified"
                  name="i-lucide-badge-check"
                  class="size-4 text-success shrink-0"
                />
              </p>
              <p class="text-xs text-muted truncate">
                {{ u.email }}
              </p>
            </div>
            <UBadge
              v-if="u.status"
              :color="statusColor[u.status as UserStatus] || 'neutral'"
              variant="soft"
              size="sm"
            >
              {{ u.status }}
            </UBadge>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4 text-dimmed shrink-0"
            />
          </button>
        </li>
      </ul>
    </div>

    <div class="flex items-center justify-between mt-4 text-sm text-muted">
      <span>Showing {{ offset + 1 }}–{{ offset + users.length }}</span>
      <div class="flex gap-2">
        <UButton
          size="sm"
          color="neutral"
          variant="subtle"
          icon="i-lucide-chevron-left"
          :disabled="offset === 0 || pending"
          @click="prev"
        >
          Prev
        </UButton>
        <UButton
          size="sm"
          color="neutral"
          variant="subtle"
          trailing
          icon="i-lucide-chevron-right"
          :disabled="users.length < limit || pending"
          @click="next"
        >
          Next
        </UButton>
      </div>
    </div>

    <!-- Detail slideover -->
    <USlideover
      v-model:open="detailOpen"
      :title="selected?.email || 'User'"
      side="right"
    >
      <template #body>
        <div
          v-if="selected"
          class="space-y-6"
        >
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center justify-center size-12 rounded-full bg-brand-500/12 text-primary font-semibold ring-1 ring-brand-500/20">
              {{ (selected.displayName || selected.email || '?').slice(0, 2).toUpperCase() }}
            </span>
            <div class="min-w-0">
              <p class="text-highlighted font-medium truncate">
                {{ selected.displayName || '—' }}
              </p>
              <p class="text-sm text-muted truncate">
                {{ selected.email }}
              </p>
            </div>
          </div>

          <div>
            <p class="text-xs uppercase tracking-wide text-dimmed mb-1">
              User ID
            </p>
            <code class="block font-mono text-xs bg-muted/60 rounded px-2 py-1.5 break-all select-all">{{ selected.id }}</code>
          </div>

          <div>
            <p class="text-xs uppercase tracking-wide text-dimmed mb-2">
              Status
            </p>
            <div class="flex items-center gap-2">
              <USelect
                v-model="statusDraft"
                :items="STATUSES"
                class="flex-1"
              />
              <UButton
                :loading="savingStatus"
                :disabled="statusDraft === selected.status"
                icon="i-lucide-save"
                @click="saveStatus"
              >
                Save
              </UButton>
            </div>
            <p class="text-xs text-dimmed mt-1.5">
              Disabling an account revokes its sessions.
            </p>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs uppercase tracking-wide text-dimmed">
                Active sessions
              </p>
              <UButton
                v-if="sessions.length"
                size="xs"
                color="error"
                variant="subtle"
                icon="i-lucide-log-out"
                :loading="revokingAll"
                @click="revokeAll"
              >
                Revoke all
              </UButton>
            </div>

            <div
              v-if="sessionsPending"
              class="space-y-2"
            >
              <USkeleton
                v-for="i in 2"
                :key="i"
                class="h-12 w-full rounded-lg"
              />
            </div>
            <ul
              v-else-if="sessions.length"
              class="space-y-2"
            >
              <li
                v-for="s in sessions"
                :key="s.id"
                class="rounded-lg border border-default px-3 py-2 text-sm"
              >
                <p class="text-highlighted flex items-center gap-2">
                  {{ deviceLabel(s.user_agent) }}
                  <UBadge
                    v-if="s.current"
                    color="primary"
                    variant="soft"
                    size="sm"
                  >
                    Current
                  </UBadge>
                </p>
                <p class="text-xs text-muted">
                  {{ s.ip || 'unknown IP' }} · {{ timeAgo(s.last_seen_at) }}
                </p>
              </li>
            </ul>
            <p
              v-else
              class="text-sm text-muted"
            >
              No active sessions.
            </p>
          </div>
        </div>
      </template>
    </USlideover>
  </AdminTokenGate>
</template>
