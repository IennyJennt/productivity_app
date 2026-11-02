import { useState } from 'react'
import { formatDate } from '../breakdown/dates'
import * as A from '../data/actions'
import type { AppData, Id } from '../data/types'
import { GoalDetail } from './GoalDetail'
import { NewGoalForm } from './NewGoalForm'
import { ProgressBar } from './ProgressBar'

interface Props {
  data: AppData
  setData: (fn: (d: AppData) => AppData) => void
}

export function GoalsView({ data, setData }: Props) {
  const [view, setView] = useState<{ kind: 'list' } | { kind: 'new' } | { kind: 'goal'; id: Id }>({ kind: 'list' })

  if (view.kind === 'new') {
    return (
      <NewGoalForm
        onCancel={() => setView({ kind: 'list' })}
        onSave={(plan) => {
          const r = A.addPlan(data, plan)
          setData(() => r.data)
          setView({ kind: 'goal', id: r.goalId })
        }}
      />
    )
  }

  if (view.kind === 'goal') {
    return <GoalDetail data={data} goalId={view.id} setData={setData} onBack={() => setView({ kind: 'list' })} />
  }

  return (
    <section>
      <div className="row space-between">
        <h2>Long-term goals</h2>
        <button className="primary" onClick={() => setView({ kind: 'new' })}>
          + New goal
        </button>
      </div>

      {data.longTermGoals.length === 0 && (
        <p className="muted">No goals yet. Add one and the app will break it into short-term goals and tasks.</p>
      )}

      <ul className="goal-list">
        {data.longTermGoals.map((g) => {
          const stgs = data.shortTermGoals.filter((s) => s.longTermGoalId === g.id)
          const tasks = data.tasks.filter((t) => stgs.some((s) => s.id === t.shortTermGoalId))
          const next = tasks
            .filter((t) => t.status !== 'done')
            .sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'))[0]
          return (
            <li key={g.id}>
              <button className="goal-card" onClick={() => setView({ kind: 'goal', id: g.id })}>
                <div className="row space-between">
                  <strong>{g.title}</strong>
                  {g.targetDate && <span className="muted">by {formatDate(g.targetDate)}</span>}
                </div>
                <ProgressBar value={A.progress(tasks)} />
                <span className="muted">
                  {next ? `Next: ${next.title}${next.dueDate ? ` (due ${formatDate(next.dueDate)})` : ''}` : 'All tasks done 🎉'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
