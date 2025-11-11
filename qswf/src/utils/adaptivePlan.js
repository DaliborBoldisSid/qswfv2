// Adaptive Plan System - Dynamically adjusts quit plan based on user behavior
import { generateQuitPlan, getCurrentWeekPlan } from './quittingLogic.js'

// Constants for adaptive behavior
const MIN_WAIT_THRESHOLD_MS = 10 * 60 * 1000 // 10 minutes minimum wait
const ANALYSIS_WINDOW_DAYS = 7 // Look at last 7 days for trends
const ADJUSTMENT_FACTOR = 0.05 // Max 5% adjustment per recalculation
const REWARD_BONUS_MS = 2 * 60 * 1000 // 2 min reward for good behavior

/**
 * Calculate consumption trends from recent logs
 * @param {Array} logs - All logs
 * @param {number} daysToAnalyze - How many recent days to analyze
 * @returns {Object} Trend analysis
 */
export const calculateConsumptionTrends = (logs, daysToAnalyze = ANALYSIS_WINDOW_DAYS) => {
  const now = Date.now()
  const cutoffDate = now - (daysToAnalyze * 24 * 60 * 60 * 1000)
  
  // Filter to recent logs only
  const recentLogs = logs.filter(log => log.timestamp >= cutoffDate)
  
  if (recentLogs.length === 0) {
    return {
      averagePerDay: 0,
      averagePerWeek: 0,
      cigarettesPerWeek: 0,
      vapesPerWeek: 0,
      trend: 'stable',
      confidence: 'low'
    }
  }
  
  // Calculate actual days spanned
  const oldestLog = Math.min(...recentLogs.map(l => l.timestamp))
  const daySpan = Math.max(1, (now - oldestLog) / (24 * 60 * 60 * 1000))
  
  const cigarettesLogged = recentLogs.filter(l => l.type === 'cigarette').length
  const vapesLogged = recentLogs.filter(l => l.type === 'vape').length
  const totalLogged = recentLogs.length
  
  const averagePerDay = totalLogged / daySpan
  const averagePerWeek = averagePerDay * 7
  const cigarettesPerWeek = (cigarettesLogged / daySpan) * 7
  const vapesPerWeek = (vapesLogged / daySpan) * 7
  
  // Determine trend by comparing first half vs second half
  const midpoint = oldestLog + ((now - oldestLog) / 2)
  const firstHalfLogs = recentLogs.filter(l => l.timestamp < midpoint)
  const secondHalfLogs = recentLogs.filter(l => l.timestamp >= midpoint)
  
  const firstHalfRate = firstHalfLogs.length / Math.max(1, (midpoint - oldestLog) / (24 * 60 * 60 * 1000))
  const secondHalfRate = secondHalfLogs.length / Math.max(1, (now - midpoint) / (24 * 60 * 60 * 1000))
  
  let trend = 'stable'
  if (secondHalfRate < firstHalfRate * 0.9) {
    trend = 'decreasing'
  } else if (secondHalfRate > firstHalfRate * 1.1) {
    trend = 'increasing'
  }
  
  return {
    averagePerDay: Math.round(averagePerDay * 10) / 10,
    averagePerWeek: Math.round(averagePerWeek * 10) / 10,
    cigarettesPerWeek: Math.round(cigarettesPerWeek * 10) / 10,
    vapesPerWeek: Math.round(vapesPerWeek * 10) / 10,
    trend,
    confidence: daySpan >= 3 ? 'high' : 'low'
  }
}

/**
 * Recalculate adaptive plan based on actual consumption
 * @param {Array} logs - All user logs
 * @param {Object} quitPlan - Current quit plan
 * @param {Object} userData - User data
 * @returns {Object} Updated quit plan
 */
