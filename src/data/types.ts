// Core data model for the goal planner.
//
// A LongTermGoal (e.g. "Run a half marathon by June") is broken into
// ShortTermGoals (e.g. "Run 10k without stopping by March"), which are
// broken into Tasks small enough to fit in one block of time on the calendar.

export type Id = string

export type Status = 'not_started' | 'in_progress' | 'done'

export interface LongTermGoal {
  id: Id
  title: string
  description?: string
  /** ISO date (YYYY-MM-DD) the goal should be reached by. */
  targetDate?: string
  status: Status
  /** Set while the goal is paused; its tasks are left out of Today. */
  pausedAt?: string
  /** Focus time per day for this goal on the Today list (default 120). */
  dailyFocusMinutes?: number
  createdAt: string
}

export interface ShortTermGoal {
  id: Id
  longTermGoalId: Id
  title: string
  targetDate?: string
  status: Status
  createdAt: string
}

export interface Task {
  id: Id
  shortTermGoalId: Id
  title: string
  /** How long the task should take, in minutes. Used by the scheduler. */
  estimateMinutes: number
  /** Latest date (YYYY-MM-DD) the task should be finished by. */
  dueDate?: string
  status: Status
  /** Filled in by the scheduler once the task has a time slot. */
  scheduledStart?: string
  scheduledEnd?: string
  /** When the task was ticked off. */
  completedAt?: string
  createdAt: string
}

/** A recurring block of free time each week, e.g. Mon 19:00–21:00. */
export interface Availability {
  id: Id
  /** 0 = Sunday … 6 = Saturday */
  weekday: number
  /** 24h "HH:MM" */
  start: string
  end: string
}

export interface AppData {
  version: 1
  longTermGoals: LongTermGoal[]
  shortTermGoals: ShortTermGoal[]
  tasks: Task[]
  availability: Availability[]
  /** Ids from goals.json already brought into the app, so deleted ones stay deleted. */
  importedIds: string[]
}

export const emptyData = (): AppData => ({
  version: 1,
  longTermGoals: [],
  shortTermGoals: [],
  tasks: [],
  availability: [],
  importedIds: [],
})
