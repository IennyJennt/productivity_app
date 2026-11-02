import { useMemo, useState } from 'react'
import { addDays, formatDate, toISODate } from '../breakdown/dates'
import { planGoal, type Plan } from '../breakdown/templates'

interface Props {
  onSave: (plan: Plan) => void
  onCancel: () => void
}

const placeholder = `Build a servo robot arm
  - Sketch the design and pick servos (1h)
  - Model the arm in CAD (3h)
  - Print and assemble (4h)
Launch a portfolio website
  - Pick a template (30m)
  - Write the About page`

export function NewGoalForm({ onSave, onCancel }: Props) {
  const today = useMemo(() => new Date(), [])
  const minDate = toISODate(addDays(today, 1))

  const [title, setTitle] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [outline, setOutline] = useState('')

  const validDate = !targetDate || targetDate >= minDate
  const plan: Plan | null = useMemo(() => {
    if (!title.trim() || !outline.trim() || !validDate) return null
    return planGoal({ title, outline, targetDate: targetDate || undefined }, today)
  }, [title, outline, targetDate, today, validDate])

  const taskCount = plan?.shortTermGoals.reduce((n, s) => n + s.tasks.length, 0) ?? 0
  const hours = plan ? Math.round(plan.shortTermGoals.flatMap((s) => s.tasks).reduce((n, t) => n + t.estimateMinutes, 0) / 60) : 0

  return (
    <section>
      <h2>New long-term goal</h2>

      <div className="form">
        <label>
          Goal
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Get hired as a robotics engineer" />
        </label>
        <label>
          Finish by (optional)
          <input type="date" min={minDate} value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </label>
        <label className="wide">
          Break it down: one short-term goal per line, with its tasks indented or bulleted underneath. Add a time like
          (30m) or (2h) to a task; the default is 1 hour.
          <textarea rows={9} value={outline} onChange={(e) => setOutline(e.target.value)} placeholder={placeholder} />
        </label>
      </div>

      {!validDate && <p className="warn">Pick a finish date after today, or leave it empty.</p>}

      {plan && (
        <div className="preview">
          <h3>
            Preview: {plan.shortTermGoals.length} short-term goals, {taskCount} tasks, about {hours} {hours === 1 ? 'hour' : 'hours'}
          </h3>
          <ol>
            {plan.shortTermGoals.map((s, i) => (
              <li key={i}>
                <strong>{s.title}</strong> {s.targetDate && <span className="muted">by {formatDate(s.targetDate)}</span>}
                <ul>
                  {s.tasks.map((t, k) => (
                    <li key={k}>
                      {t.title}{' '}
                      <span className="muted">
                        · {t.estimateMinutes} min{t.dueDate && ` · due ${formatDate(t.dueDate)}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <p className="muted">You can edit, add or remove any of these after saving.</p>
        </div>
      )}

      <div className="row">
        <button className="primary" disabled={!plan} onClick={() => plan && onSave(plan)}>
          Save goal
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </section>
  )
}
