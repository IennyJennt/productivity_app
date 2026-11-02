import { describe, expect, it } from 'vitest'
import { parseEstimate, parseOutline, planGoal } from './templates'

const today = new Date(2026, 10, 2) // Nov 2, 2026

describe('parseEstimate', () => {
  it('reads hours and minutes', () => {
    expect(parseEstimate('Wire servos (2h)')).toEqual({ title: 'Wire servos', minutes: 120 })
    expect(parseEstimate('Sketch (1.5 h)')).toEqual({ title: 'Sketch', minutes: 90 })
    expect(parseEstimate('Email (15m)')).toEqual({ title: 'Email', minutes: 15 })
    expect(parseEstimate('No estimate')).toEqual({ title: 'No estimate' })
  })
})

describe('parseOutline', () => {
  it('groups indented and bulleted lines under the line above', () => {
    const groups = parseOutline('Robot arm\n  Design in CAD (3h)\n- Print parts\nWebsite\n\n* Pick a template (30m)')
    expect(groups).toEqual([
      { title: 'Robot arm', tasks: [{ title: 'Design in CAD', estimateMinutes: 180 }, { title: 'Print parts', estimateMinutes: 60 }] },
      { title: 'Website', tasks: [{ title: 'Pick a template', estimateMinutes: 30 }] },
    ])
  })
})

describe('planGoal', () => {
  it('spreads due dates up to the finish date', () => {
    const plan = planGoal({ title: 'Half marathon', outline: 'Run 5k\n  Run 3x a week\nRun 10k\nRace day', targetDate: '2027-03-01' }, today)
    expect(plan.shortTermGoals.map((s) => s.title)).toEqual(['Run 5k', 'Run 10k', 'Race day'])
    expect(plan.shortTermGoals.at(-1)!.targetDate).toBe('2027-03-01')
    expect(plan.shortTermGoals[1].tasks[0].title).toContain('Plan the steps')
    const dues = plan.shortTermGoals.flatMap((s) => s.tasks.map((t) => t.dueDate!))
    expect([...dues].sort()).toEqual(dues)
  })

  it('leaves dates empty without a finish date', () => {
    const plan = planGoal({ title: 'Someday', outline: 'Step one' }, today)
    expect(plan.shortTermGoals[0].targetDate).toBeUndefined()
    expect(plan.shortTermGoals[0].tasks[0].dueDate).toBeUndefined()
  })
})
