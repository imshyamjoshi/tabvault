import React, { useState } from 'react'
import { formatDate } from '../utils/session.js'
import ReminderPicker from './ReminderPicker.jsx'

export default function SessionCard({ session, isPaid, inTrial, onRestore, onDelete, onUpdate, onUpgrade, locked }) {
  const [expanded, setExpanded] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState(session.name)
  const [showReminder, setShowReminder] = useState(false)

  const canRemind = isPaid || inTrial

  function handleExport() {
    const text = session.tabs.map((t) => t.url).join('\n')
    navigator.clipboard.writeText(text)
  }

  if (locked) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-3 opacity-50 cursor-not-allowed select-none">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400 line-through">{session.name}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{session.tabs.length} tabs · {formatDate(session.createdAt)}</p>
          </div>
          <button
            onClick={onUpgrade}
            className="text-xs px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer opacity-100"
          >
            Unlock
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          {renaming ? (
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { onUpdate(session.id, { name: newName }); setRenaming(false) }
                if (e.key === 'Escape') setRenaming(false)
              }}
              onBlur={() => { onUpdate(session.id, { name: newName }); setRenaming(false) }}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-medium bg-zinc-100 dark:bg-zinc-800 rounded px-1 outline-none w-full"
            />
          ) : (
            <p className="text-sm font-medium truncate">{session.name}</p>
          )}
          <p className="text-xs text-zinc-400 mt-0.5">
            {session.tabs.length} tabs · {formatDate(session.createdAt)}
            {session.reminder && <span className="ml-1 text-blue-500">· ⏰</span>}
          </p>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`ml-2 text-zinc-400 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Expanded tab list */}
      {expanded && (
        <div className="border-t border-zinc-100 dark:border-zinc-700/50">
          <div className="max-h-32 overflow-y-auto px-3 py-1">
            {session.tabs.map((tab, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                {tab.favIconUrl ? (
                  <img src={tab.favIconUrl} alt="" className="w-3.5 h-3.5 shrink-0 rounded-sm" onError={(e) => { e.target.style.display = 'none' }} />
                ) : <div className="w-3.5 h-3.5 shrink-0 rounded-sm bg-zinc-200 dark:bg-zinc-700" />}
                <button
                  onClick={() => chrome.tabs.create({ url: tab.url })}
                  className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 truncate text-left transition-colors"
                  title={tab.url}
                >
                  {tab.title || tab.url}
                </button>
              </div>
            ))}
          </div>

          {/* Action row */}
          <div className="flex items-center gap-1 px-3 py-2 border-t border-zinc-100 dark:border-zinc-700/50">
            <ActionBtn onClick={() => onRestore(session)} label="Restore" />
            <ActionBtn onClick={() => setRenaming(true)} label="Rename" />
            <ActionBtn
              onClick={() => canRemind ? setShowReminder(true) : onUpgrade()}
              label="Remind"
              pro={!canRemind}
            />
            <ActionBtn onClick={handleExport} label="Export" />
            {confirming ? (
              <>
                <ActionBtn onClick={() => onDelete(session.id)} label="Confirm" danger />
                <ActionBtn onClick={() => setConfirming(false)} label="Cancel" />
              </>
            ) : (
              <ActionBtn onClick={() => setConfirming(true)} label="Delete" danger />
            )}
          </div>
        </div>
      )}

      {showReminder && (
        <ReminderPicker
          sessionId={session.id}
          current={session.reminder}
          onSet={(id, val) => onUpdate(id, { reminder: val })}
          onClose={() => setShowReminder(false)}
        />
      )}
    </div>
  )
}

function ActionBtn({ onClick, label, danger, pro }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-0.5 text-xs px-2 py-1 rounded-md transition-colors ${
        danger
          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
          : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
      }`}
    >
      {label}
      {pro && <span className="ml-0.5 text-[10px] bg-zinc-200 dark:bg-zinc-700 text-zinc-500 px-1 rounded">Pro</span>}
    </button>
  )
}
