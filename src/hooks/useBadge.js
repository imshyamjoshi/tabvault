import { useEffect } from 'react'

export function useBadge(sessions) {
  useEffect(() => {
    const count = sessions.filter((s) => !s.isAutoSave).length
    try {
      const text = count > 0 ? String(count) : ''
      chrome.action.setBadgeText({ text })
      chrome.action.setBadgeBackgroundColor({ color: '#18181b' })
    } catch (e) {
      // badge API not available in all contexts
    }
  }, [sessions])
}
