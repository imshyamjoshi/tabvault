import React from 'react'

export default function SwitchConfirm({ session, currentTabCount, onConfirm, onCancel }) {
  return (
    <div className="absolute inset-0 bg-black/40 dark:bg-black/60 flex items-end z-50" onClick={onCancel}>
      <div
        className="w-full bg-white dark:bg-zinc-900 rounded-t-2xl p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-semibold text-sm mb-2">Switch Session</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          This will close your {currentTabCount} current tab{currentTabCount !== 1 ? 's' : ''} and open
          &nbsp;<span className="font-medium text-zinc-900 dark:text-zinc-100">{session.name}</span>&nbsp;
          ({session.tabs.length} tabs). Your current tabs will be saved as a snapshot.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:opacity-90 transition-all"
          >
            Switch
          </button>
        </div>
      </div>
    </div>
  )
}
