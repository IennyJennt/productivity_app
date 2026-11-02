import { useRef, useState } from 'react'
import { useAppData } from './data/useAppData'
import { exportData, importData } from './data/storage'
import { GoalsView } from './components/GoalsView'

type Tab = 'goals' | 'schedule' | 'settings'

const tabs: { id: Tab; label: string }[] = [
  { id: 'goals', label: 'Goals' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'settings', label: 'Settings' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('goals')
  const [data, setData] = useAppData()
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
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {tab === 'goals' && <GoalsView data={data} setData={setData} />}

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
