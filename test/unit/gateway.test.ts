import { describe, expect, it } from 'vitest'
import { isMfaChallenge, EXTERNAL_PROVIDERS } from '../../app/types/gateway'

describe('isMfaChallenge', () => {
  it('is true for an MFA challenge', () => {
    expect(isMfaChallenge({ mfaRequired: true, mfaToken: 'abc' })).toBe(true)
  })

  it('is false for a resolved user', () => {
    expect(isMfaChallenge({ id: '1', email: 'a@b.c' })).toBe(false)
  })

  it('is false when mfaRequired is absent/false', () => {
    expect(isMfaChallenge({ mfaRequired: false })).toBe(false)
    expect(isMfaChallenge({})).toBe(false)
  })
})

describe('external providers', () => {
  it('lists the three supported providers', () => {
    expect(EXTERNAL_PROVIDERS).toEqual(['google', 'github', 'discord'])
  })
})
