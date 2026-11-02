import { formatDate, toISODate } from '../breakdown/dates'
import * as A from '../data/actions'
import { DEFAULT_FOCUS_MINUTES, focusTasksForToday } from '../data/focus'
import type { AppData } from '../data/types'

interface Props {
  data: AppData
  setData: (fn: (d: AppData) => AppData) => void
  openGoal: (id: string) => void
}

const hours = (min: number) => (min % 60 === 0 ? `${min / 60}h` : `${(min / 60).toFixed(1)}h`)

export function TodayView({ data, setData, openGoal }: Props) {
  const today = toISODate(new Date())
  const active = data.longTermGoals.filter((g) => !g.pausedAt)
  const paused = data.longTermGoals.filter((g) => g.pausedAt)

  return (
    <section>
      <h2>Today</h2>
      <p className="muted">
        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}. Focus tasks for each
        active goal. Pause a goal to take it off this list.
      </p>

      {data.longTermGoals.length === 0 && <p className="muted">Add a goal on the Goals tab to get started.</p>}

      {active.map((g) => {
        const tasks = focusTasksForToday(data, g.id)
        const budget = g.dailyFocusMinutes ?? DEFAULT_FOCUS_MINUTES
        const done = tasks.filter((t) => t.status === 'done').reduce((n, t) => n + t.estimateMinutes, 0)
        return (
          <div className="stg" key={g.id}>
            <div className="row space-between">
              <button className="link" onClick={() => openGoal(g.id)}>
                <strong>{g.title}</strong>
              </button>
              <span className="muted">
                {hours(done)} of {hours(budget)} done
              </span>
            </div>
            {tasks.length === 0 ? (
              <p className="muted">Nothing left to do on this goal. 🎉</p>
            ) : (
              <ul className="tasks today">
                {tasks.map((t) => (
                  <li key={t.id} className={t.status === 'done' ? 'done' : ''}>
                    <input type="checkbox" checked={t.status === 'done'} onChange={(e) => setData((d) => A.setTaskDone(d, t.id, e.target.checked))} />
                    <span className="task-title">{t.title}</span>
                    <span className="muted">
                      {t.estimateMinutes} min
                      {t.dueDate && t.status !== 'done' && (
                        <span className={t.dueDate < today ? 'warn' : ''}> · due {formatDate(t.dueDate)}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}

      {paused.length > 0 && (
        <>
          <h3 className="paused-heading">Paused</h3>
          {paused.map((g) => (
            <div className="row space-between paused-row" key={g.id}>
              <span>
                {g.title} <span className="muted">since {formatDate(g.pausedAt!.slice(0, 10))}</span>
              </span>
              <button className="primary" onClick={() => setData((d) => A.resumeGoal(d, g.id))}>
                Resume
              </button>
            </div>
          ))}
        </>
      )}
    </section>
  )
}
