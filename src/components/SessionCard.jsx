import React, { useState } from 'react'
import { formatDate } from '../utils/session.js'
import ReminderPicker from './ReminderPicker.jsx'
import SwitchConfirm from './SwitchConfirm.jsx'

export default function SessionCard({ session, isPaid, inTrial, onRestore, onDelete, onUpdate, onSwitch, onUpgrade, locked }) {
  const [expanded, setExpanded] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState(session.name)
  const [editingNote, setEditingNote] = useState(false)
  const [noteVal, setNoteVal] = useState(session.note || '')
  const [showReminder, setShowReminder] = useState(false)
  const [showSwitch, setShowSwitch] = useState(false)
  const [currentTabCount, setCurrentTabCount] = useState(0)
  const [copied, setCopied] = useState(false)

  const canAct = isPaid || inTrial

  async function handleExport() {
    if (!canAct) { onUpgrade(); return }
    try {
      const text = session.tabs.map((t) => t.url).join('\n')
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Export error:', e)
    }
  }

  async function handleSwitchClick() {
    if (!canAct) { onUpgrade(); return }
    try {
      const tabs = await chrome.tabs.query({ currentWindow: true })
      setCurrentTabCount(tabs.filter((t) => t.url && !t.url.startsWith('chrome://')).length)
    } catch { setCurrentTabCount(0) }
    setShowSwitch(true)
  }

  if (locked) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-3 opacity-50 select-none">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-400 line-through truncate">{session.name}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{session.tabs.length} tabs · {formatDate(session.createdAt)}</p>
          </div>
          <button
            onClick={onUpgrade}
            className="ml-2 shrink-0 text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer opacity-100"
          >
            Unlock
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      {/* Header */}
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
                if (e.key === 'Escape') { setNewName(session.name); setRenaming(false) }
              }}
              onBlur={() => { onUpdate(session.id, { name: newName }); setRenaming(false) }}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-medium bg-zinc-100 dark:bg-zinc-800 rounded px-1.5 py-0.5 outline-none w-full"
            />
          ) : (
            <p className="text-sm font-medium truncate">{session.name}</p>
          )}
          <p className="text-xs text-zinc-400 mt-0.5">
            {session.tabs.length} tab{session.tabs.length !== 1 ? 's' : ''} · {formatDate(session.createdAt)}
            {session.reminder && <span className="ml-1">· ⏰</span>}
            {session.isAutoSave && <span className="ml-1 text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-1 rounded">auto</span>}
          </p>
          {session.note && !expanded && (
            <p className="text-xs text-zinc-400 truncate mt-0.5 italic">"{session.note}"</p>
          )}
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`ml-2 text-zinc-400 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-zinc-100 dark:border-zinc-700/50">
          {/* Note */}
          {canAct && (
            <div className="px-3 pt-2">
              {editingNote ? (
                <input
                  autoFocus
                  type="text"
                  value={noteVal}
                  onChange={(e) => setNoteVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape') {
                      onUpdate(session.id, { note: noteVal })
                      setEditingNote(false)
                    }
                  }}
                  onBlur={() => { onUpdate(session.id, { note: noteVal }); setEditingNote(false) }}
                  placeholder="Add a note…"
                  className="w-full text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 outline-none"
                />
              ) : (
                <button
                  onClick={() => setEditingNote(true)}
                  className="w-full text-left text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 italic truncate"
                >
                  {session.note ? `"${session.note}"` : 'Add a note…'}
                </button>
              )}
            </div>
          )}

          {/* Tab list */}
          <div className="max-h-28 overflow-y-auto no-scrollbar px-3 py-1.5">
            {session.tabs.map((tab, i) => (
              <div key={i} className="flex items-center gap-2 py-0.5">
                {tab.favIconUrl
                  ? <img src={tab.favIconUrl} alt="" className="w-3.5 h-3.5 shrink-0 rounded-sm" onError={(e) => { e.target.style.display = 'none' }} />
                  : <div className="w-3.5 h-3.5 shrink-0 rounded-sm bg-zinc-200 dark:bg-zinc-700" />
                }
                <button
                  onClick={() => { try { chrome.tabs.create({ url: tab.url }) } catch (e) { console.error(e) } }}
                  className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 truncate text-left transition-colors"
                  title={tab.url}
                >
                  {tab.title || tab.url}
                </button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center flex-wrap gap-1 px-3 py-2 border-t border-zinc-100 dark:border-zinc-700/50">
            <ActionBtn onClick={() => onRestore(session)} label="Restore" />
            <ActionBtn onClick={handleSwitchClick} label="Switch to" pro={!canAct} />
            <ActionBtn onClick={() => { setRenaming(true); setExpanded(true) }} label="Rename" />
            <ActionBtn
              onClick={() => canAct ? setShowReminder(true) : onUpgrade()}
              label="Remind"
              pro={!canAct}
            />
            <ActionBtn
              onClick={handleExport}
              label={copied ? 'Copied!' : 'Export'}
              pro={!canAct}
            />
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

      {showSwitch && (
        <SwitchConfirm
          session={session}
          currentTabCount={currentTabCount}
          onConfirm={() => { setShowSwitch(false); onSwitch(session) }}
          onCancel={() => setShowSwitch(false)}
        />
      )}
    </div>
  )
}

function ActionBtn({ onClick, label, danger, pro }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-0.5 text-xs px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
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
