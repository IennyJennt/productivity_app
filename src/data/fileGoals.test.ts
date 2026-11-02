import { describe, expect, it } from 'vitest'
import { mergeFileGoals, type FileGoal } from './fileGoals'
import { deleteTask } from './actions'
import { emptyData } from './types'

const goal: FileGoal = {
  id: 'g1',
  title: 'Save $1,000',
  shortTermGoals: [
    { id: 's1', title: 'Save $500 by December', tasks: [{ id: 't1', title: 'Move $500', estimateMinutes: 15 }] },
  ],
}

describe('mergeFileGoals', () => {
  it('imports new goals once and keeps progress', () => {
    let data = mergeFileGoals(emptyData(), [goal])
    expect(data.tasks).toHaveLength(1)
    data = { ...data, tasks: data.tasks.map((t) => ({ ...t, status: 'done' as const })) }
    data = mergeFileGoals(data, [goal])
    expect(data.tasks).toHaveLength(1)
    expect(data.tasks[0].status).toBe('done')
  })

  it('does not bring back deleted items but picks up new ones', () => {
    let data = mergeFileGoals(emptyData(), [goal])
    data = deleteTask(data, 't1')
    const updated: FileGoal = {
      ...goal,
      shortTermGoals: [{ ...goal.shortTermGoals[0], tasks: [...goal.shortTermGoals[0].tasks, { id: 't2', title: 'Check budget', estimateMinutes: 20 }] }],
    }
    data = mergeFileGoals(data, [updated])
    expect(data.tasks.map((t) => t.id)).toEqual(['t2'])
    expect(data.longTermGoals).toHaveLength(1)
  })
})
