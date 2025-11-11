// Quitting plan logic and calculations
import { enforceMinimumWait, calculateDelayReward } from './adaptivePlan.js'

export const PLAN_SPEEDS = {
  SLOW: 'slow',
  MEDIUM: 'medium',
  QUICK: 'quick'
}

// Reduction percentages per week based on speed
const REDUCTION_RATES = {
  [PLAN_SPEEDS.SLOW]: 0.05,    // 5% reduction per week
  [PLAN_SPEEDS.MEDIUM]: 0.10,  // 10% reduction per week
  [PLAN_SPEEDS.QUICK]: 0.15    // 15% reduction per week
}

// Calculate initial wait time between smokes (in minutes)
export const calculateInitialWaitTime = (weeklyAmount) => {
  // Total minutes in a week = 10080
  // Assuming average waking hours = 16 hours/day = 112 hours/week = 6720 minutes
  const wakingMinutesPerWeek = 6720
  return Math.floor(wakingMinutesPerWeek / weeklyAmount)
}

// Generate a complete quitting plan
export const generateQuitPlan = (userData) => {
  const { 
    cigarettesPerWeek = 0, 
    vapesPerWeek = 0, 
    planSpeed,
    reductionFrequency = 'weekly',
    reductionMethod = 'compound', // 'compound' or 'linear'
    adaptiveMode = false,
    startDate = Date.now()
  } = userData

  const totalPerWeek = cigarettesPerWeek + vapesPerWeek
  const cigPercentage = cigarettesPerWeek / totalPerWeek
  const vapePercentage = vapesPerWeek / totalPerWeek
  
  const reductionRate = REDUCTION_RATES[planSpeed] || REDUCTION_RATES[PLAN_SPEEDS.MEDIUM]
  
  const plan = {
    startDate,
    planSpeed,
    reductionFrequency,
    reductionMethod,
    adaptiveMode,
    originalCigarettesPerWeek: cigarettesPerWeek,
    originalVapesPerWeek: vapesPerWeek,
    cigPercentage,
    vapePercentage,
    reductionRate,
    weeks: []
  }

  let currentTotal = totalPerWeek
  let weekNumber = 0
  let previousRoundedTotal = null // Track previous week's rounded value to avoid plateaus
  
  // For daily reduction, handle compound vs linear methods
  const reductionPeriod = reductionFrequency === 'daily' ? 7 : 1 // reduce 7 times per week or 1 time per week
  
  while (currentTotal > 0.5) {
    const weekStart = new Date(startDate)
    weekStart.setDate(weekStart.getDate() + (weekNumber * 7))
    
    // Use proportional rounding to ensure cigarettes + vapes = total
    let totalAllowed = Math.round(currentTotal)
    
    // Prevent plateau: if rounded value hasn't changed, force at least 1-unit reduction
    if (previousRoundedTotal !== null && totalAllowed === previousRoundedTotal && totalAllowed > 0) {
      totalAllowed = previousRoundedTotal - 1
      currentTotal = totalAllowed // Sync the float value to match
    }
    
    // If we've reached 0, exit the loop instead of adding another week
    if (totalAllowed <= 0) break
    
    previousRoundedTotal = totalAllowed
    
    const cigarettesThisWeek = Math.round(totalAllowed * cigPercentage)
    const vapesThisWeek = totalAllowed - cigarettesThisWeek // Force consistency
    
    const waitTimeCigs = cigarettesThisWeek > 0 ? calculateInitialWaitTime(cigarettesThisWeek) : 0
    const waitTimeVapes = vapesThisWeek > 0 ? calculateInitialWaitTime(vapesThisWeek) : 0
    
    plan.weeks.push({
      weekNumber,
      weekStart: weekStart.toISOString(),
      totalAllowed,
      cigarettesAllowed: cigarettesThisWeek,
      vapesAllowed: vapesThisWeek,
      waitTimeCigs, // minutes
      waitTimeVapes // minutes
    })
    
    // Apply reduction based on frequency and method
    if (reductionFrequency === 'daily') {
      if (reductionMethod === 'linear') {
        // Linear: Subtract fixed amount based on original total
        const dailyReduction = totalPerWeek * (reductionRate / 7)
        currentTotal = currentTotal - (dailyReduction * 7)
      } else {
        // Compound: Multiply by reduction rate each day
        const dailyRate = reductionRate / 7
        for (let i = 0; i < 7; i++) {
          currentTotal = currentTotal * (1 - dailyRate)
        }
      }
    } else {
      // Weekly reduction (always compound)
      currentTotal = currentTotal * (1 - reductionRate)
    }
    
    weekNumber++
    
    // Safety limit to prevent infinite loops
    if (weekNumber > 100) break
  }
  
  // Add final week with 0 only if the last week doesn't already have 0
  const lastWeek = plan.weeks[plan.weeks.length - 1]
  if (!lastWeek || lastWeek.totalAllowed > 0) {
    const finalWeekStart = new Date(startDate)
    finalWeekStart.setDate(finalWeekStart.getDate() + (weekNumber * 7))
    
    plan.weeks.push({
      weekNumber,
      weekStart: finalWeekStart.toISOString(),
      totalAllowed: 0,
      cigarettesAllowed: 0,
      vapesAllowed: 0,
      waitTimeCigs: 0,
      waitTimeVapes: 0
    })
    
    plan.estimatedQuitDate = finalWeekStart.toISOString()
    plan.totalWeeks = weekNumber + 1
  } else {
    // Last week already has 0, use that as the quit date
    plan.estimatedQuitDate = lastWeek.weekStart
    plan.totalWeeks = plan.weeks.length
  }
  
  return plan
}

