// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // only what the app actually uses. image/scripts/a11y/hints were dead weight
  // (dev-server + bundle overhead); test-utils gets wired via vitest.config
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  // Cookie-session auth portal, so there's no SEO need and no reason to forward
  // cookies server-side. Ship it as a client-rendered SPA.
  ssr: false,

  devtools: {
    enabled: true
  },

  app: {
    // bake lang + base title into the static SPA shell
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Keychain',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
        }
      ]
    },
    // Restrained, global page transition (see also app.vue view-transition).
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'page', mode: 'out-in' }
  },

  css: ['~/assets/css/main.css'],

  // dark-only; no theme toggle
  colorMode: {
    preference: 'dark',
    fallback: 'dark'
  },

  runtimeConfig: {
    public: {
      // Backend base URL. Override with NUXT_PUBLIC_API_BASE.
      apiBase: 'http://localhost:8080',
      // Tenant slug; all API calls go to /t/{slug}. Override with NUXT_PUBLIC_TENANT_SLUG.
      tenantSlug: 'default'
    }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
