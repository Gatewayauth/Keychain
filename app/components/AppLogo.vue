<script setup lang="ts">
withDefaults(defineProps<{ withWordmark?: boolean }>(), { withWordmark: true })
</script>

<template>
  <span class="inline-flex items-center gap-2 text-highlighted">
    <span
      class="inline-flex items-center justify-center size-7 rounded-lg bg-brand-500/12 text-primary ring-1 ring-brand-500/25"
    >
      <UIcon
        name="i-lucide-key-round"
        class="size-4"
      />
    </span>
    <span
      v-if="withWordmark"
      class="font-display text-lg font-semibold tracking-tight"
    >Keychain</span>
  </span>
</template>
