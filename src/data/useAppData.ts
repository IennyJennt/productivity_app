import { useEffect, useState } from 'react'
import { fileGoals, mergeFileGoals } from './fileGoals'
import { loadData, saveData } from './storage'
import type { AppData } from './types'

/** App-wide data that is saved automatically whenever it changes. */
export function useAppData() {
  const [data, setData] = useState<AppData>(() => mergeFileGoals(loadData(), fileGoals))

  useEffect(() => {
    saveData(data)
  }, [data])

  return [data, setData] as const
}
