// Turns a goal written as a simple outline into short-term goals and tasks.
//
//   Build a servo robot arm
//     - Design the arm in CAD (3h)
//     - Print and assemble the parts (4h)
//   Launch portfolio website
//
// Lines that are not indented and have no bullet become short-term goals.
// Indented or bulleted lines become tasks under the short-term goal above them.
// A time like "(30m)", "(2h)" or "(1.5h)" at the end sets the task's estimate
// (default 1 hour). Due dates are spread evenly up to the finish date.

import { addDays, parseISODate, spreadDates, toISODate } from './dates'

export interface PlannedTask {
  title: string
  estimateMinutes: number
  dueDate?: string
}

export interface PlannedShortTermGoal {
  title: string
  targetDate?: string
  tasks: PlannedTask[]
}

export interface Plan {
  title: string
  description?: string
  targetDate?: string
  shortTermGoals: PlannedShortTermGoal[]
}

const DEFAULT_MINUTES = 60
const BULLET = /^([-*•·▪◦]|\d+[.)])\s+/

/** Reads "(30m)", "(2h)", "(1.5 h)", "(90 min)" from the end of a line. */
export function parseEstimate(text: string): { title: string; minutes?: number } {
  const m = text.match(/\s*\(\s*(\d+(?:\.\d+)?)\s*(h|hr|hrs|hours?|m|min|mins|minutes?)\s*\)\s*$/i)
  if (!m) return { title: text.trim() }
  const n = Number(m[1])
  const minutes = /^h/i.test(m[2]) ? Math.round(n * 60) : Math.round(n)
  return { title: text.slice(0, m.index).trim(), minutes: Math.max(5, minutes) }
}

export function parseOutline(text: string): { title: string; tasks: { title: string; estimateMinutes: number }[] }[] {
  const groups: { title: string; tasks: { title: string; estimateMinutes: number }[] }[] = []
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim()) continue
    const indented = /^\s+/.test(raw)
    const stripped = raw.trim()
    const isTask = indented || BULLET.test(stripped)
    const { title, minutes } = parseEstimate(stripped.replace(BULLET, ''))
    if (!title) continue
    if (isTask && groups.length > 0) {
      groups[groups.length - 1].tasks.push({ title, estimateMinutes: minutes ?? DEFAULT_MINUTES })
    } else {
      groups.push({ title, tasks: [] })
    }
  }
  return groups
}

export interface GoalInput {
  title: string
  outline: string
  /** Optional YYYY-MM-DD; without it tasks have no due dates. */
  targetDate?: string
}

export function planGoal(input: GoalInput, today: Date): Plan {
  const groups = parseOutline(input.outline)
  const end = input.targetDate ? parseISODate(input.targetDate) : undefined
  const ends = end ? spreadDates(today, end, Math.max(1, groups.length)) : []

  return {
    title: input.title.trim() || 'New goal',
    targetDate: input.targetDate,
    shortTermGoals: groups.map((g, i) => {
      const tasks = g.tasks.length > 0 ? g.tasks : [{ title: `Plan the steps for “${g.title}”`, estimateMinutes: 30 }]
      let dues: (string | undefined)[] = tasks.map(() => undefined)
      if (end) {
        const start = i === 0 ? addDays(today, 0) : ends[i - 1]
        dues = spreadDates(start, ends[i], tasks.length).map(toISODate)
      }
      return {
        title: g.title,
        targetDate: end ? toISODate(ends[i]) : undefined,
        tasks: tasks.map((t, k) => ({ ...t, dueDate: dues[k] })),
      }
    }),
  }
}
