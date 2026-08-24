<script setup lang="ts">
const props = defineProps<{ codes: string[] }>()
const toast = useToast()
const copied = ref(false)

const asText = computed(() => props.codes.join('\n'))

async function copy() {
  try {
    await navigator.clipboard.writeText(asText.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    toast.add({ title: 'Copy failed', color: 'error' })
  }
}

function download() {
  const blob = new Blob([asText.value + '\n'], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'keychain-recovery-codes.txt'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-3">
    <UAlert
      color="warning"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="Save these now — they won't be shown again"
      description="Each code works once. Store them somewhere safe to regain access if you lose your authenticator."
    />

    <div class="rounded-lg border border-default bg-muted/40 p-4">
      <ul class="grid grid-cols-2 gap-x-6 gap-y-1.5 font-mono text-sm">
        <li
          v-for="c in codes"
          :key="c"
          class="text-highlighted tracking-wide select-all"
        >
          {{ c }}
        </li>
      </ul>
    </div>

    <div class="flex gap-2">
      <UButton
        :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
        :color="copied ? 'success' : 'neutral'"
        variant="subtle"
        size="sm"
        @click="copy"
      >
        {{ copied ? 'Copied' : 'Copy all' }}
      </UButton>
      <UButton
        icon="i-lucide-download"
        color="neutral"
        variant="subtle"
        size="sm"
        @click="download"
      >
        Download
      </UButton>
    </div>
  </div>
</template>
