// Saves everything in the browser's localStorage, so the app needs no server
// or account. Export/import lets you back the data up to a file.

import { emptyData, type AppData } from './types'

const STORAGE_KEY = 'goal-planner:data'

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    const parsed = JSON.parse(raw) as Partial<AppData>
    return { ...emptyData(), ...parsed, version: 1 }
  } catch {
    return emptyData()
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function exportData(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `goal-planner-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importData(file: File): Promise<AppData> {
  const parsed = JSON.parse(await file.text()) as Partial<AppData>
  if (!Array.isArray(parsed.longTermGoals)) {
    throw new Error('This file does not look like a Goal Planner backup.')
  }
  return { ...emptyData(), ...parsed, version: 1 }
}

export const newId = (): string => crypto.randomUUID()
