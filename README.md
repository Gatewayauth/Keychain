# Keychain

The web frontend for [Gateway](../Backend) — a self-hosted OpenID Connect / OAuth2
identity provider. Keychain is the interface users actually see: sign in, register,
manage their account and MFA, approve OIDC consent, and (for admins) manage clients,
users, and keys.

Built with **Nuxt 4** and **Nuxt UI**. It ships as a client-rendered SPA and talks to
the Gateway backend over a cookie-authenticated JSON API — no tokens are ever stored
in the browser.

## Requirements

- Node 20+
- Yarn 4 (Corepack: `corepack enable`)
- A running Gateway backend (defaults to `http://localhost:8080`)

## Setup

```bash
yarn install
```

## Development

```bash
yarn dev
```

Serves on `http://localhost:3000`. Point it at your backend with:

```bash
NUXT_PUBLIC_API_BASE=http://localhost:8080 yarn dev
```

The backend must allow this origin — set `GATEWAY_CORS_ORIGINS=http://localhost:3000`
on the backend. For login cookies to work the two must be same-site (localhost ↔
localhost is fine).

## Build

```bash
yarn build      # production build
yarn preview    # preview the build locally
```

## Configuration

| Env var | Default | Purpose |
|---------|---------|---------|
| `NUXT_PUBLIC_API_BASE` | `http://localhost:8080` | Gateway backend base URL |
| `NUXT_PUBLIC_TENANT_SLUG` | `default` | Tenant this UI targets; all API calls go to `/t/{slug}` |

## Testing

```bash
yarn test        # unit + Nuxt component tests (Vitest)
yarn test:e2e    # end-to-end (Playwright)
yarn lint        # ESLint
yarn typecheck   # vue-tsc
```

## Project layout

```
app/
  pages/         routes (login, register, account, admin/*, oauth2/authorize, …)
  components/    UI building blocks (AuthCard, MfaEnroll, QrCode, …)
  composables/   useApi (typed API client), useAuth (session state)
  middleware/    auth.global.ts — session guard
  plugins/       api.ts — shared $fetch instance (cookie auth, error normalization)
  types/         api.d.ts is generated from the backend OpenAPI spec
```

Regenerate API types against a running backend:

```bash
yarn api:types
```

## Security headers

Keychain ships as static files, so response headers come from whatever serves them
(nginx, Caddy, a CDN). Set a Content-Security-Policy and the standard hardening
headers there — the admin bootstrap token lives in `sessionStorage`, so a CSP is the
main defence against an XSS reading it. Example nginx block (adjust the backend origin
in `connect-src` to your `NUXT_PUBLIC_API_BASE`):

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://gateway.example; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "no-referrer" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

`style-src` needs `'unsafe-inline'` for Nuxt UI's runtime styles. Verify the CSP in the
browser console after any UI dependency bump. The backend sets its own headers on API
responses (the `DefaultHeaders` install in `Backend`'s `Application.kt`).

## See also

- Backend + API: [../Backend/README.md](../Backend/README.md)
- End-to-end setup: [../Backend/docs/IMPLEMENTATION.md](../Backend/docs/IMPLEMENTATION.md)
