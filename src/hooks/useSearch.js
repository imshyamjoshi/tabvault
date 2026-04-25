import { useState, useMemo } from 'react'

export function useSearch(sessions, activeFolder) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let result = sessions
    if (activeFolder && activeFolder !== 'All') {
      result = result.filter((s) => s.folder === activeFolder)
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.tabs.some((t) => t.title?.toLowerCase().includes(q) || t.url?.toLowerCase().includes(q))
      )
    }
    return result
  }, [sessions, activeFolder, query])

  return { query, setQuery, filtered }
}
