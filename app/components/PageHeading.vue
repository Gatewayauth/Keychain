<script setup lang="ts">
defineProps<{ title: string, subtitle?: string }>()
</script>

<template>
  <div class="mb-6 flex items-end justify-between gap-4">
    <div>
      <h1 class="font-display text-2xl font-semibold tracking-tight text-highlighted">
        {{ title }}
      </h1>
      <p
        v-if="subtitle"
        class="text-muted mt-1"
      >
        {{ subtitle }}
      </p>
    </div>
    <div
      v-if="$slots.actions"
      class="shrink-0"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
