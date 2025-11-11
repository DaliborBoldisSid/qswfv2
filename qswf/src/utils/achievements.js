// Achievement system
import { getCurrentWeekPlan } from './quittingLogic.js'

export const ACHIEVEMENTS = [
  {
    id: 'first_log',
    title: 'First Step',
    description: 'Logged your first session',
    icon: '🌟',
    condition: (stats) => stats.totalLogged >= 1
  },
  {
    id: 'first_day',
    title: 'Day One Complete',
    description: 'Complete your first day',
    icon: '✅',
    condition: (stats) => stats.daysActive >= 1
  },
  {
    id: 'first_week',
    title: 'One Week Strong',
    description: 'Complete your first week',
    icon: '💪',
    condition: (stats) => stats.daysActive >= 7
  },
  {
    id: 'two_weeks',
    title: 'Two Weeks',
    description: 'Complete two weeks on the plan',
    icon: '🔥',
    condition: (stats) => stats.daysActive >= 14
  },
  {
    id: 'one_month',
    title: 'One Month Warrior',
    description: 'A full month of progress',
    icon: '🏆',
    condition: (stats) => stats.daysActive >= 30
  },
  {
    id: 'reducer_10',
    title: 'Reducer',
    description: 'Reduce consumption by 10%',
    icon: '📉',
    condition: (stats) => stats.reductionPercentage >= 10 && stats.weeksSinceStart >= 1
  },
  {
    id: 'reducer_25',
    title: 'Quarter Master',
    description: 'Reduce consumption by 25%',
    icon: '🎯',
    condition: (stats) => stats.reductionPercentage >= 25 && stats.weeksSinceStart >= 2
  },
  {
    id: 'reducer_50',
    title: 'Half Way Hero',
    description: 'Reduce consumption by 50%',
    icon: '⭐',
    condition: (stats) => stats.reductionPercentage >= 50 && stats.weeksSinceStart >= 4
  },
  {
    id: 'reducer_75',
    title: 'Almost There',
    description: 'Reduce consumption by 75%',
    icon: '💎',
    condition: (stats) => stats.reductionPercentage >= 75 && stats.weeksSinceStart >= 6
  },
  {
    id: 'consistency_3',
    title: 'Building Habits',
    description: 'Log sessions for 3 days',
    icon: '✨',
    condition: (stats) => stats.daysActive >= 3
  },
  {
    id: 'consistency_7',
    title: 'One Week Warrior',
    description: 'Log sessions for 7 days',
    icon: '🌈',
    condition: (stats) => stats.daysActive >= 7
  },
  {
    id: 'money_saver_50',
    title: 'Penny Saver',
    description: 'Save $50 by reducing',
    icon: '💰',
    condition: (stats) => stats.moneySaved >= 50
  },
  {
    id: 'money_saver_100',
    title: 'Money Master',
    description: 'Save $100 by reducing',
    icon: '💵',
    condition: (stats) => stats.moneySaved >= 100
  },
  {
    id: 'money_saver_500',
    title: 'Financial Freedom',
    description: 'Save $500 by reducing',
    icon: '🏦',
    condition: (stats) => stats.moneySaved >= 500
  },
  {
    id: 'streak_3',
    title: 'On a Roll',
    description: 'Log for 3 days in a row',
    icon: '🔄',
    condition: (stats) => stats.currentStreak >= 3
  },
  {
    id: 'streak_7',
    title: 'Week Streaker',
    description: 'Log for 7 days in a row',
    icon: '⚡',
    condition: (stats) => stats.currentStreak >= 7
  },
  {
    id: 'streak_30',
    title: 'Unstoppable',
    description: 'Log for 30 days in a row',
    icon: '🚀',
    condition: (stats) => stats.currentStreak >= 30
  }
]

export const checkAchievements = (stats, currentAchievements = []) => {
  const newAchievements = []
  
  ACHIEVEMENTS.forEach(achievement => {
    const alreadyUnlocked = currentAchievements.some(a => a.id === achievement.id)
    
    if (!alreadyUnlocked && achievement.condition(stats)) {
      newAchievements.push({
        ...achievement,
        unlockedAt: Date.now()
      })
    }
  })
  
  return newAchievements
}

