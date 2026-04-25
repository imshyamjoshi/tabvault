import { useState, useEffect, useCallback } from 'react'
import { storageGet, storageSet } from '../utils/storage.js'

export function useFolders() {
  const [folders, setFolders] = useState([])

  useEffect(() => {
    storageGet('folders').then(({ folders: saved = [] }) => setFolders(saved))
  }, [])

  const addFolder = useCallback(async (name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const { folders: current = [] } = await storageGet('folders')
    if (current.includes(trimmed)) return
    const updated = [...current, trimmed]
    setFolders(updated)
    await storageSet({ folders: updated })
  }, [])

  const removeFolder = useCallback(async (name) => {
    const { folders: current = [] } = await storageGet('folders')
    const updated = current.filter((f) => f !== name)
    setFolders(updated)
    await storageSet({ folders: updated })
  }, [])

  return { folders, addFolder, removeFolder }
}
