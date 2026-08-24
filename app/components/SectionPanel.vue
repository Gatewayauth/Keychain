<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  icon?: string
}>()
</script>

<template>
  <section class="rounded-2xl border border-default bg-elevated/40">
    <header
      v-if="title || $slots.actions"
      class="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-default"
    >
      <div class="flex items-start gap-3 min-w-0">
        <span
          v-if="icon"
          class="mt-0.5 inline-flex items-center justify-center size-8 rounded-lg bg-brand-500/12 text-primary ring-1 ring-brand-500/20 shrink-0"
        >
          <UIcon
            :name="icon"
            class="size-4"
          />
        </span>
        <div class="min-w-0">
          <h2 class="font-medium text-highlighted leading-tight">
            {{ title }}
          </h2>
          <p
            v-if="description"
            class="text-sm text-muted mt-0.5"
          >
            {{ description }}
          </p>
        </div>
      </div>
      <div
        v-if="$slots.actions"
        class="shrink-0"
      >
        <slot name="actions" />
      </div>
    </header>

    <div class="px-5 sm:px-6 py-5">
      <slot />
    </div>
  </section>
</template>
