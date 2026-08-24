import { describe, expect, it } from 'vitest'
import { deviceLabel, timeAgo } from '../../app/utils/format'

describe('deviceLabel', () => {
  it('falls back when no UA', () => {
    expect(deviceLabel(null)).toBe('Unknown device')
    expect(deviceLabel('')).toBe('Unknown device')
  })

  it('detects Chrome on Windows', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
    expect(deviceLabel(ua)).toBe('Chrome · Windows')
  })

  it('detects Safari on macOS', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
    expect(deviceLabel(ua)).toBe('Safari · macOS')
  })
})

describe('timeAgo', () => {
  it('handles empty', () => {
    expect(timeAgo(null)).toBe('—')
  })

  it('reads seconds and ms alike', () => {
    const nowSec = Math.floor(Date.now() / 1000)
    expect(timeAgo(nowSec)).toBe('just now')
    expect(timeAgo(Date.now())).toBe('just now')
  })

  it('formats minutes ago', () => {
    const tenMinAgo = Math.floor(Date.now() / 1000) - 600
    expect(timeAgo(tenMinAgo)).toBe('10m ago')
  })
})
