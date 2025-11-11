// Local storage utility for persistence
const STORAGE_KEYS = {
  USER_DATA: 'qswf_user_data',
  QUIT_PLAN: 'qswf_quit_plan',
  LOGS: 'qswf_logs',
  ACHIEVEMENTS: 'qswf_achievements',
  ONBOARDING: 'qswf_onboarding_complete',
  CRAVING_RESPONSES: 'qswf_craving_responses',
  DASHBOARD_ORDER: 'qswf_dashboard_order',
  DASHBOARD_VISIBILITY: 'qswf_dashboard_visibility',
  NOTIFICATION_TESTED: 'qswf_notification_tested'
}

export const storage = {
  saveUserData: (data) => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data))
  },
  
  getUserData: () => {
    const data = localStorage.getItem(STORAGE_KEYS.USER_DATA)
    return data ? JSON.parse(data) : null
  },
  
  saveQuitPlan: (plan) => {
    localStorage.setItem(STORAGE_KEYS.QUIT_PLAN, JSON.stringify(plan))
  },
  
  getQuitPlan: () => {
    const plan = localStorage.getItem(STORAGE_KEYS.QUIT_PLAN)
    return plan ? JSON.parse(plan) : null
  },
  
  saveLogs: (logs) => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs))
  },
  
  getLogs: () => {
    const logs = localStorage.getItem(STORAGE_KEYS.LOGS)
    return logs ? JSON.parse(logs) : []
  },
  
  addLog: (log) => {
    const logs = storage.getLogs()
    logs.push({ ...log, timestamp: Date.now() })
    storage.saveLogs(logs)
  },
  
  saveAchievements: (achievements) => {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements))
  },
  
  getAchievements: () => {
    const achievements = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)
    return achievements ? JSON.parse(achievements) : []
  },
  
  setOnboardingComplete: (complete) => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(complete))
  },
  
  isOnboardingComplete: () => {
    const complete = localStorage.getItem(STORAGE_KEYS.ONBOARDING)
    return complete ? JSON.parse(complete) : false
  },
  
  saveCravingResponses: (responses) => {
    localStorage.setItem(STORAGE_KEYS.CRAVING_RESPONSES, JSON.stringify(responses))
  },
  
  getCravingResponses: () => {
    const responses = localStorage.getItem(STORAGE_KEYS.CRAVING_RESPONSES)
    return responses ? JSON.parse(responses) : {}
  },
  
  saveDashboardOrder: (order) => {
    localStorage.setItem(STORAGE_KEYS.DASHBOARD_ORDER, JSON.stringify(order))
  },
  
  getDashboardOrder: () => {
    const order = localStorage.getItem(STORAGE_KEYS.DASHBOARD_ORDER)
    return order ? JSON.parse(order) : null
  },
  
  saveDashboardVisibility: (visibility) => {
    localStorage.setItem(STORAGE_KEYS.DASHBOARD_VISIBILITY, JSON.stringify(visibility))
  },
  
  getDashboardVisibility: () => {
    const visibility = localStorage.getItem(STORAGE_KEYS.DASHBOARD_VISIBILITY)
    return visibility ? JSON.parse(visibility) : null
  },

  setNotificationTested: (tested) => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_TESTED, JSON.stringify(tested))
  },

  hasNotificationBeenTested: () => {
    const tested = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_TESTED)
    return tested ? JSON.parse(tested) : false
  },

  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }
}
