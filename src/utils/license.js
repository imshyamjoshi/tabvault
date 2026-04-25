export async function validateGumroadKey(licenseKey) {
  try {
    const permalink = import.meta.env.VITE_GUMROAD_PRODUCT_PERMALINK
    const response = await chrome.runtime.sendMessage({
      type: 'VALIDATE_LICENSE',
      licenseKey,
      permalink,
    })
    return response
  } catch (e) {
    return { valid: false, message: 'Could not verify key. Check your connection.' }
  }
}
