import { storageSet } from './storage.js'

export async function validateGumroadKey(licenseKey) {
  try {
    const permalink = import.meta.env.VITE_GUMROAD_PRODUCT_PERMALINK
    const res = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ product_permalink: permalink, license_key: licenseKey }),
    })
    const data = await res.json()
    if (data.success) {
      await storageSet({ isPaid: true, paidSince: new Date().toISOString(), licenseKey })
      return { valid: true }
    }
    return { valid: false, message: 'Invalid license key' }
  } catch (e) {
    return { valid: false, message: 'Could not verify key. Check your connection.' }
  }
}
