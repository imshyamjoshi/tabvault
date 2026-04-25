import { useState, useEffect } from 'react'
import { getTrialStatus } from '../utils/trial.js'

export function useTrial() {
  const [status, setStatus] = useState({ inTrial: true, daysRemaining: 7, trialExpired: false })

  useEffect(() => {
    getTrialStatus().then(setStatus)
  }, [])

  return status
}
