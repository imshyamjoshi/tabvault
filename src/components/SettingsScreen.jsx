import React, { useState } from 'react'

export default function SettingsScreen({ isPaid, inTrial, daysRemaining, onBack, onUpgrade }) {
  const [notice, setNotice] = useState(null) // { text, ok }

  function showNotice(text, ok = true) {
    setNotice({ text, ok })
    setTimeout(() => setNotice(null), 3000)
  }

  function handleManageSub() {
    chrome.runtime.sendMessage({ type: 'OPEN_PAYMENT_PAGE' })
  }

  async function handleRestorePurchase() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'RESTORE_PURCHASE' })
      if (response?.isPaid) {
        await chrome.storage.local.set({ isPaid: true })
        showNotice('Purchase restored! Restart the popup to apply.', true)
      } else {
        showNotice('No active subscription found.', false)
      }
    } catch (e) {
      showNotice('Could not restore purchase. Check your connection.', false)
    }
  }

  const statusLabel = isPaid
    ? 'Pro — all features unlocked'
    : inTrial
    ? `Free Trial — ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`
    : 'Free — limited to 3 sessions'

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-zinc-200 dark:border-zinc-700">
        <button onClick={onBack} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="font-semibold text-sm">Settings</span>
      </div>

      <div className="flex flex-col gap-1 px-4 pt-4">
        <Row label="Account status" value={statusLabel} />
        <Row label="Version" value="1.0.0" />
      </div>

      <div className="flex flex-col gap-2 px-4 mt-4">
        {!isPaid && (
          <button
            onClick={onUpgrade}
            className="w-full py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 transition-all"
          >
            Upgrade to Pro
          </button>
        )}
        {isPaid && (
          <button
            onClick={handleManageSub}
            className="w-full py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Manage Subscription
          </button>
        )}
        <button
          onClick={handleRestorePurchase}
          className="w-full py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Restore Purchase
        </button>

        {notice && (
          <p className={`text-xs text-center mt-1 ${notice.ok ? 'text-green-500' : 'text-red-500'}`}>
            {notice.text}
          </p>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-zinc-100 dark:border-zinc-800">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-sm text-zinc-900 dark:text-zinc-100">{value}</span>
    </div>
  )
}
