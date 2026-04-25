chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get('installDate')
  if (!result.installDate) {
    await chrome.storage.local.set({ installDate: new Date().toISOString() })
  }
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
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

    const updated = sessions.map((s) =>
      s.id === session.id ? { ...s, reminder: null } : s
    )
    await chrome.storage.local.set({ sessions: updated })
  } catch (e) {
    console.error('TabVault alarm error:', e)
  }
})

chrome.notifications.onClicked.addListener(async (notificationId) => {
  try {
    const { sessions = [] } = await chrome.storage.local.get('sessions')
    const session = sessions.find((s) => s.id === notificationId)
    if (!session) return

    await chrome.windows.create({
      url: session.tabs.map((t) => t.url),
      focused: true,
    })

    await chrome.notifications.clear(notificationId)
  } catch (e) {
    console.error('TabVault notification click error:', e)
  }
})
