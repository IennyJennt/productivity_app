// Small date helpers that work in local time with YYYY-MM-DD strings.

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(d: Date, days: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + days)
  return r
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

/** Number of calendar months touched from `start` to `end`, at least 1. */
export function monthsSpanned(start: Date, end: Date): number {
  const n = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1
  return Math.max(1, n)
}

/** `count` dates spread evenly after `start`, the last one landing on `end`. */
export function spreadDates(start: Date, end: Date, count: number): Date[] {
  const span = Math.max(0, daysBetween(start, end))
  return Array.from({ length: count }, (_, i) =>
    addDays(start, Math.round((span * (i + 1)) / count)),
  )
}

export function formatDate(s?: string): string {
  if (!s) return ''
  return parseISODate(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