export const calculateStats = (logs, quitPlan, userData) => {
  if (!quitPlan || !userData) {
    return {
      daysActive: 0,
      totalLogged: 0,
      cigarettesLogged: 0,
      vapesLogged: 0,
      reductionPercentage: 0,
      moneySaved: 0,
      currentStreak: 0,
      perfectDays: 0,
      weeksSinceStart: 0
    }
  }
  
  const startDate = new Date(quitPlan.startDate).getTime()
  const now = Date.now()
  const daysSinceStart = Math.max(0, Math.floor((now - startDate) / (24 * 60 * 60 * 1000)))
  
  const totalLogged = logs.length
  const cigarettesLogged = logs.filter(l => l.type === 'cigarette').length
  const vapesLogged = logs.filter(l => l.type === 'vape').length
  
  // Calculate actual weeks passed (no forced minimum for achievement checks)
  const weeksSinceStart = daysSinceStart / 7
  const actualWeeksSinceStart = daysSinceStart / 7 // Actual time for money calculations
  
  // Get current week's plan to compare against
  const currentWeek = getCurrentWeekPlan(quitPlan)
  const expectedCigsThisWeek = currentWeek?.cigarettesAllowed || quitPlan.originalCigarettesPerWeek
  const expectedVapesThisWeek = currentWeek?.vapesAllowed || quitPlan.originalVapesPerWeek
  const expectedTotal = expectedCigsThisWeek + expectedVapesThisWeek
  
  // Calculate actual consumption rate per week
  const weeksForAverage = Math.max(1, weeksSinceStart) // Use minimum 1 for division
  const currentCigsPerWeek = cigarettesLogged / weeksForAverage
  const currentVapesPerWeek = vapesLogged / weeksForAverage
  const currentTotal = currentCigsPerWeek + currentVapesPerWeek
  
  // Calculate reduction percentage compared to ORIGINAL baseline
  // Show after at least 1 complete day to provide immediate feedback
  const originalTotal = quitPlan.originalCigarettesPerWeek + quitPlan.originalVapesPerWeek
  let reductionPercentage = 0

  if (daysSinceStart >= 1 && originalTotal > 0) {
    // Compare actual average consumption to original baseline
    reductionPercentage = Math.min(100, Math.max(0, ((originalTotal - currentTotal) / originalTotal) * 100))
  }
  
  // Calculate money saved: Compare actual consumption to what you WOULD have consumed at original rate
  // This shows real week-to-week savings
  
  let moneySaved = 0
  
  // Only calculate savings if user has been active for at least 1 day
  if (daysSinceStart >= 1 && totalLogged > 0) {
    // What you WOULD have consumed at original rate during this ACTUAL time
    const expectedCigs = quitPlan.originalCigarettesPerWeek * actualWeeksSinceStart
    const expectedVapes = quitPlan.originalVapesPerWeek * actualWeeksSinceStart
    
    // What you actually consumed
    // Savings = expected - actual
    const cigsSaved = Math.max(0, expectedCigs - cigarettesLogged)
    const vapesSaved = Math.max(0, expectedVapes - vapesLogged)
    
    // Use actual prices from userData
    const cigPrice = userData?.cigarettePrice ? (userData.cigarettePrice / 20) : 0.4 // price per cigarette
    const vapePrice = userData?.vapePrice || 15 // price per vape/pod
    
    moneySaved = (cigsSaved * cigPrice) + (vapesSaved * vapePrice)
  }
  
  // Calculate streak
  let currentStreak = 0
  if (logs.length > 0) {
    const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp)
    let checkDate = new Date()
    checkDate.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 365; i++) {
      const dayLogs = sortedLogs.filter(log => {
        const logDate = new Date(log.timestamp)
        logDate.setHours(0, 0, 0, 0)
        return logDate.getTime() === checkDate.getTime()
      })
      
      if (dayLogs.length > 0) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
  }
  
  // Calculate perfect days (days within limit)
  let perfectDays = 0
  // This would require more complex logic to track daily limits vs actuals
  
  return {
    daysActive: logs.length > 0 ? Math.max(1, daysSinceStart) : 0,
    totalLogged: totalLogged || 0,
    cigarettesLogged: cigarettesLogged || 0,
    vapesLogged: vapesLogged || 0,
    reductionPercentage: Math.round(reductionPercentage) || 0,
    moneySaved: Math.max(0, Math.round(moneySaved * 100) / 100),
    currentStreak: currentStreak || 0,
    perfectDays: perfectDays || 0,
    weeksSinceStart: Math.max(0, Math.floor(weeksSinceStart))
  }
}
