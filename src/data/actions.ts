// Pure updates to AppData. Each returns a new object so React re-renders.

import type { Plan } from '../breakdown/templates'
import { newId } from './storage'
import type { AppData, Id, LongTermGoal, ShortTermGoal, Status, Task } from './types'

const now = () => new Date().toISOString()

export function addPlan(data: AppData, plan: Plan): { data: AppData; goalId: Id } {
  const goal: LongTermGoal = {
    id: newId(),
    title: plan.title,
    description: plan.description,
    targetDate: plan.targetDate,
    status: 'not_started',
    createdAt: now(),
  }
  const stgs: ShortTermGoal[] = []
  const tasks: Task[] = []
  for (const p of plan.shortTermGoals) {
    const stg: ShortTermGoal = {
      id: newId(),
      longTermGoalId: goal.id,
      title: p.title,
      targetDate: p.targetDate,
      status: 'not_started',
      createdAt: now(),
    }
    stgs.push(stg)
    for (const t of p.tasks) {
      tasks.push({ id: newId(), shortTermGoalId: stg.id, ...t, status: 'not_started', createdAt: now() })
    }
  }
  return {
    goalId: goal.id,
    data: {
      ...data,
      longTermGoals: [...data.longTermGoals, goal],
      shortTermGoals: [...data.shortTermGoals, ...stgs],
      tasks: [...data.tasks, ...tasks],
    },
  }
}

export function updateLongTermGoal(data: AppData, id: Id, patch: Partial<LongTermGoal>): AppData {
  return { ...data, longTermGoals: data.longTermGoals.map((g) => (g.id === id ? { ...g, ...patch } : g)) }
}

export function deleteLongTermGoal(data: AppData, id: Id): AppData {
  const stgIds = new Set(data.shortTermGoals.filter((s) => s.longTermGoalId === id).map((s) => s.id))
  return {
    ...data,
    longTermGoals: data.longTermGoals.filter((g) => g.id !== id),
    shortTermGoals: data.shortTermGoals.filter((s) => !stgIds.has(s.id)),
    tasks: data.tasks.filter((t) => !stgIds.has(t.shortTermGoalId)),
  }
}

export function addShortTermGoal(data: AppData, longTermGoalId: Id, title: string, targetDate?: string): AppData {
  const stg: ShortTermGoal = { id: newId(), longTermGoalId, title, targetDate, status: 'not_started', createdAt: now() }
  return { ...data, shortTermGoals: [...data.shortTermGoals, stg] }
}

export function updateShortTermGoal(data: AppData, id: Id, patch: Partial<ShortTermGoal>): AppData {
  return { ...data, shortTermGoals: data.shortTermGoals.map((s) => (s.id === id ? { ...s, ...patch } : s)) }
}

export function deleteShortTermGoal(data: AppData, id: Id): AppData {
  return {
    ...data,
    shortTermGoals: data.shortTermGoals.filter((s) => s.id !== id),
    tasks: data.tasks.filter((t) => t.shortTermGoalId !== id),
  }
}

export function addTask(data: AppData, shortTermGoalId: Id, title: string, estimateMinutes = 30, dueDate?: string): AppData {
  const task: Task = { id: newId(), shortTermGoalId, title, estimateMinutes, dueDate, status: 'not_started', createdAt: now() }
  return { ...data, tasks: [...data.tasks, task] }
}

export function updateTask(data: AppData, id: Id, patch: Partial<Task>): AppData {
  return { ...data, tasks: data.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }
}

export function deleteTask(data: AppData, id: Id): AppData {
  return { ...data, tasks: data.tasks.filter((t) => t.id !== id) }
}

/** Share of the work done, weighted by each task's time estimate (0–1). */
export function progress(tasks: Task[]): number {
  const total = tasks.reduce((n, t) => n + t.estimateMinutes, 0)
  if (total === 0) return 0
  return tasks.filter((t) => t.status === 'done').reduce((n, t) => n + t.estimateMinutes, 0) / total
}

export function statusFromTasks(tasks: Task[]): Status {
  if (tasks.length === 0) return 'not_started'
  if (tasks.every((t) => t.status === 'done')) return 'done'
  if (tasks.some((t) => t.status !== 'not_started')) return 'in_progress'
  return 'not_started'
}
