import React from 'react'

export default function SearchBar({ query, onChange, isPaid, inTrial, onUpgrade }) {
  const enabled = isPaid || inTrial

  if (!enabled) {
    return (
      <button
        onClick={onUpgrade}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-sm cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      >
        <SearchIcon />
        <span className="flex-1 text-left">Search sessions...</span>
        <span className="text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-500 px-1.5 py-0.5 rounded">Pro</span>
      </button>
    )
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
        <SearchIcon />
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search sessions..."
        className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-600 transition"
      />
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
