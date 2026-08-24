<script setup lang="ts">
import QRCode from 'qrcode'

const props = withDefaults(defineProps<{ value: string, size?: number }>(), {
  size: 200
})

const dataUrl = ref<string>('')
const error = ref(false)

async function render() {
  error.value = false
  try {
    dataUrl.value = await QRCode.toDataURL(props.value, {
      width: props.size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#1c1917', light: '#ffffff' }
    })
  } catch {
    error.value = true
  }
}

watch(() => props.value, render, { immediate: true })
</script>

<template>
  <div
    class="inline-flex items-center justify-center rounded-xl bg-white p-3 ring-1 ring-default shadow-sm"
    :style="{ width: `${size + 24}px`, height: `${size + 24}px` }"
  >
    <img
      v-if="dataUrl && !error"
      :src="dataUrl"
      :width="size"
      :height="size"
      alt="Scan this QR code with your authenticator app"
    >
    <span
      v-else-if="error"
      class="text-xs text-error text-center px-2"
    >
      Couldn't render QR — use the secret below.
    </span>
    <UIcon
      v-else
      name="i-lucide-loader-circle"
      class="size-6 animate-spin text-dimmed"
    />
  </div>
</template>
