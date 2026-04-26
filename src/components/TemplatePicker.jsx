import React from 'react'
import { DEFAULT_TEMPLATES } from '../utils/templates.js'

export default function TemplatePicker({ onSelect, onClose }) {
  return (
    <div className="absolute inset-0 bg-black/40 dark:bg-black/60 flex items-end z-50" onClick={onClose}>
      <div
        className="w-full bg-white dark:bg-zinc-900 rounded-t-2xl p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm">Start from Template</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg leading-none">&times;</button>
        </div>
        <div className="flex flex-col gap-2">
          {DEFAULT_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => onSelect(tpl)}
              className="text-left px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <p className="text-sm font-medium">{tpl.name}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{tpl.tabs.length} tabs · {tpl.note}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
