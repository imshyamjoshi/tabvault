import { useState, useEffect } from 'react'
import { storageGet, storageSet } from '../utils/storage.js'

export function usePaywall() {
  const [isPaid, setIsPaid] = useState(false)

  useEffect(() => {
    async function check() {
      try {
        // Ask background to check ExtensionPay status
        const response = await chrome.runtime.sendMessage({ type: 'CHECK_PAYMENT' })
        if (response?.isPaid !== undefined) {
          setIsPaid(response.isPaid)
          await storageSet({ isPaid: response.isPaid })
          return
        }
      } catch (_) {}
      // Fallback to local cache if background doesn't respond
      const { isPaid: cached = false } = await storageGet('isPaid')
      setIsPaid(cached)
    }
    check()
  }, [])

  return { isPaid }
}
