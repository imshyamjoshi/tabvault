import React, { useState } from 'react'

export default function FolderTabs({ folders, active, onSelect, isPaid, inTrial, onAddFolder, onUpgrade }) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const enabled = isPaid || inTrial
  const all = ['All', ...folders]

  function handleAdd() {
    if (!enabled) { onUpgrade(); return }
    setAdding(true)
  }

  async function handleConfirm() {
    if (newName.trim()) await onAddFolder(newName.trim())
    setNewName('')
    setAdding(false)
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
      {all.map((f) => (
        <button
          key={f}
          onClick={() => onSelect(f)}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            active === f
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          {f}
        </button>
      ))}

      {adding ? (
        <input
          autoFocus
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); if (e.key === 'Escape') setAdding(false) }}
          onBlur={handleConfirm}
          placeholder="Folder name"
          className="shrink-0 px-2 py-1 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800 outline-none w-24 border border-zinc-300 dark:border-zinc-600"
        />
      ) : (
        <button
          onClick={handleAdd}
          className="shrink-0 px-2 py-1 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          title="New folder"
        >
          +
        </button>
      )}
    </div>
  )
}
