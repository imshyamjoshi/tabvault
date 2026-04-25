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

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'VALIDATE_LICENSE') {
    const { licenseKey, permalink } = message
    fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ product_permalink: permalink, license_key: licenseKey }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          chrome.storage.local.set({
            isPaid: true,
            paidSince: new Date().toISOString(),
            licenseKey,
          })
          sendResponse({ valid: true })
        } else {
          sendResponse({ valid: false, message: 'Invalid license key' })
        }
      })
      .catch(() => sendResponse({ valid: false, message: 'Could not verify key. Check your connection.' }))
    return true // keep message channel open for async response
  }

  if (message.type === 'RESTORE_PURCHASE') {
    chrome.storage.local.get('isPaid').then(({ isPaid }) => {
      sendResponse({ isPaid: !!isPaid })
    })
    return true
  }

  if (message.type === 'CHECK_PAYMENT') {
    // ExtensionPay will be wired here on Day 5 once API key is available.
    // Until then, fall back to local storage cache.
    chrome.storage.local.get('isPaid').then(({ isPaid }) => {
      sendResponse({ isPaid: !!isPaid })
    })
    return true
  }

  if (message.type === 'OPEN_PAYMENT_PAGE') {
    // ExtensionPay payment page — wired on Day 5
    sendResponse({})
    return true
  }
})
