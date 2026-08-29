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

# --- Runtime stage: non-root nginx serving the static tree ---
# nginx-unprivileged runs as uid 101 and listens on 8080 (see docker/nginx.conf),
# satisfying the "container must not run as root" hardening check.
FROM nginxinc/nginx-unprivileged:1.27-alpine@sha256:65e3e85dbaed8ba248841d9d58a899b6197106c23cb0ff1a132b7bfe0547e4c0 AS runtime

# COPY/chmod/chown need root; the base image drops back to uid 101 for runtime.
USER root
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /docker-entrypoint.d/40-keychain-runtime-config.sh
COPY --from=build /app/.output/public /usr/share/nginx/html
# entrypoint.sh rewrites the html files in place (sed -i), so they must be owned
# by the runtime uid; also make the hook executable.
RUN chmod +x /docker-entrypoint.d/40-keychain-runtime-config.sh \
 && chown -R 101:101 /usr/share/nginx/html
USER 101

# Defaults if the operator sets nothing. Override at `docker run`/compose.
ENV NUXT_PUBLIC_API_BASE=http://localhost:8080 \
    NUXT_PUBLIC_TENANT_SLUG=default

EXPOSE 8080
# Liveness probe via busybox wget (present in alpine).
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null 2>&1 || exit 1
# The base image entrypoint runs everything in /docker-entrypoint.d then execs
# nginx, so our token-swap script runs before the server starts.
