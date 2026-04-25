import React from 'react'

export default function TrialBanner({ inTrial, daysRemaining, trialExpired, isPaid, onUpgrade }) {
  if (isPaid || !inTrial || daysRemaining > 3) return null

  const isUrgent = daysRemaining <= 1
  const label = daysRemaining === 0
    ? 'Trial ends today — upgrade to keep access'
    : daysRemaining === 1
    ? '1 day left in your trial'
    : `${daysRemaining} days left in your trial`

  return (
    <div className={`flex items-center justify-between px-4 py-2 text-xs font-medium ${
      isUrgent
        ? 'bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
        : 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
    }`}>
      <span>{label}</span>
      <button
        onClick={onUpgrade}
        className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors ${
          isUrgent
            ? 'bg-orange-500 text-white hover:bg-orange-600'
            : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
        }`}
      >
        Upgrade
      </button>
    </div>
  )
}
