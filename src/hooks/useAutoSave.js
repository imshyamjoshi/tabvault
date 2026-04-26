import { useState, useEffect, useCallback } from 'react'
import { storageGet, storageSet } from '../utils/storage.js'

const DEFAULT_PREFS = {
  interval: 'off',   // '15min' | '30min' | '1hr' | '4hrs' | 'off'
  midnight: true,
  onClose: true,
}

export function useAutoSave() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS)

  useEffect(() => {
    storageGet('autoSave').then(({ autoSave }) => {
      if (autoSave) setPrefs({ ...DEFAULT_PREFS, ...autoSave })
    })
  }, [])

  const updatePrefs = useCallback(async (patch) => {
    const updated = { ...prefs, ...patch }
    setPrefs(updated)
    await storageSet({ autoSave: updated })
    // Tell the background worker to reconfigure alarms
    try {
      await chrome.runtime.sendMessage({ type: 'UPDATE_AUTOSAVE', prefs: updated })
    } catch (e) {
      // background may be inactive
    }
  }, [prefs])

  return { prefs, updatePrefs }
}
