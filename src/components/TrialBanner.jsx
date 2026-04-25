import React from 'react'

export default function TrialBanner({ inTrial, daysRemaining, trialExpired, isPaid, onUpgrade }) {
  if (isPaid || !inTrial || daysRemaining > 4) return null

  const isUrgent = daysRemaining <= 1
  const label = daysRemaining === 0
    ? 'Trial ends today — upgrade to keep access'
    : `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} left in your trial`

  return (
    <div className={`flex items-center justify-between px-4 py-2 text-xs font-medium ${isUrgent ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' : 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
      <span>{label}</span>
      <button
        onClick={onUpgrade}
        className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${isUrgent ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'} transition-colors`}
      >
        Upgrade
      </button>
    </div>
  )
}
