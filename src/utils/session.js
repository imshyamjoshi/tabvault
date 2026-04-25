import { v4 as uuidv4 } from 'uuid'

export function createSession(name, tabs, folder = 'default') {
  return {
    id: uuidv4(),
    name: name.trim(),
    folder,
    tabs: tabs.map(({ title, url, favIconUrl }) => ({ title, url, favIconUrl })),
    createdAt: new Date().toISOString(),
    reminder: null,
  }
}

export function isValidSession(s) {
  return (
    s &&
    typeof s.id === 'string' &&
    typeof s.name === 'string' &&
    Array.isArray(s.tabs) &&
    s.tabs.length > 0
  )
}

export function formatDate(isoString) {
  const d = new Date(isoString)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
