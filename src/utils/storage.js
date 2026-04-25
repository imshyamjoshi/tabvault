export async function storageGet(keys) {
  try {
    return await chrome.storage.local.get(keys)
  } catch (e) {
    console.error('storage.get error:', e)
    return {}
  }
}

export async function storageSet(data) {
  try {
    await chrome.storage.local.set(data)
  } catch (e) {
    console.error('storage.set error:', e)
  }
}
