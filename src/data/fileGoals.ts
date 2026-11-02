// Goals written into src/data/goals.json (for example by Claude, when you
// describe a new goal in chat) are added to the app the next time it opens.
//
// Each goal, short-term goal and task in the file has a fixed id. An id is
// imported once: ticking tasks off or editing them in the app is kept, and
// anything you delete in the app does not come back. New items added to the
// file later, including new tasks under an existing goal, are picked up.

import fileGoalsJson from './goals.json'
import type { AppData, LongTermGoal, ShortTermGoal, Task } from './types'

export interface FileTask {
  id: string
  title: string
  estimateMinutes: number
  dueDate?: string
}

export interface FileShortTermGoal {
  id: string
  title: string
  targetDate?: string
  tasks: FileTask[]
}

export interface FileGoal {
  id: string
  title: string
  description?: string
  targetDate?: string
  shortTermGoals: FileShortTermGoal[]
}

export const fileGoals = fileGoalsJson as FileGoal[]

export function mergeFileGoals(data: AppData, goals: FileGoal[]): AppData {
  const seen = new Set(data.importedIds)
  const now = new Date().toISOString()
  const ltgs: LongTermGoal[] = []
  const stgs: ShortTermGoal[] = []
  const tasks: Task[] = []

  for (const g of goals) {
    if (!seen.has(g.id)) {
      seen.add(g.id)
      ltgs.push({ id: g.id, title: g.title, description: g.description, targetDate: g.targetDate, status: 'not_started', createdAt: now })
    }
    for (const s of g.shortTermGoals) {
      if (!seen.has(s.id)) {
        seen.add(s.id)
        stgs.push({ id: s.id, longTermGoalId: g.id, title: s.title, targetDate: s.targetDate, status: 'not_started', createdAt: now })
      }
      for (const t of s.tasks) {
        if (!seen.has(t.id)) {
          seen.add(t.id)
          tasks.push({
            id: t.id,
            shortTermGoalId: s.id,
            title: t.title,
            estimateMinutes: t.estimateMinutes,
            dueDate: t.dueDate,
            status: 'not_started',
            createdAt: now,
          })
        }
      }
    }
  }

  if (ltgs.length + stgs.length + tasks.length === 0) return data
  return {
    ...data,
    longTermGoals: [...data.longTermGoals, ...ltgs],
    shortTermGoals: [...data.shortTermGoals, ...stgs],
    tasks: [...data.tasks, ...tasks],
    importedIds: [...seen],
  }
}
