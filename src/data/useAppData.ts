import { useEffect, useState } from 'react'
import { loadData, saveData } from './storage'
import type { AppData } from './types'

/** App-wide data that is saved automatically whenever it changes. */
export function useAppData() {
  const [data, setData] = useState<AppData>(loadData)

  useEffect(() => {
    saveData(data)
  }, [data])

  return [data, setData] as const
}
