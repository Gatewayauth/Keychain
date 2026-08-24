<script setup lang="ts">
const props = withDefaults(defineProps<{
  placeholder?: string
  autocomplete?: string
  meter?: boolean
}>(), {
  placeholder: '••••••••••••',
  autocomplete: 'current-password',
  meter: false
})

const model = defineModel<string>({ default: '' })
const show = ref(false)

// Lightweight, honest strength read — length + character variety.
const score = computed(() => {
  const v = model.value || ''
  let s = 0
  if (v.length >= 12) s++
  if (v.length >= 16) s++
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++
  if (/\d/.test(v)) s++
  if (/[^\w\s]/.test(v)) s++
  return Math.min(s, 4)
})
const label = computed(() => ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][score.value])
const barColor = computed(() =>
  ['bg-error', 'bg-error', 'bg-warning', 'bg-primary', 'bg-success'][score.value])
</script>

<template>
  <div class="space-y-1.5">
    <UInput
      v-model="model"
      :type="show ? 'text' : 'password'"
      :placeholder="props.placeholder"
      :autocomplete="props.autocomplete"
      icon="i-lucide-lock"
      :ui="{ trailing: 'pe-1' }"
      class="w-full"
    >
      <template #trailing>
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          :aria-label="show ? 'Hide password' : 'Show password'"
          tabindex="-1"
          @click="show = !show"
        />
      </template>
    </UInput>

    <div
      v-if="meter && model"
      class="flex items-center gap-2"
    >
      <div class="flex-1 grid grid-cols-4 gap-1">
        <span
          v-for="i in 4"
          :key="i"
          class="h-1 rounded-full transition-colors duration-200"
          :class="i <= score ? barColor : 'bg-elevated'"
        />
      </div>
      <span class="text-xs text-muted tabular-nums w-14 text-right">{{ label }}</span>
    </div>
  </div>
</template>
