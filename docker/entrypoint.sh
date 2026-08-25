#!/bin/sh
# Swap generate-time sentinel tokens for real runtime env in the built SPA.
# Runs from nginx:alpine's /docker-entrypoint.d before nginx starts.
set -eu

ROOT=/usr/share/nginx/html
API_BASE="${NUXT_PUBLIC_API_BASE:-http://localhost:8080}"
TENANT_SLUG="${NUXT_PUBLIC_TENANT_SLUG:-default}"

# Only rewrite text assets that can contain the tokens (JS + the HTML shell).
find "$ROOT" -type f \( -name '*.js' -o -name '*.html' \) -print0 \
  | xargs -0 sed -i \
      -e "s|__NUXT_PUBLIC_API_BASE__|${API_BASE}|g" \
      -e "s|__NUXT_PUBLIC_TENANT_SLUG__|${TENANT_SLUG}|g"

echo "keychain: runtime config applied (apiBase=${API_BASE} tenantSlug=${TENANT_SLUG})"
