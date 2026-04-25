import { useState, useEffect } from 'react'
import { storageGet, storageSet } from '../utils/storage.js'

export function usePaywall() {
  const [isPaid, setIsPaid] = useState(false)

  useEffect(() => {
    async function check() {
      try {
        const extpay = window.ExtensionPay?.(import.meta.env.VITE_EXTENSIONPAY_KEY)
        if (extpay) {
          const user = await extpay.getUser()
          setIsPaid(user.paid)
          await storageSet({ isPaid: user.paid })
          return
        }
      } catch (_) {}
      // fallback to local cache
      const { isPaid: cached = false } = await storageGet('isPaid')
      setIsPaid(cached)
    }
    check()
  }, [])

  return { isPaid }
}
