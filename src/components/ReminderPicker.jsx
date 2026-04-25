import React, { useState } from 'react'

export default function ReminderPicker({ sessionId, current, onSet, onClose }) {
  const [value, setValue] = useState(current ? current.slice(0, 16) : '')

  function handleSave() {
    if (!value) return
    onSet(sessionId, new Date(value).toISOString())
    onClose()
  }

  return (
    <div className="absolute inset-0 bg-black/40 dark:bg-black/60 flex items-end z-50" onClick={onClose}>
      <div
        className="w-full bg-white dark:bg-zinc-900 rounded-t-2xl p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-semibold text-sm mb-4">Set Reminder</h2>
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-600 mb-5"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            Cancel
          </button>
          {current && (
            <button
              onClick={() => { onSet(sessionId, null); onClose() }}
              className="flex-1 py-2 rounded-lg text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
            >
              Remove
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!value}
            className="flex-1 py-2 rounded-lg text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:opacity-90 disabled:opacity-40 transition-all"
          >
            Set
          </button>
        </div>
      </div>
    </div>
  )
}
