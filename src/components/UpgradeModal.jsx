import React from 'react'
import { PRICING } from '../utils/pricing.js'

export default function UpgradeModal({ onClose }) {
  function handleUpgrade() {
    chrome.runtime.sendMessage({ type: 'OPEN_PAYMENT_PAGE' })
    onClose()
  }

  return (
    <div className="absolute inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-semibold text-base">Upgrade TabVault</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 px-4">
          <PlanCard
            name="Monthly"
            price={`$${PRICING.monthly.launch}/mo`}
            note={`$${PRICING.monthly.later}/mo later`}
            onClick={handleUpgrade}
          />
          <PlanCard
            name="Yearly"
            price={`$${PRICING.yearly.launch}/yr`}
            note={`$${PRICING.yearly.later}/yr later`}
            highlight
            onClick={handleUpgrade}
          />
          <PlanCard
            name="Lifetime"
            price={`$${PRICING.lifetime.launch}`}
            note={`$${PRICING.lifetime.later} later`}
            onClick={handleUpgrade}
          />
        </div>

        <div className="px-4 pt-3 pb-5">
          <p className="text-xs text-center text-zinc-400">
            Early bird pricing · All plans include unlimited sessions, folders, reminders, search & export
          </p>
        </div>
      </div>
    </div>
  )
}

function PlanCard({ name, price, note, highlight, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center py-3 px-2 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${
        highlight
          ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
      }`}
    >
      <span className="text-xs font-medium mb-1">{name}</span>
      <span className="text-sm font-bold">{price}</span>
      <span className={`text-[10px] mt-0.5 ${highlight ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400'}`}>{note}</span>
    </button>
  )
}
