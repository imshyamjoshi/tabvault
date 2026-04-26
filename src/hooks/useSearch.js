import { useState, useMemo } from 'react'

export function useSearch(sessions, activeFolder) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let result = sessions
    if (activeFolder === 'Auto-saves') {
      result = result.filter((s) => s.isAutoSave)
    } else if (activeFolder && activeFolder !== 'All') {
      result = result.filter((s) => !s.isAutoSave && s.folder === activeFolder)
    } else if (activeFolder === 'All') {
      result = result.filter((s) => !s.isAutoSave)
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.note?.toLowerCase().includes(q) ||
          s.tabs.some((t) => t.title?.toLowerCase().includes(q) || t.url?.toLowerCase().includes(q))
      )
    }
    return result
  }, [sessions, activeFolder, query])

  return { query, setQuery, filtered }
}
