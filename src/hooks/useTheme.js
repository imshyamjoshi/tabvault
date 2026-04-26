import { useState, useEffect, useCallback } from 'react'
import { storageGet, storageSet } from '../utils/storage.js'

export function useTheme() {
  const [theme, setThemeState] = useState('system')

  useEffect(() => {
    storageGet('theme').then(({ theme: saved }) => {
      const resolved = saved || 'system'
      setThemeState(resolved)
      applyTheme(resolved)
    })
  }, [])

  const setTheme = useCallback(async (value) => {
    setThemeState(value)
    await storageSet({ theme: value })
    applyTheme(value)
  }, [])

  return { theme, setTheme }
}

function applyTheme(value) {
  const root = document.documentElement
  if (value === 'dark') {
    root.classList.add('dark')
  } else if (value === 'light') {
    root.classList.remove('dark')
  } else {
    // system
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }
}
