// seconds OR millis in, readable local date-time out
export function formatTime(ts?: number | null): string {
  if (!ts) return '—'
  const ms = ts < 1e12 ? ts * 1000 : ts
  const d = new Date(ms)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

// relative "time ago" for recent activity
export function timeAgo(ts?: number | null): string {
  if (!ts) return '—'
  const ms = ts < 1e12 ? ts * 1000 : ts
  const mins = Math.round((Date.now() - ms) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

// crude-but-readable device label out of a UA string
export function deviceLabel(ua?: string | null): string {
  if (!ua) return 'Unknown device'
  const browser
    = /edg/i.test(ua)
      ? 'Edge'
      : /chrome|crios/i.test(ua)
        ? 'Chrome'
        : /firefox|fxios/i.test(ua)
          ? 'Firefox'
          : /safari/i.test(ua)
            ? 'Safari'
            : 'Browser'
  const os
    = /windows/i.test(ua)
      ? 'Windows'
      : /mac os|macintosh/i.test(ua)
        ? 'macOS'
        : /android/i.test(ua)
          ? 'Android'
          : /iphone|ipad|ios/i.test(ua)
            ? 'iOS'
            : /linux/i.test(ua)
              ? 'Linux'
              : ''
  return os ? `${browser} · ${os}` : browser
}