// Get current week's plan based on current date
export const getCurrentWeekPlan = (quitPlan) => {
  if (!quitPlan || !quitPlan.weeks) return null
  
  const now = Date.now()
  const startDate = new Date(quitPlan.startDate).getTime()
  
  const weeksPassed = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000))
  
  // Find the appropriate week
  const currentWeek = quitPlan.weeks.find(week => week.weekNumber === weeksPassed)
  
  return currentWeek || quitPlan.weeks[quitPlan.weeks.length - 1]
}

// Check if user can smoke/vape now
export const canSmokeNow = (type, lastLog, currentWeekPlan, quitPlan = null, logs = []) => {
  if (!currentWeekPlan) return false
  
  const waitTime = type === 'cigarette' 
    ? currentWeekPlan.waitTimeCigs 
    : currentWeekPlan.waitTimeVapes
  
  if (waitTime === 0) return false // No more allowed this week
  
  if (!lastLog) return true // First one
  
  const timeSinceLastLog = Date.now() - lastLog.timestamp
  let waitTimeMs = waitTime * 60 * 1000
  
  // Apply reward bonus for good behavior in adaptive mode
  if (quitPlan?.adaptiveMode && logs.length > 0) {
    const reward = calculateDelayReward(logs, quitPlan)
    if (reward.hasReward) {
      waitTimeMs = Math.max(0, waitTimeMs - reward.bonusTimeMs)
    }
  }
  
  const remainingWait = waitTimeMs - timeSinceLastLog
  
  // In adaptive mode, enforce minimum wait threshold
  if (quitPlan?.adaptiveMode && remainingWait > 0 && remainingWait < waitTimeMs) {
    const enforcement = enforceMinimumWait(remainingWait)
    if (enforcement.isMinimumEnforced) {
      return false // Still need to wait
    }
  }
  
  return timeSinceLastLog >= waitTimeMs
}

// Get time until next allowed smoke
export const getTimeUntilNext = (type, lastLog, currentWeekPlan, quitPlan = null, logs = []) => {
  if (!currentWeekPlan || !lastLog) return 0
  
  const waitTime = type === 'cigarette' 
    ? currentWeekPlan.waitTimeCigs 
    : currentWeekPlan.waitTimeVapes
  
  if (waitTime === 0) return Infinity
  
  const timeSinceLastLog = Date.now() - lastLog.timestamp
  let waitTimeMs = waitTime * 60 * 1000
  
  // Apply reward bonus for good behavior in adaptive mode
  if (quitPlan?.adaptiveMode && logs.length > 0) {
    const reward = calculateDelayReward(logs, quitPlan)
    if (reward.hasReward) {
      waitTimeMs = Math.max(0, waitTimeMs - reward.bonusTimeMs)
    }
  }
  
  const remainingWait = Math.max(0, waitTimeMs - timeSinceLastLog)
  
  // In adaptive mode, enforce minimum wait threshold
  if (quitPlan?.adaptiveMode && remainingWait > 0) {
    const enforcement = enforceMinimumWait(remainingWait)
    if (enforcement.isMinimumEnforced) {
      return enforcement.waitTimeMs
    }
  }
  
  return remainingWait
}
