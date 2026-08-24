<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  icon?: string
}>()
</script>

<template>
  <div class="animate-rise">
    <div class="rounded-2xl border border-default bg-elevated/50 shadow-sm p-6 sm:p-7">
      <div class="mb-6 space-y-2">
        <span
          v-if="icon"
          class="inline-flex items-center justify-center size-9 rounded-xl bg-brand-500/12 text-primary ring-1 ring-brand-500/25"
        >
          <UIcon
            :name="icon"
            class="size-4.5"
          />
        </span>
        <h1 class="font-display text-xl font-semibold tracking-tight text-highlighted">
          {{ title }}
        </h1>
        <p
          v-if="subtitle"
          class="text-sm text-muted"
        >
          {{ subtitle }}
        </p>
      </div>

      <slot />
    </div>

    <div
      v-if="$slots.footer"
      class="mt-5 text-center text-sm text-muted"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
