# syntax=docker/dockerfile:1

# --- Build stage: generate the static SPA ---
FROM node:22-alpine@sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32 AS build
WORKDIR /app

# Corepack ships with node:22 and pins the Yarn version from package.json
# (packageManager: yarn@4.18.0). Enable it before any yarn call.
RUN corepack enable

# Dependency layer: copy only what the install needs so it caches across
# source-only changes.
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

COPY . .

# Runtime config (apiBase, tenantSlug) is inlined at generate time for a static
# SPA. This is OSS, so it must NOT be baked to a real value here — generate with
# sentinel tokens and swap them for real env at container start (entrypoint).
ENV NUXT_PUBLIC_API_BASE=__NUXT_PUBLIC_API_BASE__ \
    NUXT_PUBLIC_TENANT_SLUG=__NUXT_PUBLIC_TENANT_SLUG__
RUN yarn nuxt generate

# --- Runtime stage: nginx serving the static tree ---
FROM nginx:1.27-alpine@sha256:65645c7bb6a0661892a8b03b89d0743208a18dd2f3f17a54ef4b76fb8e2f2a10 AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /docker-entrypoint.d/40-keychain-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-keychain-runtime-config.sh

COPY --from=build /app/.output/public /usr/share/nginx/html

# Defaults if the operator sets nothing. Override at `docker run`/compose.
ENV NUXT_PUBLIC_API_BASE=http://localhost:8080 \
    NUXT_PUBLIC_TENANT_SLUG=default

EXPOSE 80
# nginx:alpine's own entrypoint runs everything in /docker-entrypoint.d then
# execs nginx, so our token-swap script runs before the server starts.
