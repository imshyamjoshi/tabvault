import React from 'react'
import SessionCard from './SessionCard.jsx'

const FREE_LIMIT = 3

export default function SessionList({ sessions, loading, isPaid, inTrial, onRestore, onDelete, onUpdate, onUpgrade }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-10">
        <p className="text-sm text-zinc-400">No sessions yet</p>
        <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-1">Save your first session →</p>
      </div>
    )
  }

  const canUnlock = isPaid || inTrial

  return (
    <div className="flex flex-col gap-2">
      {sessions.map((session, index) => {
        const locked = !canUnlock && index >= FREE_LIMIT
        return (
          <SessionCard
            key={session.id}
            session={session}
            locked={locked}
            isPaid={isPaid}
            inTrial={inTrial}
            onRestore={onRestore}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onUpgrade={onUpgrade}
          />
        )
      })}
    </div>
  )
}
