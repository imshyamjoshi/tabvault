import React, { useState, useEffect } from 'react'
import { generateSmartName } from '../utils/smartName.js'

export default function SaveModal({ folders, isPaid, inTrial, sessions, onSave, onClose }) {
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [folder, setFolder] = useState('default')
  const [tabCount, setTabCount] = useState(0)
  const [duplicates, setDuplicates] = useState([])

  useEffect(() => {
    chrome.tabs.query({ currentWindow: true })
      .then((tabs) => {
        const valid = tabs.filter((t) => t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://'))
        setTabCount(valid.length)
        setName(generateSmartName(valid))

        // Duplicate detection
        const existingUrls = new Map()
        sessions.forEach((s) => s.tabs.forEach((t) => {
          if (t.url && !existingUrls.has(t.url)) existingUrls.set(t.url, s.name)
        }))
        const dupes = []
        const seen = new Set()
        valid.forEach((t) => {
          if (t.url && existingUrls.has(t.url) && !seen.has(t.url)) {
            seen.add(t.url)
            dupes.push(existingUrls.get(t.url))
          }
        })
        // Unique session names
        const uniqueSessions = [...new Set(dupes)]
        setDuplicates(uniqueSessions)
      })
      .catch((e) => console.error('tabs.query error:', e))
  }, [sessions])

  const canPickFolder = isPaid || inTrial

  return (
    <div className="absolute inset-0 bg-black/40 dark:bg-black/60 flex items-end z-50" onClick={onClose}>
      <div
        className="w-full bg-white dark:bg-zinc-900 rounded-t-2xl p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-semibold text-sm mb-4">
          Save Session <span className="text-zinc-400 font-normal">({tabCount} tabs)</span>
        </h2>

        {duplicates.length > 0 && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {duplicates.length === 1
                ? `Some tabs already saved in "${duplicates[0]}"`
                : `Some tabs already saved in ${duplicates.length} other sessions`}
            </p>
          </div>
        )}

        <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Name</label>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-600 mb-3"
        />

        <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
          Note <span className="text-zinc-400">(optional)</span>
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Come back after standup"
          className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-600 mb-3"
        />

        <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
          Folder {!canPickFolder && <span className="ml-1 text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-500 px-1 rounded">Pro</span>}
        </label>
        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          disabled={!canPickFolder}
          className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm outline-none disabled:opacity-50 mb-5"
        >
          <option value="default">No folder</option>
          {folders.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(name, canPickFolder ? folder : 'default', note)}
            disabled={!name.trim()}
            className="flex-1 py-2 rounded-lg text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:opacity-90 disabled:opacity-40 transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
