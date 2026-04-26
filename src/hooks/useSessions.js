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

  const saveSession = useCallback(async (name, folder = 'default', note = '', isAutoSave = false) => {
    try {
      const tabs = await chrome.tabs.query({ currentWindow: true })
      const filtered = tabs.filter(
        (t) => t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://')
      )
      const session = createSession(name, filtered, folder, note, isAutoSave)
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

  const switchSession = useCallback(async (session) => {
    try {
      // Auto-save current tabs as a pre-switch snapshot
      const currentTabs = await chrome.tabs.query({ currentWindow: true })
      const filtered = currentTabs.filter(
        (t) => t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://')
      )
      if (filtered.length > 0) {
        const snapshot = createSession(
          `Pre-switch — ${new Date().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
          filtered, 'default', '', true
        )
        const { sessions: current = [] } = await storageGet('sessions')
        await persist([snapshot, ...current])
      }
      // Close current tabs and open session
      const tabIds = currentTabs.map((t) => t.id).filter(Boolean)
      await chrome.windows.create({ url: session.tabs.map((t) => t.url), focused: true })
      if (tabIds.length > 0) {
        await chrome.tabs.remove(tabIds)
      }
    } catch (e) {
      console.error('switchSession error:', e)
    }
  }, [persist])

  return { sessions, loading, saveSession, deleteSession, restoreSession, updateSession, switchSession }
}
