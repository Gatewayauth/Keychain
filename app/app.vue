<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'en' },
  link: [
    { rel: 'icon', href: '/favicon.ico' }
    // Font preconnect + stylesheet live in nuxt.config app.head.
  ],
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})

useSeoMeta({
  title: 'Keychain',
  titleTemplate: (t?: string | null) => (t && t !== 'Keychain' ? `${t} · Keychain` : 'Keychain'),
  description: 'Secure access to your account and connected apps.'
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
