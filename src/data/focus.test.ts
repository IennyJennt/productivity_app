import { describe, expect, it } from 'vitest'
import { pauseGoal, resumeGoal, setTaskDone } from './actions'
import { focusTasksForToday } from './focus'
import { mergeFileGoals } from './fileGoals'
import { emptyData } from './types'

const base = () =>
  mergeFileGoals(emptyData(), [
    {
      id: 'g',
      title: 'Robot arm',
      shortTermGoals: [
        {
          id: 's',
          title: 'Build it',
          tasks: [
            { id: 'a', title: 'A', estimateMinutes: 60, dueDate: '2026-11-05' },
            { id: 'b', title: 'B', estimateMinutes: 60, dueDate: '2026-11-06' },
            { id: 'c', title: 'C', estimateMinutes: 60, dueDate: '2026-11-07' },
          ],
        },
      ],
    },
  ])

describe('focusTasksForToday', () => {
  it('fills about two hours with the next tasks', () => {
    expect(focusTasksForToday(base(), 'g').map((t) => t.id)).toEqual(['a', 'b'])
  })

  it('keeps tasks finished today on the list instead of adding more', () => {
    const data = setTaskDone(base(), 'a', true)
    expect(focusTasksForToday(data, 'g').map((t) => t.id)).toEqual(['a', 'b'])
  })

  it('shows nothing while paused', () => {
    expect(focusTasksForToday(pauseGoal(base(), 'g'), 'g')).toEqual([])
  })
})

describe('resumeGoal', () => {
  it('moves unfinished due dates later by the days paused', () => {
    let data = setTaskDone(base(), 'a', true)
    data = pauseGoal(data, 'g', new Date(2026, 10, 1, 9))
    data = resumeGoal(data, 'g', new Date(2026, 10, 11, 9))
    expect(data.longTermGoals[0].pausedAt).toBeUndefined()
    expect(data.tasks.map((t) => t.dueDate)).toEqual(['2026-11-05', '2026-11-16', '2026-11-17'])
  })
})
