import { useMemo, useState } from 'react'
import { addDays, formatDate, toISODate } from '../breakdown/dates'
import { planCustom, planSavings, planSkills, type GoalKind, type Plan } from '../breakdown/templates'

const kinds: { id: GoalKind; label: string; hint: string }[] = [
  { id: 'savings', label: 'Save money', hint: 'Splits the amount into monthly targets and transfers.' },
  { id: 'skills', label: 'Learn skills for a job', hint: 'Paste the skills from a job description; each becomes a study plan.' },
  { id: 'custom', label: 'Something else', hint: 'List the milestones; each gets starter tasks you can edit.' },
]

interface Props {
  onSave: (plan: Plan) => void
  onCancel: () => void
}

export function NewGoalForm({ onSave, onCancel }: Props) {
  const today = useMemo(() => new Date(), [])
  const minDate = toISODate(addDays(today, 1))

  const [kind, setKind] = useState<GoalKind>('savings')
  const [title, setTitle] = useState('')
  const [targetDate, setTargetDate] = useState(toISODate(addDays(today, 180)))
  const [targetAmount, setTargetAmount] = useState('5000')
  const [currentAmount, setCurrentAmount] = useState('0')
  const [listText, setListText] = useState('')
  const [hoursPerSkill, setHoursPerSkill] = useState('10')

  const validDate = targetDate >= minDate

  const plan: Plan | null = useMemo(() => {
    if (!validDate) return null
    if (kind === 'savings') {
      const target = Number(targetAmount)
      if (!(target > 0)) return null
      return planSavings({ title, targetAmount: target, currentAmount: Number(currentAmount) || 0, targetDate }, today)
    }
    if (!listText.trim()) return null
    if (kind === 'skills') {
      return planSkills({ title, skillsText: listText, targetDate, hoursPerSkill: Math.max(4, Number(hoursPerSkill) || 10) }, today)
    }
    return planCustom({ title, milestonesText: listText, targetDate }, today)
  }, [kind, title, targetDate, targetAmount, currentAmount, listText, hoursPerSkill, today, validDate])

  const taskCount = plan?.shortTermGoals.reduce((n, s) => n + s.tasks.length, 0) ?? 0
  const hours = plan ? Math.round(plan.shortTermGoals.flatMap((s) => s.tasks).reduce((n, t) => n + t.estimateMinutes, 0) / 60) : 0

  return (
    <section>
      <h2>New long-term goal</h2>

      <div className="kind-picker">
        {kinds.map((k) => (
          <button key={k.id} className={k.id === kind ? 'tab active' : 'tab'} onClick={() => setKind(k.id)}>
            {k.label}
          </button>
        ))}
      </div>
      <p className="muted">{kinds.find((k) => k.id === kind)!.hint}</p>

      <div className="form">
        <label>
          Goal name
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={kind === 'savings' ? 'Emergency fund' : kind === 'skills' ? 'Get ready for a data analyst job' : 'Run a half marathon'}
          />
        </label>

        <label>
          Finish by
          <input type="date" min={minDate} value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </label>

        {kind === 'savings' && (
          <>
            <label>
              Amount to save ($)
              <input type="number" min="1" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
            </label>
            <label>
              Already saved ($)
              <input type="number" min="0" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} />
            </label>
          </>
        )}

        {kind === 'skills' && (
          <>
            <label className="wide">
              Skills to learn, one per line (bullet points from a job description are fine)
              <textarea
                rows={6}
                value={listText}
                onChange={(e) => setListText(e.target.value)}
                placeholder={'SQL\nExcel pivot tables\nTableau dashboards\nPresenting findings to stakeholders'}
              />
            </label>
            <label>
              Study hours per skill
              <input type="number" min="4" value={hoursPerSkill} onChange={(e) => setHoursPerSkill(e.target.value)} />
            </label>
          </>
        )}

        {kind === 'custom' && (
          <label className="wide">
            Milestones, one per line
            <textarea
              rows={5}
              value={listText}
              onChange={(e) => setListText(e.target.value)}
              placeholder={'Run 5k without stopping\nRun 10k\nRun 15k\nRace day'}
            />
          </label>
        )}
      </div>

      {!validDate && <p className="warn">Pick a finish date after today.</p>}

      {plan && (
        <div className="preview">
          <h3>
            Preview: {plan.shortTermGoals.length} short-term goals, {taskCount} tasks, about {hours} hours
          </h3>
          {plan.description && <p className="muted">{plan.description}</p>}
          <ol>
            {plan.shortTermGoals.map((s, i) => (
              <li key={i}>
                <strong>{s.title}</strong> <span className="muted">by {formatDate(s.targetDate)}</span>
                <ul>
                  {s.tasks.map((t, k) => (
                    <li key={k}>
                      {t.title} <span className="muted">· {t.estimateMinutes} min · due {formatDate(t.dueDate)}</span>
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
