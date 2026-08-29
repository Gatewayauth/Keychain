# Contributing to Keychain

Thanks for your interest in improving Keychain (the Gateway frontend).

## How to contribute

- **Bugs & features:** open a [GitHub issue](https://github.com/Gatewayauth/Keychain/issues).
- **Changes:** open a pull request against `main`. PRs are the required path —
  `main` is branch-protected and every change goes through a PR.
- **Security vulnerabilities:** do **not** open a public issue — follow
  [SECURITY.md](SECURITY.md) (private GitHub Security Advisory).

## Development

```bash
yarn install      # install deps (Corepack/Yarn 4)
yarn dev          # run the dev server
yarn lint         # ESLint
yarn typecheck    # vue-tsc
yarn test         # Vitest unit/component tests
yarn test:e2e     # Playwright end-to-end
```

CI runs lint, typecheck, and the security scanners (CodeQL, Semgrep, Trivy) on
every push. A PR must be green to merge.

## Coding standards

- TypeScript + Vue/Nuxt 4. Style and quality are enforced by **ESLint**
  (`eslint.config.mjs` / `@nuxt/eslint`). Run `yarn lint` before pushing.

## Testing policy

**New or changed functionality must ship with tests.** Add Vitest unit/component
tests for new logic and Playwright e2e coverage for new flows. Perfection isn't
required, but untested new behaviour will be asked to add coverage before merge.
Tests run in CI.

## Versioning & releases

Releases use [Semantic Versioning](https://semver.org) and are tagged in git
(`vX.Y.Z`), which triggers the container publish workflow.
