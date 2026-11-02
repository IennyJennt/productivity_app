// Picks each day's focus tasks for a goal: about two hours (or the goal's own
// daily focus time) of its next unfinished tasks, in order of due date and
// then the order they appear in the plan. Tasks ticked off today stay on the
// list and count toward the day's time, so finishing early doesn't keep
// pulling in more work.

import { toISODate } from '../breakdown/dates'
import type { AppData, Id, Task } from './types'

export const DEFAULT_FOCUS_MINUTES = 120

export function goalTasksInOrder(data: AppData, goalId: Id): Task[] {
  const stgOrder = data.shortTermGoals.filter((s) => s.longTermGoalId === goalId).map((s) => s.id)
  const rank = new Map(stgOrder.map((id, i) => [id, i]))
  const tasks = data.tasks.filter((t) => rank.has(t.shortTermGoalId))
  const pos = new Map(tasks.map((t, i) => [t.id, i]))
  return [...tasks].sort(
    (a, b) =>
      (a.dueDate ?? '9999-12-31').localeCompare(b.dueDate ?? '9999-12-31') ||
      rank.get(a.shortTermGoalId)! - rank.get(b.shortTermGoalId)! ||
      pos.get(a.id)! - pos.get(b.id)!,
  )
}

export function focusTasksForToday(data: AppData, goalId: Id, today = new Date()): Task[] {
  const goal = data.longTermGoals.find((g) => g.id === goalId)
  if (!goal || goal.pausedAt) return []
  const budget = goal.dailyFocusMinutes ?? DEFAULT_FOCUS_MINUTES
  const day = toISODate(today)
  const ordered = goalTasksInOrder(data, goalId)

  const doneToday = ordered.filter((t) => t.status === 'done' && t.completedAt && toISODate(new Date(t.completedAt)) === day)
  let used = doneToday.reduce((n, t) => n + t.estimateMinutes, 0)
  const picked: Task[] = [...doneToday]
  for (const t of ordered) {
    if (t.status === 'done') continue
    if (used >= budget) break
    // Always offer at least one task; allow running up to an hour over so a long task isn't skipped.
    if (picked.length > 0 && used + t.estimateMinutes > budget + 60) break
    picked.push(t)
    used += t.estimateMinutes
  }
  return picked
}
