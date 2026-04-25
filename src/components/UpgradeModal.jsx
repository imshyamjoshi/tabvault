import React, { useState } from 'react'
import { PRICING } from '../utils/pricing.js'
import { validateGumroadKey } from '../utils/license.js'

export default function UpgradeModal({ onClose }) {
  const [licenseKey, setLicenseKey] = useState('')
  const [keyStatus, setKeyStatus] = useState(null) // null | 'loading' | 'error' | 'success'
  const [keyError, setKeyError] = useState('')

  async function handleValidateKey() {
    if (!licenseKey.trim()) return
    setKeyStatus('loading')
    const result = await validateGumroadKey(licenseKey.trim())
    if (result.valid) {
      setKeyStatus('success')
      setTimeout(onClose, 1200)
    } else {
      setKeyStatus('error')
      setKeyError(result.message)
    }
  }

  function handleExtPay(plan) {
    const extpay = window.ExtensionPay?.(import.meta.env.VITE_EXTENSIONPAY_KEY)
    if (extpay) extpay.openPaymentPage()
  }

  return (
    <div className="absolute inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-semibold text-base">Upgrade TabVault</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 px-4">
          <PlanCard
            name="Monthly"
            priceINR={`₹${PRICING.INR.monthly}/mo`}
            priceUSD={`$${PRICING.USD.monthly}/mo`}
            onClick={() => handleExtPay('monthly')}
          />
          <PlanCard
            name="Yearly"
            priceINR={`₹${PRICING.INR.yearly}/yr`}
            priceUSD={`$${PRICING.USD.yearly}/yr`}
            highlight
            onClick={() => handleExtPay('yearly')}
          />
          <PlanCard
            name="Lifetime"
            priceINR={`₹${PRICING.INR.lifetime}`}
            priceUSD={`$${PRICING.USD.lifetime}`}
            onClick={() => handleExtPay('lifetime')}
          />
        </div>

        <div className="px-4 pt-4 pb-5">
          <p className="text-xs text-zinc-400 mb-2">Have a lifetime license key?</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => { setLicenseKey(e.target.value); setKeyStatus(null) }}
              placeholder="Enter license key"
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-600"
            />
            <button
              onClick={handleValidateKey}
              disabled={keyStatus === 'loading' || keyStatus === 'success'}
              className="px-3 py-2 text-sm rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {keyStatus === 'loading' ? '...' : keyStatus === 'success' ? '✓' : 'Apply'}
            </button>
          </div>
          {keyStatus === 'error' && <p className="text-xs text-red-500 mt-1">{keyError}</p>}
          {keyStatus === 'success' && <p className="text-xs text-green-500 mt-1">License activated!</p>}
        </div>
      </div>
    </div>
  )
}

function PlanCard({ name, priceINR, priceUSD, highlight, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center py-3 px-2 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${
        highlight
          ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
      }`}
    >
      <span className="text-xs font-medium mb-1">{name}</span>
      <span className="text-sm font-bold">{priceINR}</span>
      <span className={`text-xs mt-0.5 ${highlight ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400'}`}>{priceUSD}</span>
    </button>
  )
}
