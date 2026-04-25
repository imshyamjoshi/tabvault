import { storageGet, storageSet } from './storage.js'

const TRIAL_DAYS = 7

export async function initTrial() {
  const { installDate } = await storageGet('installDate')
  if (!installDate) {
    await storageSet({ installDate: new Date().toISOString() })
  }
}

export async function getTrialStatus() {
  const { installDate } = await storageGet('installDate')
  if (!installDate) {
    await initTrial()
    return { inTrial: true, daysRemaining: TRIAL_DAYS, trialExpired: false }
  }

  const elapsed = Math.floor((Date.now() - new Date(installDate).getTime()) / 86400000)
  const daysRemaining = Math.max(0, TRIAL_DAYS - elapsed)
  const inTrial = elapsed <= TRIAL_DAYS
  const trialExpired = elapsed > TRIAL_DAYS

  return { inTrial, daysRemaining, trialExpired }
}
