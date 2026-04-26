import React, { useRef, useState } from 'react'

export default function ImportExport({ sessions, onImport, onClose }) {
  const fileRef = useRef(null)
  const [status, setStatus] = useState(null)

  function handleExportAll() {
    const data = JSON.stringify(sessions, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tabvault-sessions-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        if (!Array.isArray(parsed)) throw new Error('Invalid format')
        onImport(parsed)
        setStatus({ ok: true, text: `Imported ${parsed.length} session${parsed.length !== 1 ? 's' : ''}` })
      } catch {
        setStatus({ ok: false, text: 'Invalid file — could not import.' })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="absolute inset-0 bg-black/40 dark:bg-black/60 flex items-end z-50" onClick={onClose}>
      <div
        className="w-full bg-white dark:bg-zinc-900 rounded-t-2xl p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm">Import / Export</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg leading-none">&times;</button>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleExportAll}
            className="w-full py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Export all sessions (.json)
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Import sessions from .json
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />
        </div>

        {status && (
          <p className={`text-xs text-center mt-3 ${status.ok ? 'text-green-500' : 'text-red-500'}`}>
            {status.text}
          </p>
        )}
      </div>
    </div>
  )
}
