import { describe, expect, it } from 'vitest'
import { parseList, planCustom, planSavings, planSkills } from './templates'

const today = new Date(2026, 10, 2) // Nov 2, 2026

describe('parseList', () => {
  it('strips bullets, numbering and duplicates', () => {
    expect(parseList('- SQL\n• Excel;\n2) Tableau\n\nsql\n  * Python.')).toEqual(['SQL', 'Excel', 'Tableau', 'Python'])
  })
})

describe('planSavings', () => {
  it('splits the remaining amount across months and ends at the target', () => {
    const plan = planSavings({ targetAmount: 6000, currentAmount: 600, targetDate: '2027-04-30' }, today)
    expect(plan.shortTermGoals).toHaveLength(6) // Nov..Apr
    expect(plan.shortTermGoals.at(-1)!.title).toContain('6,000')
    expect(plan.shortTermGoals.at(-1)!.targetDate).toBe('2027-04-30')
    const deposits = plan.shortTermGoals
      .flatMap((s) => s.tasks)
      .filter((t) => t.title.startsWith('Move'))
      .map((t) => Number(t.title.replace(/[^\d]/g, '')))
    expect(deposits.reduce((a, b) => a + b, 0)).toBe(5400)
    // First month gets the setup tasks.
    expect(plan.shortTermGoals[0].tasks.length).toBeGreaterThan(plan.shortTermGoals[1].tasks.length)
  })

  it('handles a goal finishing this month', () => {
    const plan = planSavings({ targetAmount: 500, currentAmount: 0, targetDate: '2026-11-20' }, today)
    expect(plan.shortTermGoals).toHaveLength(1)
    expect(plan.shortTermGoals[0].targetDate).toBe('2026-11-20')
  })
})

describe('planSkills', () => {
  it('makes a study plan per skill plus an apply stage, all before the deadline', () => {
    const plan = planSkills(
      { title: 'Data analyst', skillsText: 'SQL\nTableau\nStatistics', targetDate: '2027-05-01', hoursPerSkill: 10 },
      today,
    )
    expect(plan.shortTermGoals.map((s) => s.title)).toEqual([
      'Learn SQL',
      'Learn Tableau',
      'Learn Statistics',
      'Get ready to apply',
    ])
    const sql = plan.shortTermGoals[0]
    expect(sql.tasks.filter((t) => t.title.startsWith('Study'))).toHaveLength(7)
    const dues = plan.shortTermGoals.flatMap((s) => s.tasks.map((t) => t.dueDate))
    expect([...dues].sort()).toEqual(dues) // in order
    expect(dues.every((d) => d > '2026-11-02' && d <= '2027-05-01')).toBe(true)
  })
})

describe('planCustom', () => {
  it('turns each milestone into a short-term goal', () => {
    const plan = planCustom({ title: 'Half marathon', milestonesText: '5k\n10k\nRace day', targetDate: '2027-03-01' }, today)
    expect(plan.shortTermGoals.map((s) => s.title)).toEqual(['5k', '10k', 'Race day'])
    expect(plan.shortTermGoals.at(-1)!.targetDate).toBe('2027-03-01')
  })
})
