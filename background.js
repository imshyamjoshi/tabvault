importScripts('ExtPay.js')

const extpay = ExtPay('tabvaultwithai')
extpay.startBackground()

// ── Install / startup ──────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get('installDate')
  if (!result.installDate) {
    await chrome.storage.local.set({ installDate: new Date().toISOString() })
  }
  await setupAutoSaveAlarms()
})

chrome.runtime.onStartup.addListener(async () => {
  await setupAutoSaveAlarms()
})

// ── Auto-save helpers ──────────────────────────────────────────────────────────

async function getAutoSavePrefs() {
  const { autoSave } = await chrome.storage.local.get('autoSave')
  return autoSave || { interval: 'off', midnight: true, onClose: true }
}

const INTERVAL_MINUTES = { '15min': 15, '30min': 30, '1hr': 60, '4hrs': 240 }

async function setupAutoSaveAlarms() {
  await chrome.alarms.clear('autosave-interval')
  await chrome.alarms.clear('autosave-midnight')

  const prefs = await getAutoSavePrefs()

  const mins = INTERVAL_MINUTES[prefs.interval]
  if (mins) {
    await chrome.alarms.create('autosave-interval', { periodInMinutes: mins })
  }

  if (prefs.midnight) {
    const now = new Date()
    const next = new Date(now)
    next.setHours(24, 0, 0, 0)
    await chrome.alarms.create('autosave-midnight', {
      when: next.getTime(),
      periodInMinutes: 24 * 60,
    })
  }
}

async function autoSaveCurrentTabs(label) {
  try {
    const { isPaid } = await chrome.storage.local.get('isPaid')
    if (!isPaid) return

    const windows = await chrome.windows.getAll({ populate: true })
    for (const win of windows) {
      const tabs = (win.tabs || []).filter(
        (t) => t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://')
      )
      if (tabs.length === 0) continue

      const name = `${label} — ${new Date().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
      const session = {
        id: crypto.randomUUID(),
        name,
        folder: 'default',
        tabs: tabs.map(({ title, url, favIconUrl }) => ({ title, url: url || '', favIconUrl: favIconUrl || '' })),
        createdAt: new Date().toISOString(),
        reminder: null,
        note: '',
        isAutoSave: true,
        isTemplate: false,
      }

      const { sessions = [] } = await chrome.storage.local.get('sessions')
      const autoSaves = sessions.filter((s) => s.isAutoSave && s.name.startsWith(label.split('—')[0].trim()))

      // Keep last 5 interval saves or 7 midnight saves
      const keepCount = label.startsWith('Interval') ? 5 : 7
      const trimmed = autoSaves.slice(0, keepCount - 1)
      const others = sessions.filter((s) => !(s.isAutoSave && s.name.startsWith(label.split('—')[0].trim())))

      await chrome.storage.local.set({ sessions: [session, ...trimmed, ...others] })
    }
  } catch (e) {
    console.error('autoSave error:', e)
  }
}

// ── Alarms ─────────────────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'autosave-interval') {
    await autoSaveCurrentTabs('Interval auto-save')
    return
  }

  if (alarm.name === 'autosave-midnight') {
    await autoSaveCurrentTabs('Midnight snapshot')
    return
  }

  // Reminder alarm (session id as alarm name)
  try {
    const { sessions = [] } = await chrome.storage.local.get('sessions')
    const session = sessions.find((s) => s.id === alarm.name)
    if (!session) return

    await chrome.notifications.create(session.id, {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'TabVault Reminder',
      message: `Time to open your session: ${session.name}`,
    })

    const updated = sessions.map((s) => s.id === session.id ? { ...s, reminder: null } : s)
    await chrome.storage.local.set({ sessions: updated })
  } catch (e) {
    console.error('TabVault alarm error:', e)
  }
})

// ── Notification click ─────────────────────────────────────────────────────────

chrome.notifications.onClicked.addListener(async (notificationId) => {
  try {
    const { sessions = [] } = await chrome.storage.local.get('sessions')
    const session = sessions.find((s) => s.id === notificationId)
    if (!session) return
    await chrome.windows.create({ url: session.tabs.map((t) => t.url), focused: true })
    await chrome.notifications.clear(notificationId)
  } catch (e) {
    console.error('TabVault notification click error:', e)
  }
})

// ── Keyboard commands ──────────────────────────────────────────────────────────

chrome.commands.onCommand.addListener(async (command) => {
  const { isPaid, sessions = [] } = await chrome.storage.local.get(['isPaid', 'sessions'])
  if (!isPaid) return

  if (command === 'save-session') {
    try {
      const tabs = await chrome.tabs.query({ currentWindow: true })
      const filtered = tabs.filter(
        (t) => t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://')
      )
      if (filtered.length === 0) return
      const name = `Quick save — ${new Date().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
      const session = {
        id: crypto.randomUUID(),
        name,
        folder: 'default',
        tabs: filtered.map(({ title, url, favIconUrl }) => ({ title, url: url || '', favIconUrl: favIconUrl || '' })),
        createdAt: new Date().toISOString(),
        reminder: null,
        note: '',
        isAutoSave: false,
        isTemplate: false,
      }
      await chrome.storage.local.set({ sessions: [session, ...sessions] })
    } catch (e) {
      console.error('save-session command error:', e)
    }
  }

  if (command === 'restore-last') {
    try {
      const manual = sessions.filter((s) => !s.isAutoSave)
      if (manual.length === 0) return
      const latest = manual[0]
      await chrome.windows.create({ url: latest.tabs.map((t) => t.url), focused: true })
    } catch (e) {
      console.error('restore-last command error:', e)
    }
  }
})

// ── Best-effort save on suspend ────────────────────────────────────────────────

chrome.runtime.onSuspend.addListener(async () => {
  try {
    const prefs = await getAutoSavePrefs()
    if (!prefs.onClose) return
    await autoSaveCurrentTabs('On-close snapshot')
  } catch (e) {
    console.error('onSuspend save error:', e)
  }
})

// ── Message handler ────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'CHECK_PAYMENT') {
    extpay.getUser()
      .then((user) => {
        if (user.paid) chrome.storage.local.set({ isPaid: true })
        sendResponse({ isPaid: user.paid })
      })
      .catch(() => {
        chrome.storage.local.get('isPaid').then(({ isPaid }) => sendResponse({ isPaid: !!isPaid }))
      })
    return true
  }

  if (message.type === 'RESTORE_PURCHASE') {
    extpay.getUser()
      .then((user) => {
        if (user.paid) chrome.storage.local.set({ isPaid: true })
        sendResponse({ isPaid: user.paid })
      })
      .catch(() => {
        chrome.storage.local.get('isPaid').then(({ isPaid }) => sendResponse({ isPaid: !!isPaid }))
      })
    return true
  }

  if (message.type === 'OPEN_PAYMENT_PAGE') {
    extpay.openPaymentPage()
    sendResponse({})
    return true
  }

  if (message.type === 'UPDATE_AUTOSAVE') {
    chrome.storage.local.set({ autoSave: message.prefs }).then(() => {
      setupAutoSaveAlarms().then(() => sendResponse({ ok: true }))
    })
    return true
  }
})
