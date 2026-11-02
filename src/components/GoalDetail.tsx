import { useState } from 'react'
import { formatDate } from '../breakdown/dates'
import * as A from '../data/actions'
import type { AppData, Id } from '../data/types'
import { ProgressBar } from './ProgressBar'

interface Props {
  data: AppData
  goalId: Id
  setData: (fn: (d: AppData) => AppData) => void
  onBack: () => void
}

export function GoalDetail({ data, goalId, setData, onBack }: Props) {
  const goal = data.longTermGoals.find((g) => g.id === goalId)
  const [newStg, setNewStg] = useState('')
  if (!goal) return null

  const stgs = data.shortTermGoals.filter((s) => s.longTermGoalId === goal.id)
  const allTasks = data.tasks.filter((t) => stgs.some((s) => s.id === t.shortTermGoalId))

  return (
    <section>
      <button onClick={onBack}>← All goals</button>
      <input
        className="title-input"
        value={goal.title}
        onChange={(e) => setData((d) => A.updateLongTermGoal(d, goal.id, { title: e.target.value }))}
      />
      <p className="muted">
        {goal.description} {goal.targetDate && <>Finish by {formatDate(goal.targetDate)}.</>}
      </p>
      <ProgressBar value={A.progress(allTasks)} />

      {stgs.map((s) => {
        const tasks = data.tasks.filter((t) => t.shortTermGoalId === s.id)
        return <ShortTermGoalCard key={s.id} data={data} stgId={s.id} tasks={tasks} setData={setData} />
      })}

      <form
        className="row add-row"
        onSubmit={(e) => {
          e.preventDefault()
          if (!newStg.trim()) return
          setData((d) => A.addShortTermGoal(d, goal.id, newStg.trim()))
          setNewStg('')
        }}
      >
        <input value={newStg} onChange={(e) => setNewStg(e.target.value)} placeholder="Add a short-term goal" />
        <button type="submit">Add</button>
      </form>

      <div className="row danger-zone">
        <button
          className="danger"
          onClick={() => {
            if (confirm(`Delete “${goal.title}” and all its tasks?`)) {
              setData((d) => A.deleteLongTermGoal(d, goal.id))
              onBack()
            }
          }}
        >
          Delete goal
        </button>
      </div>
    </section>
  )
}

function ShortTermGoalCard({
  data,
  stgId,
  tasks,
  setData,
}: {
  data: AppData
  stgId: Id
  tasks: AppData['tasks']
  setData: Props['setData']
}) {
  const stg = data.shortTermGoals.find((s) => s.id === stgId)!
  const [newTask, setNewTask] = useState('')
  const status = A.statusFromTasks(tasks)

  return (
    <div className={`stg ${status === 'done' ? 'done' : ''}`}>
      <div className="stg-header">
        <input
          className="stg-title"
          value={stg.title}
          onChange={(e) => setData((d) => A.updateShortTermGoal(d, stg.id, { title: e.target.value }))}
        />
        <input
          type="date"
          value={stg.targetDate ?? ''}
          onChange={(e) => setData((d) => A.updateShortTermGoal(d, stg.id, { targetDate: e.target.value || undefined }))}
        />
        <button
          className="icon"
          title="Delete short-term goal"
          onClick={() => confirm(`Delete “${stg.title}”?`) && setData((d) => A.deleteShortTermGoal(d, stg.id))}
        >
          ✕
        </button>
      </div>
      <ProgressBar value={A.progress(tasks)} small />

      <ul className="tasks">
        {tasks.map((t) => (
          <li key={t.id} className={t.status === 'done' ? 'done' : ''}>
            <input
              type="checkbox"
              checked={t.status === 'done'}
              onChange={(e) => setData((d) => A.updateTask(d, t.id, { status: e.target.checked ? 'done' : 'not_started' }))}
            />
            <input
              className="task-title"
              value={t.title}
              onChange={(e) => setData((d) => A.updateTask(d, t.id, { title: e.target.value }))}
            />
            <label className="minutes" title="Time estimate in minutes">
              <input
                type="number"
                min="5"
                step="5"
                value={t.estimateMinutes}
                onChange={(e) => setData((d) => A.updateTask(d, t.id, { estimateMinutes: Math.max(5, Number(e.target.value) || 5) }))}
              />
              min
            </label>
            <input
              type="date"
              value={t.dueDate ?? ''}
              onChange={(e) => setData((d) => A.updateTask(d, t.id, { dueDate: e.target.value || undefined }))}
            />
            <button className="icon" title="Delete task" onClick={() => setData((d) => A.deleteTask(d, t.id))}>
              ✕
            </button>
          </li>
        ))}
      </ul>

      <form
        className="row add-row"
        onSubmit={(e) => {
          e.preventDefault()
          if (!newTask.trim()) return
          setData((d) => A.addTask(d, stg.id, newTask.trim(), 30, stg.targetDate))
          setNewTask('')
        }}
      >
        <input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add a task" />
        <button type="submit">Add</button>
      </form>
    </div>
  )
}
