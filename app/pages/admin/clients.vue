<script setup lang="ts">
import type { ClientResponse } from '~/types/gateway'

useSeoMeta({ title: 'Admin · Clients' })

const api = useApi()
const toast = useToast()

const clients = ref<ClientResponse[]>([])
const pending = ref(true)

const createOpen = ref(false)
const creating = ref(false)
const form = reactive({
  name: '',
  redirectUris: '',
  scopes: 'openid profile email',
  requiredRoles: '',
  public: false,
  requireConsent: true
})
const createError = ref('')

// Edit an existing client (in place — the client secret is never touched).
const editOpen = ref(false)
const saving = ref(false)
const editId = ref<string | null>(null)
const editForm = reactive({
  name: '',
  redirectUris: '',
  scopes: '',
  requiredRoles: '',
  requireConsent: true
})
const editError = ref('')

// One-time secret reveal after creating a confidential client.
const createdClient = ref<ClientResponse | null>(null)
const secretCopied = ref(false)

const deleting = ref<string | null>(null)

async function load() {
  pending.value = true
  try {
    clients.value = await api.adminClients()
  } catch (e) {
    toast.add({ title: apiErrorMessage(e), color: 'error' })
  } finally {
    pending.value = false
  }
}

function resetForm() {
  form.name = ''
  form.redirectUris = ''
  form.scopes = 'openid profile email'
  form.requiredRoles = ''
  form.public = false
  form.requireConsent = true
  createError.value = ''
}

function splitTokens(v: string) {
  return v.split(/\s+/).map(s => s.trim()).filter(Boolean)
}

function openEdit(c: ClientResponse) {
  editId.value = c.client_id || null
  editForm.name = c.name || ''
  editForm.redirectUris = (c.redirect_uris || []).join('\n')
  // Drop openid from the editable list — the backend always re-adds it.
  editForm.scopes = (c.scopes || []).filter(s => s !== 'openid').join(' ')
  editForm.requiredRoles = (c.required_roles || []).join(' ')
  editForm.requireConsent = c.require_consent ?? true
  editError.value = ''
  editOpen.value = true
}

async function saveEdit() {
  if (!editId.value) return
  const redirect_uris = editForm.redirectUris.split(/\s*[\n,]\s*/).map(s => s.trim()).filter(Boolean)
  if (!editForm.name.trim() || !redirect_uris.length) {
    editError.value = 'Name and at least one redirect URI are required.'
    return
  }
  saving.value = true
  editError.value = ''
  try {
    await api.adminUpdateClient(editId.value, {
      name: editForm.name.trim(),
      redirect_uris,
      scopes: splitTokens(editForm.scopes),
      require_consent: editForm.requireConsent,
      required_roles: splitTokens(editForm.requiredRoles)
    })
    editOpen.value = false
    editId.value = null
    toast.add({ title: 'Client updated', color: 'success', icon: 'i-lucide-check' })
    await load()
  } catch (e) {
    editError.value = apiErrorMessage(e, 'Could not update client')
  } finally {
    saving.value = false
  }
}

async function create() {
  const redirect_uris = form.redirectUris.split(/\s*[\n,]\s*/).map(s => s.trim()).filter(Boolean)
  if (!form.name.trim() || !redirect_uris.length) {
    createError.value = 'Name and at least one redirect URI are required.'
    return
  }
  creating.value = true
  createError.value = ''
  try {
    const res = await api.adminCreateClient({
      name: form.name.trim(),
      redirect_uris,
      scopes: splitTokens(form.scopes),
      public: form.public,
      require_consent: form.requireConsent,
      required_roles: splitTokens(form.requiredRoles)
    })
    createOpen.value = false
    resetForm()
    createdClient.value = res
    await load()
  } catch (e) {
    createError.value = apiErrorMessage(e, 'Could not create client')
  } finally {
    creating.value = false
  }
}

async function remove(c: ClientResponse) {
  if (!c.client_id) return
  deleting.value = c.client_id
  try {
    await api.adminDeleteClient(c.client_id)
    clients.value = clients.value.filter(x => x.client_id !== c.client_id)
    toast.add({ title: 'Client deleted', color: 'success', icon: 'i-lucide-check' })
  } catch (e) {
    toast.add({ title: apiErrorMessage(e), color: 'error' })
  } finally {
    deleting.value = null
  }
}

