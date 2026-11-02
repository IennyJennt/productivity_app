// Turns a long-term goal into short-term goals and tasks.
//
// Each template is a pure function: give it the details the user typed and
// today's date, and it returns a plan. Nothing is saved until the user
// confirms, and everything it creates can be edited afterwards.

import { addDays, endOfMonth, monthsSpanned, parseISODate, spreadDates, toISODate } from './dates'

export interface PlannedTask {
  title: string
  estimateMinutes: number
  dueDate: string
}

export interface PlannedShortTermGoal {
  title: string
  targetDate: string
  tasks: PlannedTask[]
}

export interface Plan {
  title: string
  description?: string
  targetDate: string
  shortTermGoals: PlannedShortTermGoal[]
}

export type GoalKind = 'savings' | 'skills' | 'custom'

const money = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const monthName = (d: Date) => d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

/** Splits pasted text into one item per line, dropping bullets and numbering. */
export function parseList(text: string): string[] {
  const seen = new Set<string>()
  const items: string[] = []
  for (const line of text.split(/\r?\n/)) {
    const item = line
      .replace(/^\s*([-*•·▪◦]|\d+[.)])\s*/, '')
      .trim()
      .replace(/[.;,]+$/, '')
    const key = item.toLowerCase()
    if (item && !seen.has(key)) {
      seen.add(key)
      items.push(item)
    }
  }
  return items
}

// ---------------------------------------------------------------- savings

export interface SavingsInput {
  title?: string
  targetAmount: number
  currentAmount: number
  targetDate: string
}

export function planSavings(input: SavingsInput, today: Date): Plan {
  const end = parseISODate(input.targetDate)
  const remaining = Math.max(0, input.targetAmount - input.currentAmount)
  const months = monthsSpanned(today, end)
  const perMonth = Math.ceil(remaining / months)

  const shortTermGoals: PlannedShortTermGoal[] = []
  let saved = input.currentAmount
  for (let i = 0; i < months; i++) {
    const monthStart = new Date(today.getFullYear(), today.getMonth() + i, 1)
    const monthEnd = i === months - 1 ? end : endOfMonth(monthStart)
    const due = toISODate(monthEnd)
    const before = saved
    saved = i === months - 1 ? Math.max(saved, input.targetAmount) : Math.min(input.targetAmount, saved + perMonth)
    const deposit = saved - before

    const tasks: PlannedTask[] = []
    if (i === 0) {
      tasks.push(
        { title: 'Review last month’s spending and find places to cut', estimateMinutes: 45, dueDate: toISODate(addDays(today, 3)) },
        { title: `Set up an automatic transfer of ${money(perMonth)} a month`, estimateMinutes: 20, dueDate: toISODate(addDays(today, 7)) },
      )
    }
    if (deposit > 0) tasks.push({ title: `Move ${money(deposit)} into savings`, estimateMinutes: 15, dueDate: due })
    tasks.push({ title: 'Check progress and adjust the budget', estimateMinutes: 20, dueDate: due })

    shortTermGoals.push({
      title: `Have ${money(saved)} saved by the end of ${monthName(monthEnd)}`,
      targetDate: due,
      tasks,
    })
  }

  return {
    title: input.title?.trim() || `Save ${money(input.targetAmount)}`,
    description: `${money(perMonth)} a month for ${months} month${months === 1 ? '' : 's'}.`,
    targetDate: input.targetDate,
    shortTermGoals,
  }
}

// ----------------------------------------------------------------- skills

export interface SkillsInput {
  title: string
  /** One skill per line; bullet points pasted from a job description work too. */
  skillsText: string
  targetDate: string
  /** Rough study time per skill, in hours. */
  hoursPerSkill: number
}

export function planSkills(input: SkillsInput, today: Date): Plan {
  const skills = parseList(input.skillsText)
  const end = parseISODate(input.targetDate)
  // Leave the last stretch (about a tenth, at least a week) for applying.
  const totalDays = Math.max(1, Math.round((end.getTime() - today.getTime()) / 86_400_000))
  const applyDays = Math.min(totalDays - 1, Math.max(7, Math.round(totalDays / 10)))
  const learnEnd = addDays(end, -Math.max(0, applyDays))
  const skillEnds = spreadDates(today, learnEnd, Math.max(1, skills.length))

  const studySessions = Math.max(1, Math.round(input.hoursPerSkill) - 3)

  const shortTermGoals: PlannedShortTermGoal[] = skills.map((skill, i) => {
    const start = i === 0 ? today : skillEnds[i - 1]
    const finish = skillEnds[i]
    const steps: Omit<PlannedTask, 'dueDate'>[] = [
      { title: `Pick a course, book or tutorial for ${skill}`, estimateMinutes: 30 },
      ...Array.from({ length: studySessions }, (_, k) => ({
        title: `Study ${skill} (session ${k + 1} of ${studySessions})`,
        estimateMinutes: 60,
      })),
      { title: `Build a small practice project using ${skill}`, estimateMinutes: 120 },
      { title: `Add ${skill} to your resume or portfolio`, estimateMinutes: 20 },
    ]
    const dues = spreadDates(start, finish, steps.length)
    return {
      title: `Learn ${skill}`,
      targetDate: toISODate(finish),
      tasks: steps.map((s, k) => ({ ...s, dueDate: toISODate(dues[k]) })),
    }
  })

  const applySteps: Omit<PlannedTask, 'dueDate'>[] = [
    { title: 'Update your resume to match the job description', estimateMinutes: 60 },
    { title: 'Write a cover letter you can tailor', estimateMinutes: 60 },
    { title: 'Apply to your first few roles', estimateMinutes: 90 },
  ]
  const applyDues = spreadDates(learnEnd, end, applySteps.length)
  shortTermGoals.push({
    title: 'Get ready to apply',
    targetDate: input.targetDate,
    tasks: applySteps.map((s, k) => ({ ...s, dueDate: toISODate(applyDues[k]) })),
  })

  return {
    title: input.title.trim() || 'Learn the skills for a new job',
    description: `${skills.length} skill${skills.length === 1 ? '' : 's'}, about ${input.hoursPerSkill} hours each.`,
    targetDate: input.targetDate,
    shortTermGoals,
  }
}

// ----------------------------------------------------------------- custom

export interface CustomInput {
  title: string
  /** One milestone per line. */
  milestonesText: string
  targetDate: string
}

export function planCustom(input: CustomInput, today: Date): Plan {
  const milestones = parseList(input.milestonesText)
  const end = parseISODate(input.targetDate)
  const ends = spreadDates(today, end, Math.max(1, milestones.length))
  return {
    title: input.title.trim() || 'New goal',
    targetDate: input.targetDate,
    shortTermGoals: milestones.map((m, i) => {
      const start = i === 0 ? today : ends[i - 1]
      const dues = spreadDates(start, ends[i], 2)
      return {
        title: m,
        targetDate: toISODate(ends[i]),
        tasks: [
          { title: `Plan the steps for “${m}”`, estimateMinutes: 30, dueDate: toISODate(dues[0]) },
          { title: `Work on “${m}”`, estimateMinutes: 60, dueDate: toISODate(dues[1]) },
        ],
      }
    }),
  }
}
