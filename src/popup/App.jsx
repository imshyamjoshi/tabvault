import React, { useState } from 'react'
import SessionList from '../components/SessionList.jsx'
import SettingsScreen from '../components/SettingsScreen.jsx'
import UpgradeModal from '../components/UpgradeModal.jsx'
import TrialBanner from '../components/TrialBanner.jsx'
import SaveModal from '../components/SaveModal.jsx'
import SearchBar from '../components/SearchBar.jsx'
import FolderTabs from '../components/FolderTabs.jsx'
import { useSessions } from '../hooks/useSessions.js'
import { useTrial } from '../hooks/useTrial.js'
import { usePaywall } from '../hooks/usePaywall.js'
import { useFolders } from '../hooks/useFolders.js'
import { useSearch } from '../hooks/useSearch.js'

export default function App() {
  const [screen, setScreen] = useState('main') // 'main' | 'settings'
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [activeFolder, setActiveFolder] = useState('All')

  const { sessions, saveSession, deleteSession, restoreSession, updateSession, loading } = useSessions()
  const { inTrial, daysRemaining, trialExpired } = useTrial()
  const { isPaid } = usePaywall()
  const { folders, addFolder } = useFolders()
  const { query, setQuery, filtered } = useSearch(sessions, activeFolder)

  const canSave = isPaid || inTrial || sessions.length < 3

  function handleSaveClick() {
    if (!canSave) {
      setShowUpgrade(true)
      return
    }
    setShowSaveModal(true)
  }

  if (screen === 'settings') {
    return (
      <SettingsScreen
        isPaid={isPaid}
        inTrial={inTrial}
        daysRemaining={daysRemaining}
        onBack={() => setScreen('main')}
        onUpgrade={() => setShowUpgrade(true)}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-zinc-200 dark:border-zinc-700">
        <span className="font-semibold text-base tracking-tight">TabVault</span>
        <button
          onClick={() => setScreen('settings')}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          title="Settings"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Trial banner */}
      <TrialBanner
        inTrial={inTrial}
        daysRemaining={daysRemaining}
        trialExpired={trialExpired}
        isPaid={isPaid}
        onUpgrade={() => setShowUpgrade(true)}
      />

      {/* Search */}
      <div className="px-4 pt-3">
        <SearchBar
          query={query}
          onChange={setQuery}
          isPaid={isPaid}
          inTrial={inTrial}
          onUpgrade={() => setShowUpgrade(true)}
        />
      </div>

      {/* Folder tabs */}
      <div className="px-4 pt-2">
        <FolderTabs
          folders={folders}
          active={activeFolder}
          onSelect={setActiveFolder}
          isPaid={isPaid}
          inTrial={inTrial}
          onAddFolder={addFolder}
          onUpgrade={() => setShowUpgrade(true)}
        />
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <SessionList
          sessions={filtered}
          loading={loading}
          isPaid={isPaid}
          inTrial={inTrial}
          onRestore={restoreSession}
          onDelete={deleteSession}
          onUpdate={updateSession}
          onUpgrade={() => setShowUpgrade(true)}
        />
      </div>

      {/* Save button */}
      <div className="px-4 pb-4 pt-2 border-t border-zinc-200 dark:border-zinc-700">
        <button
          onClick={handleSaveClick}
          className="w-full py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-sm hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Save All Tabs
        </button>
      </div>

      {/* Modals */}
      {showSaveModal && (
        <SaveModal
          folders={folders}
          isPaid={isPaid}
          inTrial={inTrial}
          onSave={async (name, folder) => {
            await saveSession(name, folder)
            setShowSaveModal(false)
          }}
          onClose={() => setShowSaveModal(false)}
        />
      )}

      {showUpgrade && (
        <UpgradeModal onClose={() => setShowUpgrade(false)} />
      )}
    </div>
  )
}