async function copySecret() {
  if (!createdClient.value?.client_secret) return
  await navigator.clipboard.writeText(createdClient.value.client_secret)
  secretCopied.value = true
  setTimeout(() => (secretCopied.value = false), 1600)
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeading
      title="OAuth clients"
      subtitle="Relying parties registered with this identity provider."
    />
    <AdminNav />

    <div class="flex justify-end mb-4">
      <UButton
        icon="i-lucide-plus"
        @click="createOpen = true"
      >
        Register client
      </UButton>
    </div>

    <div
      v-if="pending"
      class="grid gap-3"
    >
      <USkeleton
        v-for="i in 3"
        :key="i"
        class="h-24 w-full rounded-xl"
      />
    </div>

    <div
      v-else-if="!clients.length"
      class="rounded-xl border border-dashed border-default bg-elevated/30 px-6 py-14 text-center"
    >
      <span class="inline-flex items-center justify-center size-12 rounded-xl bg-muted/60 text-dimmed mb-3">
        <UIcon
          name="i-lucide-app-window"
          class="size-6"
        />
      </span>
      <p class="text-sm font-medium text-highlighted">
        No clients registered yet
      </p>
      <p class="text-sm text-muted mt-1 mb-5">
        Register a relying party to let it sign users in through Keychain.
      </p>
      <UButton
        icon="i-lucide-plus"
        @click="createOpen = true"
      >
        Register client
      </UButton>
    </div>

    <div
      v-else
      class="grid gap-3"
    >
      <div
        v-for="c in clients"
        :key="c.client_id"
        class="rounded-xl border border-default bg-elevated/40 p-4 sm:p-5 flex items-start gap-4"
      >
        <span class="inline-flex items-center justify-center size-10 rounded-lg bg-brand-500/10 text-primary ring-1 ring-brand-500/20 shrink-0">
          <UIcon
            name="i-lucide-app-window"
            class="size-5"
          />
        </span>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="font-medium text-highlighted">
              {{ c.name }}
            </h3>
            <UBadge
              :color="c.public ? 'neutral' : 'primary'"
              variant="soft"
              size="sm"
            >
              {{ c.public ? 'Public (PKCE)' : 'Confidential' }}
            </UBadge>
          </div>
          <p class="font-mono text-xs text-muted mt-1 select-all break-all">
            {{ c.client_id }}
          </p>

          <div class="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <p class="text-xs uppercase tracking-wide text-dimmed mb-0.5">
                Redirect URIs
              </p>
              <ul class="space-y-0.5">
                <li
                  v-for="u in c.redirect_uris"
                  :key="u"
                  class="text-muted break-all"
                >
                  {{ u }}
                </li>
              </ul>
            </div>
            <div>
              <p class="text-xs uppercase tracking-wide text-dimmed mb-0.5">
                Scopes
              </p>
              <div class="flex flex-wrap gap-1">
                <UBadge
                  v-for="s in c.scopes"
                  :key="s"
                  color="neutral"
                  variant="soft"
                  size="sm"
                >
                  {{ s }}
                </UBadge>
                <span
                  v-if="!c.scopes?.length"
                  class="text-muted"
                >—</span>
              </div>
            </div>
            <div>
              <p class="text-xs uppercase tracking-wide text-dimmed mb-0.5">
                Required roles
              </p>
              <div class="flex flex-wrap gap-1">
                <UBadge
                  v-for="r in c.required_roles"
                  :key="r"
                  color="warning"
                  variant="soft"
                  size="sm"
                >
                  {{ r }}
                </UBadge>
                <span
                  v-if="!c.required_roles?.length"
                  class="text-muted"
                >Any signed-in user</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-pencil"
            aria-label="Edit client"
            @click="openEdit(c)"
          />
          <UButton
            color="error"
            variant="ghost"
            size="sm"
            icon="i-lucide-trash-2"
            :loading="deleting === c.client_id"
            aria-label="Delete client"
            @click="remove(c)"
          />
        </div>
      </div>
    </div>

    <!-- Create modal -->
    <UModal
      v-model:open="createOpen"
      title="Register OAuth client"
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="create"
        >
          <UAlert
            v-if="createError"
            color="error"
            variant="soft"
            icon="i-lucide-circle-alert"
            :description="createError"
          />

          <UFormField
            label="Name"
            name="name"
            required
          >
            <UInput
              v-model="form.name"
              placeholder="My App"
              icon="i-lucide-tag"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Redirect URIs"
            name="redirect"
            hint="One per line"
            required
          >
            <UTextarea
              v-model="form.redirectUris"
              :rows="3"
              placeholder="https://app.example.com/callback"
              class="w-full font-mono text-sm"
            />
          </UFormField>

          <UFormField
            label="Scopes"
            name="scopes"
            hint="Space-separated"
          >
            <UInput
              v-model="form.scopes"
              class="w-full font-mono text-sm"
            />
          </UFormField>

          <UFormField
            label="Required roles"
            name="requiredRoles"
            hint="Space-separated role slugs. Leave blank to allow any signed-in user."
          >
            <UInput
              v-model="form.requiredRoles"
              placeholder="grafana-admin grafana-viewer"
              class="w-full font-mono text-sm"
            />
          </UFormField>

          <div class="grid sm:grid-cols-2 gap-3">
            <USwitch
              v-model="form.public"
              label="Public client"
              description="PKCE, no secret"
            />
            <USwitch
              v-model="form.requireConsent"
              label="Require consent"
              description="Show consent screen"
            />
          </div>
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton
            color="neutral"
            variant="ghost"
            @click="createOpen = false"
          >
            Cancel
          </UButton>
          <UButton
            :loading="creating"
            icon="i-lucide-plus"
            @click="create"
          >
            Create client
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Edit modal -->
    <UModal
      v-model:open="editOpen"
      title="Edit OAuth client"
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="saveEdit"
        >
          <UAlert
            v-if="editError"
            color="error"
            variant="soft"
            icon="i-lucide-circle-alert"
            :description="editError"
          />

          <UFormField
            label="Name"
            name="name"
            required
          >
            <UInput
              v-model="editForm.name"
              icon="i-lucide-tag"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Redirect URIs"
            name="redirect"
            hint="One per line"
            required
          >
            <UTextarea
              v-model="editForm.redirectUris"
              :rows="3"
              class="w-full font-mono text-sm"
            />
          </UFormField>

          <UFormField
            label="Scopes"
            name="scopes"
            hint="Space-separated"
          >
            <UInput
              v-model="editForm.scopes"
              class="w-full font-mono text-sm"
            />
          </UFormField>

          <UFormField
            label="Required roles"
            name="requiredRoles"
            hint="Space-separated role slugs. Leave blank to allow any signed-in user."
          >
            <UInput
              v-model="editForm.requiredRoles"
              placeholder="grafana-admin grafana-viewer"
              class="w-full font-mono text-sm"
            />
          </UFormField>

          <USwitch
            v-model="editForm.requireConsent"
            label="Require consent"
            description="Show consent screen"
          />
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton
            color="neutral"
            variant="ghost"
            @click="editOpen = false"
          >
            Cancel
          </UButton>
          <UButton
            :loading="saving"
            icon="i-lucide-save"
            @click="saveEdit"
          >
            Save changes
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- One-time secret modal -->
    <UModal
      :open="!!createdClient"
      title="Client created"
      :dismissible="false"
      @update:open="v => { if (!v) createdClient = null }"
    >
      <template #body>
        <div class="space-y-4">
          <UAlert
            v-if="createdClient?.client_secret"
            color="warning"
            variant="soft"
            icon="i-lucide-triangle-alert"
            title="Copy the client secret now"
            description="It won't be shown again."
          />
          <div>
            <p class="text-xs uppercase tracking-wide text-dimmed mb-1">
              Client ID
            </p>
            <code class="block font-mono text-sm bg-muted/60 rounded-md px-3 py-2 break-all select-all">{{ createdClient?.client_id }}</code>
          </div>
          <div v-if="createdClient?.client_secret">
            <p class="text-xs uppercase tracking-wide text-dimmed mb-1">
              Client secret
            </p>
            <div class="flex items-center gap-2">
              <code class="flex-1 font-mono text-sm bg-muted/60 rounded-md px-3 py-2 break-all select-all">{{ createdClient.client_secret }}</code>
              <UButton
                :icon="secretCopied ? 'i-lucide-check' : 'i-lucide-copy'"
                :color="secretCopied ? 'success' : 'neutral'"
                variant="subtle"
                square
                @click="copySecret"
              />
            </div>
          </div>
          <p
            v-else
            class="text-sm text-muted"
          >
            Public client — no secret is issued.
          </p>
        </div>
      </template>
      <template #footer>
        <UButton
          block
          @click="createdClient = null"
        >
          Done
        </UButton>
      </template>
    </UModal>
  </div>
</template>
