<script setup lang="ts">
import type { RbacRole } from '~/types/gateway'

useSeoMeta({ title: 'Admin · Roles' })

const api = useApi()
const toast = useToast()
const { isOwner, isSuperAdmin } = useAuth()
const canManage = computed(() => isOwner.value || isSuperAdmin.value)

const roles = ref<RbacRole[]>([])
const pending = ref(true)

async function load() {
  pending.value = true
  try {
    roles.value = await api.adminRoles()
  } catch (e) {
    toast.add({ title: apiErrorMessage(e), color: 'error' })
  } finally {
    pending.value = false
  }
}

// One modal for create + edit. editing = null means create.
const modalOpen = ref(false)
const editing = ref<RbacRole | null>(null)
const saving = ref(false)
const formError = ref('')
const form = reactive({ slug: '', name: '', description: '', permissions: '' })

function openCreate() {
  editing.value = null
  form.slug = ''
  form.name = ''
  form.description = ''
  form.permissions = ''
  formError.value = ''
  modalOpen.value = true
}

function openEdit(r: RbacRole) {
  editing.value = r
  form.slug = r.slug
  form.name = r.name
  form.description = r.description || ''
  form.permissions = (r.permissions || []).join('\n')
  formError.value = ''
  modalOpen.value = true
}

function parsePermissions(): string[] {
  return form.permissions.split(/[\n,]/).map(s => s.trim()).filter(Boolean)
}

async function save() {
  if (!form.name.trim() || (!editing.value && !form.slug.trim())) {
    formError.value = 'Slug and name are required.'
    return
  }
  saving.value = true
  formError.value = ''
  try {
    const body = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      permissions: parsePermissions()
    }
    if (editing.value) {
      await api.adminUpdateRole(editing.value.id, body)
    } else {
      await api.adminCreateRole({ slug: form.slug.trim().toLowerCase(), ...body })
    }
    modalOpen.value = false
    await load()
    toast.add({ title: editing.value ? 'Role updated' : 'Role created', color: 'success', icon: 'i-lucide-check' })
  } catch (e) {
    formError.value = apiErrorMessage(e)
  } finally {
    saving.value = false
  }
}

const deleting = ref<string | null>(null)
async function remove(r: RbacRole) {
  deleting.value = r.id
  try {
    await api.adminDeleteRole(r.id)
    await load()
    toast.add({ title: 'Role deleted', color: 'success', icon: 'i-lucide-check' })
  } catch (e) {
    toast.add({ title: apiErrorMessage(e), color: 'error' })
  } finally {
    deleting.value = null
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeading
      title="Roles"
      subtitle="Custom roles emitted to apps via the OIDC roles claim; permissions are for Gateway."
    />
    <AdminNav />

    <div
      v-if="canManage"
      class="flex justify-end mb-4"
    >
      <UButton
        icon="i-lucide-plus"
        @click="openCreate"
      >
        New role
      </UButton>
    </div>

    <div
      v-if="pending"
      class="grid gap-3"
    >
      <USkeleton
        v-for="i in 3"
        :key="i"
        class="h-20 w-full rounded-xl"
      />
    </div>

    <div
      v-else-if="!roles.length"
      class="rounded-xl border border-dashed border-default bg-elevated/30 px-6 py-14 text-center"
    >
      <p class="text-sm font-medium text-highlighted">
        No roles yet
      </p>
      <p class="text-sm text-muted mt-1">
        Create a role, attach permissions, and assign it to users from the Users page.
      </p>
    </div>

    <div
      v-else
      class="grid gap-3"
    >
      <div
        v-for="r in roles"
        :key="r.id"
        class="rounded-xl border border-default bg-elevated/40 p-4 sm:p-5 flex items-start gap-4"
      >
        <div class="min-w-0 flex-1">
          <p class="text-highlighted font-medium flex items-center gap-2">
            {{ r.name }}
            <UBadge
              color="neutral"
              variant="subtle"
              size="sm"
              class="font-mono"
            >
              {{ r.slug }}
            </UBadge>
          </p>
          <p
            v-if="r.description"
            class="text-sm text-muted mt-0.5"
          >
            {{ r.description }}
          </p>
          <div
            v-if="r.permissions.length"
            class="flex flex-wrap gap-1 mt-2"
          >
            <UBadge
              v-for="p in r.permissions"
              :key="p"
              color="primary"
              variant="soft"
              size="sm"
              class="font-mono"
            >
              {{ p }}
            </UBadge>
          </div>
        </div>
        <div
          v-if="canManage"
          class="flex gap-1 shrink-0"
        >
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-lucide-pencil"
            @click="openEdit(r)"
          />
          <UButton
            size="xs"
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            :loading="deleting === r.id"
            @click="remove(r)"
          />
        </div>
      </div>
    </div>

    <UModal
      v-model:open="modalOpen"
      :title="editing ? 'Edit role' : 'New role'"
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="save"
        >
          <UAlert
            v-if="formError"
            color="error"
            variant="soft"
            icon="i-lucide-circle-alert"
            :description="formError"
          />
          <UFormField
            label="Slug"
            name="slug"
            hint="Immutable; emitted in tokens"
            required
          >
            <UInput
              v-model="form.slug"
              :disabled="!!editing"
              placeholder="grafana-admin"
              class="w-full font-mono text-sm"
            />
          </UFormField>
          <UFormField
            label="Name"
            name="name"
            required
          >
            <UInput
              v-model="form.name"
              placeholder="Grafana Admin"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Description"
            name="description"
          >
            <UInput
              v-model="form.description"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Permissions"
            name="permissions"
            hint="One per line (Gateway-internal)"
          >
            <UTextarea
              v-model="form.permissions"
              :rows="4"
              placeholder="dashboards:read&#10;dashboards:admin"
              class="w-full font-mono text-sm"
            />
          </UFormField>
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton
            color="neutral"
            variant="ghost"
            @click="modalOpen = false"
          >
            Cancel
          </UButton>
          <UButton
            :loading="saving"
            icon="i-lucide-save"
            @click="save"
          >
            {{ editing ? 'Save' : 'Create' }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
