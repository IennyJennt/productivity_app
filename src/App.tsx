import { useRef, useState } from 'react'
import { useAppData } from './data/useAppData'
import { exportData, importData } from './data/storage'
import { GoalsView } from './components/GoalsView'
import { TodayView } from './components/TodayView'

type Tab = 'today' | 'goals' | 'schedule' | 'settings'

const tabs: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'goals', label: 'Goals' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'settings', label: 'Settings' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [data, setData] = useAppData()
  // Bumped to open a specific goal on the Goals tab from Today.
  const [openGoalId, setOpenGoalId] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Goal Planner</h1>
        <nav>
          {tabs.map((t) => (
            <button
              key={t.id}
              className={t.id === tab ? 'tab active' : 'tab'}
              onClick={() => {
                setOpenGoalId(null)
                setTab(t.id)
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {tab === 'today' && (
          <TodayView
            data={data}
            setData={setData}
            openGoal={(id) => {
              setOpenGoalId(id)
              setTab('goals')
            }}
          />
        )}
        {tab === 'goals' && <GoalsView key={openGoalId ?? 'list'} data={data} setData={setData} initialGoalId={openGoalId} />}

        {tab === 'schedule' && (
          <section>
            <h2>Schedule</h2>
            <p className="muted">
              The weekly planner and Google Calendar sync come in step 3.
            </p>
          </section>
        )}

        {tab === 'settings' && (
          <section>
            <h2>Settings</h2>
            <p>Your data is saved in this browser. Back it up to a file now and then.</p>
            <div className="row">
              <button onClick={() => exportData(data)}>Export backup</button>
              <button onClick={() => fileInput.current?.click()}>Import backup</button>
              <input
                ref={fileInput}
                type="file"
                accept="application/json"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    setData(await importData(file))
                    alert('Backup imported.')
                  } catch (err) {
                    alert((err as Error).message)
                  }
                  e.target.value = ''
                }}
              />
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
