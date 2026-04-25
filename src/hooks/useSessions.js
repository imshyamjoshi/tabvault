import { useState, useEffect, useCallback } from 'react'
import { storageGet, storageSet } from '../utils/storage.js'
import { createSession } from '../utils/session.js'

export function useSessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    storageGet('sessions').then(({ sessions: saved = [] }) => {
      setSessions(saved)
      setLoading(false)
    })
  }, [])

  const persist = useCallback(async (updated) => {
    setSessions(updated)
    await storageSet({ sessions: updated })
  }, [])

  const saveSession = useCallback(async (name, folder = 'default') => {
    try {
      const tabs = await chrome.tabs.query({ currentWindow: true })
      const filtered = tabs.filter(
        (t) => t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://')
      )
      const session = createSession(name, filtered, folder)
      const { sessions: current = [] } = await storageGet('sessions')
      await persist([session, ...current])
    } catch (e) {
      console.error('saveSession error:', e)
    }
  }, [persist])

  const deleteSession = useCallback(async (id) => {
    const { sessions: current = [] } = await storageGet('sessions')
    await persist(current.filter((s) => s.id !== id))
  }, [persist])

  const restoreSession = useCallback(async (session) => {
    try {
      await chrome.windows.create({ url: session.tabs.map((t) => t.url), focused: true })
    } catch (e) {
      console.error('restoreSession error:', e)
    }
  }, [])

  const updateSession = useCallback(async (id, patch) => {
    const { sessions: current = [] } = await storageGet('sessions')
    const updated = current.map((s) => (s.id === id ? { ...s, ...patch } : s))
    await persist(updated)
    if (patch.reminder) {
      try {
        await chrome.alarms.create(id, { when: new Date(patch.reminder).getTime() })
      } catch (e) {
        console.error('alarm create error:', e)
      }
    }
  }, [persist])

  return { sessions, loading, saveSession, deleteSession, restoreSession, updateSession }
}
