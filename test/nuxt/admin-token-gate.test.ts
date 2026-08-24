import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { computed, h, ref } from 'vue'
import AdminTokenGate from '~/components/AdminTokenGate.vue'

const state = vi.hoisted(() => ({ hasToken: false }))

mockNuxtImport('useAdminToken', () => () => ({
  token: ref('a-token'),
  hasToken: computed(() => state.hasToken),
  set: vi.fn(),
  clear: vi.fn()
}))
mockNuxtImport('useApi', () => () => ({ adminClients: vi.fn() }))

describe('AdminTokenGate', () => {
  beforeEach(() => {
    state.hasToken = false
  })

  it('renders the unlock form when no token is held', async () => {
    const gate = await mountSuspended(AdminTokenGate, {
      slots: { default: () => h('div', 'UNLOCKED') }
    })
    expect(gate.text()).toContain('Admin access')
    expect(gate.text()).not.toContain('UNLOCKED')
  })

  it('renders the slot once a token is held', async () => {
    state.hasToken = true
    const gate = await mountSuspended(AdminTokenGate, {
      slots: { default: () => h('div', 'UNLOCKED') }
    })
    expect(gate.text()).toContain('UNLOCKED')
    expect(gate.text()).not.toContain('Admin access')
  })
})
