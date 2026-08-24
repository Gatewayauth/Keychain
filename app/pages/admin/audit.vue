<script setup lang="ts">
import type { AuditEntry } from '~/types/gateway'

useSeoMeta({ title: 'Admin · Audit' })

const api = useApi()
const { token } = useAdminToken()
const toast = useToast()

const entries = ref<AuditEntry[]>([])
const pending = ref(true)
const limit = ref(100)
const limitOptions = [50, 100, 250, 500]

// Backend fields: at (epoch ms), event_type, actor_user_id, ip, detail.
// Fallbacks kept in case the shape ever changes.
const ts = (e: AuditEntry) => e.at ?? e.ts ?? e.time ?? (typeof e.created_at === 'number' ? e.created_at : undefined)
const action = (e: AuditEntry) => e.event_type || e.action || e.event || (typeof e.type === 'string' ? e.type : '') || '—'
const actor = (e: AuditEntry) =>
  e.actor_user_id || e.actor_label || e.actor || e.actor_id || e.user_id || 'system'
const detail = (e: AuditEntry) => {
  if (typeof e.detail === 'string') return e.detail
  if (e.data != null) return typeof e.data === 'string' ? e.data : JSON.stringify(e.data)
  return ''
}

async function load() {
  pending.value = true
  try {
    entries.value = await api.adminAudit(token.value, limit.value)
  } catch (e) {
    toast.add({ title: apiErrorMessage(e), color: 'error' })
  } finally {
    pending.value = false
  }
}

watch(limit, load)
onMounted(load)
</script>

<template>
  <AdminTokenGate>
    <PageHeading
      title="Audit log"
      subtitle="Recent security-relevant events."
    >
      <template #actions>
        <USelect
          v-model="limit"
          :items="limitOptions"
          size="sm"
        />
      </template>
    </PageHeading>
    <AdminNav />

    <div
      v-if="pending"
      class="grid gap-2"
    >
      <USkeleton
        v-for="i in 8"
        :key="i"
        class="h-12 w-full rounded-lg"
      />
    </div>

    <div
      v-else-if="!entries.length"
      class="rounded-xl border border-dashed border-default bg-elevated/30 px-6 py-14 text-center"
    >
      <span class="inline-flex items-center justify-center size-12 rounded-xl bg-muted/60 text-dimmed mb-3">
        <UIcon
          name="i-lucide-scroll-text"
          class="size-6"
        />
      </span>
      <p class="text-sm font-medium text-highlighted">
        No audit entries yet
      </p>
      <p class="text-sm text-muted mt-1">
        Security events like logins, client changes, and key rotations will show up here.
      </p>
    </div>

    <div
      v-else
      class="rounded-xl border border-default overflow-hidden"
    >
      <ul class="divide-y divide-default">
        <li
          v-for="(e, i) in entries"
          :key="e.id || i"
          class="px-4 sm:px-5 py-3 flex items-start gap-4"
        >
          <span class="inline-flex items-center justify-center size-8 rounded-lg bg-muted/60 text-dimmed shrink-0 mt-0.5">
            <UIcon
              name="i-lucide-activity"
              class="size-4"
            />
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-mono text-sm text-highlighted">{{ action(e) }}</span>
              <span class="text-xs text-muted">· {{ actor(e) }}</span>
              <span
                v-if="e.ip"
                class="text-xs text-dimmed"
              >· {{ e.ip }}</span>
            </div>
            <p
              v-if="detail(e)"
              class="text-xs text-muted mt-0.5 break-all font-mono"
            >
              {{ detail(e) }}
            </p>
          </div>
          <time class="text-xs text-dimmed shrink-0 whitespace-nowrap">{{ formatTime(ts(e)) }}</time>
        </li>
      </ul>
    </div>
  </AdminTokenGate>
</template>
