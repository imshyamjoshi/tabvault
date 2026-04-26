import React, { useState } from 'react'
import ImportExport from './ImportExport.jsx'

const INTERVALS = [
  { value: 'off', label: 'Off' },
  { value: '15min', label: '15 min' },
  { value: '30min', label: '30 min' },
  { value: '1hr', label: '1 hr' },
  { value: '4hrs', label: '4 hrs' },
]

export default function SettingsScreen({ isPaid, inTrial, daysRemaining, sessions, onBack, onUpgrade, onImport, autoSavePrefs, onAutoSavePref, theme, onTheme }) {
  const [notice, setNotice] = useState(null)
  const [showImportExport, setShowImportExport] = useState(false)

  const canPro = isPaid || inTrial

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
    } catch {
      showNotice('Could not restore purchase. Check your connection.', false)
    }
  }

  const statusLabel = isPaid
    ? 'Pro — all features unlocked'
    : inTrial
    ? `Free Trial — ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`
    : 'Free — limited to 3 sessions'

  return (
    <div className="flex flex-col h-full overflow-y-auto thin-scrollbar">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-zinc-200 dark:border-zinc-700">
        <button onClick={onBack} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="font-semibold text-sm">Settings</span>
      </div>

      {/* Account */}
      <Section title="Account">
        <Row label="Status" value={statusLabel} />
        <Row label="Version" value="2.0.0" />
        {!isPaid && (
          <button
            onClick={onUpgrade}
            className="w-full mt-2 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 transition-all"
          >
            Upgrade to Pro
          </button>
        )}
        {isPaid && (
          <button
            onClick={handleManageSub}
            className="w-full mt-2 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Manage Subscription
          </button>
        )}
        <button
          onClick={handleRestorePurchase}
          className="w-full mt-2 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Restore Purchase
        </button>
        {notice && (
          <p className={`text-xs text-center mt-1 ${notice.ok ? 'text-green-500' : 'text-red-500'}`}>
            {notice.text}
          </p>
        )}
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Theme</span>
          <div className="flex gap-1">
            {['system', 'light', 'dark'].map((t) => (
              <button
                key={t}
                onClick={() => onTheme(t)}
                className={`px-2.5 py-1 rounded-md text-xs capitalize transition-colors ${
                  theme === t
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Auto-save */}
      <Section title={<>Auto-save {!canPro && <ProBadge />}</>}>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Interval</span>
          <select
            value={canPro ? autoSavePrefs.interval : 'off'}
            onChange={(e) => canPro ? onAutoSavePref({ interval: e.target.value }) : onUpgrade()}
            disabled={!canPro}
            className="text-xs px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 outline-none disabled:opacity-50"
          >
            {INTERVALS.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
        </div>
        <Toggle
          label="Save at midnight"
          value={canPro ? autoSavePrefs.midnight : false}
          onChange={(v) => canPro ? onAutoSavePref({ midnight: v }) : onUpgrade()}
          disabled={!canPro}
        />
        <Toggle
          label="Save on browser close"
          value={canPro ? autoSavePrefs.onClose : false}
          onChange={(v) => canPro ? onAutoSavePref({ onClose: v }) : onUpgrade()}
          disabled={!canPro}
        />
      </Section>

      {/* Keyboard shortcuts */}
      <Section title="Keyboard Shortcuts">
        <Row label="Save session" value="Ctrl+Shift+S" />
        <Row label="Restore last session" value="Ctrl+Shift+R" />
        <p className="text-xs text-zinc-400 mt-1">
          Customise at <span className="font-mono">chrome://extensions/shortcuts</span>
        </p>
      </Section>

      {/* Data */}
      <Section title={<>Data {!canPro && <ProBadge />}</>}>
        <button
          onClick={() => canPro ? setShowImportExport(true) : onUpgrade()}
          className="w-full py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Import / Export sessions
        </button>
      </Section>

      {showImportExport && (
        <ImportExport
          sessions={sessions}
          onImport={(imported) => { onImport(imported); setShowImportExport(false) }}
          onClose={() => setShowImportExport(false)}
        />
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="px-4 mt-4">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">{title}</p>
      <div className="flex flex-col">{children}</div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-sm text-zinc-900 dark:text-zinc-100">{value}</span>
    </div>
  )
}

function Toggle({ label, value, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <button
        onClick={() => onChange(!value)}
        disabled={disabled}
        className={`w-10 h-5.5 rounded-full transition-colors relative disabled:opacity-50 ${value ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-700'}`}
        style={{ height: '22px', minWidth: '40px' }}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white dark:bg-zinc-900 shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  )
}

function ProBadge() {
  return <span className="text-[10px] bg-zinc-200 dark:bg-zinc-700 text-zinc-500 px-1 rounded font-normal">Pro</span>
}
