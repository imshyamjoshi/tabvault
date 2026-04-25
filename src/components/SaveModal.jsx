import React, { useState, useEffect } from 'react'

export default function SaveModal({ folders, isPaid, inTrial, onSave, onClose }) {
  const [name, setName] = useState('')
  const [folder, setFolder] = useState('default')
  const [tabCount, setTabCount] = useState(0)

  useEffect(() => {
    const defaultName = `Session — ${new Date().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    setName(defaultName)
    chrome.tabs.query({ currentWindow: true })
      .then((tabs) => setTabCount(tabs.filter((t) => t.url && !t.url.startsWith('chrome://')).length))
      .catch((e) => console.error('tabs.query error:', e))
  }, [])

  const canPickFolder = isPaid || inTrial

  return (
    <div className="absolute inset-0 bg-black/40 dark:bg-black/60 flex items-end z-50" onClick={onClose}>
      <div
        className="w-full bg-white dark:bg-zinc-900 rounded-t-2xl p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-semibold text-sm mb-4">Save Session <span className="text-zinc-400 font-normal">({tabCount} tabs)</span></h2>

        <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Name</label>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-600 mb-4"
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
            onClick={() => onSave(name, canPickFolder ? folder : 'default')}
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
