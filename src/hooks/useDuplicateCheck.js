import { useCallback } from 'react'

export function useDuplicateCheck(sessions) {
  const check = useCallback((tabs) => {
    const urlSet = new Map() // url → session name
    sessions.forEach((s) => {
      s.tabs.forEach((t) => {
        if (t.url && !urlSet.has(t.url)) urlSet.set(t.url, s.name)
      })
    })

    const duplicates = []
    const seen = new Set()
    tabs.forEach((t) => {
      if (t.url && urlSet.has(t.url) && !seen.has(t.url)) {
        seen.add(t.url)
        duplicates.push({ url: t.url, sessionName: urlSet.get(t.url) })
      }
    })
    return duplicates
  }, [sessions])

  return { check }
}