export const recalculateAdaptivePlan = (logs, quitPlan, userData) => {
  // Only run if adaptive mode is enabled
  if (!quitPlan.adaptiveMode) {
    return quitPlan
  }
  
  const trends = calculateConsumptionTrends(logs, ANALYSIS_WINDOW_DAYS)
  const currentWeek = getCurrentWeekPlan(quitPlan)
  
  if (!currentWeek || trends.confidence === 'low') {
    return quitPlan // Not enough data yet
  }
  
  // Calculate target from original plan for current week
  const targetThisWeek = currentWeek.totalAllowed
  const actualRate = trends.averagePerWeek
  
  // Calculate deviation from plan
  const deviationPercent = targetThisWeek > 0 
    ? ((actualRate - targetThisWeek) / targetThisWeek) * 100 
    : 0
  
  // Determine adjustment strategy
  let adjustmentMultiplier = 1.0
  
  if (deviationPercent > 20) {
    // User is exceeding plan significantly - slow down reductions
    adjustmentMultiplier = 1 - (ADJUSTMENT_FACTOR * 0.5) // Gentler reduction
  } else if (deviationPercent > 10) {
    // User slightly over target - maintain current pace
    adjustmentMultiplier = 1.0 // No change
  } else if (deviationPercent < -20) {
    // User is way under target - they're doing great! Can accelerate
    adjustmentMultiplier = 1 + (ADJUSTMENT_FACTOR * 1.0) // Speed up
  } else if (deviationPercent < -10) {
    // User slightly under target - gentle acceleration
    adjustmentMultiplier = 1 + (ADJUSTMENT_FACTOR * 0.5)
  }
  
  // Generate new plan starting from actual current consumption
  const newUserData = {
    ...userData,
    cigarettesPerWeek: trends.cigarettesPerWeek,
    vapesPerWeek: trends.vapesPerWeek,
    startDate: Date.now()
  }
  
  // Adjust reduction rate based on behavior
  const adjustedReductionRate = quitPlan.reductionRate * adjustmentMultiplier
  const newPlanData = {
    ...newUserData,
    planSpeed: quitPlan.planSpeed,
    reductionFrequency: quitPlan.reductionFrequency,
    reductionMethod: quitPlan.reductionMethod
  }
  
  // Generate new forward-looking plan
  const newPlan = generateQuitPlan(newPlanData)
  
  // Preserve adaptive settings and original baseline
  return {
    ...newPlan,
    adaptiveMode: true,
    originalCigarettesPerWeek: quitPlan.originalCigarettesPerWeek,
    originalVapesPerWeek: quitPlan.originalVapesPerWeek,
    reductionRate: Math.min(0.2, Math.max(0.03, adjustedReductionRate)), // Clamp between 3-20%
    adaptiveStats: {
      lastRecalculation: Date.now(),
      deviationPercent: Math.round(deviationPercent),
      adjustmentMultiplier,
      trend: trends.trend
    }
  }
}

/**
 * Check if minimum wait time rule should be enforced
 * @param {number} remainingWaitMs - Remaining wait time in milliseconds
 * @returns {Object} Enforcement decision
 */
export const enforceMinimumWait = (remainingWaitMs) => {
  if (remainingWaitMs <= 0) {
    return { shouldWait: false, waitTimeMs: 0 }
  }
  
  // If less than threshold, enforce minimum
  if (remainingWaitMs < MIN_WAIT_THRESHOLD_MS) {
    return {
      shouldWait: true,
      waitTimeMs: MIN_WAIT_THRESHOLD_MS,
      message: `Almost there! Wait ${Math.ceil(MIN_WAIT_THRESHOLD_MS / 60000)} minutes to build better habits.`,
      isMinimumEnforced: true
    }
  }
  
  return {
    shouldWait: true,
    waitTimeMs: remainingWaitMs,
    isMinimumEnforced: false
  }
}

/**
 * Calculate reward for good behavior (waiting when asked)
 * @param {Array} logs - Recent logs
 * @param {Object} quitPlan - Current plan
 * @returns {Object} Reward info
 */
export const calculateDelayReward = (logs, quitPlan) => {
  if (!quitPlan.adaptiveMode) {
    return { hasReward: false, bonusTimeMs: 0 }
  }
  
  // Need at least 5 logs before giving rewards (prevent false positives for new users)
  if (logs.length < 5) {
    return { hasReward: false, bonusTimeMs: 0 }
  }
  
  // Check if user has been compliant recently
  const trends = calculateConsumptionTrends(logs, 3) // Last 3 days
  const currentWeek = getCurrentWeekPlan(quitPlan)
  
  if (!currentWeek || trends.averagePerWeek === 0) {
    return { hasReward: false, bonusTimeMs: 0 }
  }
  
  const targetPerWeek = currentWeek.totalAllowed
  const actualPerWeek = trends.averagePerWeek
  
  // Check recent behavior - if user logged in last 10 minutes, don't show reward yet
  const tenMinutesAgo = Date.now() - (10 * 60 * 1000)
  const recentLogs = logs.filter(log => log.timestamp > tenMinutesAgo)
  if (recentLogs.length > 0) {
    // User just logged something, don't show reward until some time has passed
    return { hasReward: false, bonusTimeMs: 0 }
  }
  
  // If user is below target, give reward
  if (actualPerWeek < targetPerWeek * 0.9) {
    return {
      hasReward: true,
      bonusTimeMs: REWARD_BONUS_MS,
      message: '🎉 Great job! You earned a 2-minute bonus for staying below your limit!'
    }
  }
  
  return { hasReward: false, bonusTimeMs: 0 }
}

/**
 * Should the plan be recalculated?
 * @param {Object} quitPlan - Current plan
 * @returns {boolean}
 */
export const shouldRecalculatePlan = (quitPlan) => {
  if (!quitPlan.adaptiveMode) {
    return false
  }
  
  // Recalculate weekly
  const lastRecalc = quitPlan.adaptiveStats?.lastRecalculation || quitPlan.startDate
  const daysSinceRecalc = (Date.now() - lastRecalc) / (24 * 60 * 60 * 1000)
  
  return daysSinceRecalc >= 7
}
