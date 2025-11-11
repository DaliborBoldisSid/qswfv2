import { useState, useEffect } from 'react'
import Onboarding from './components/Onboarding'
import Dashboard from './components/Dashboard'
import Achievements from './components/Achievements'
import Stats from './components/Stats'
import CravingHelp from './components/CravingHelp'
import { storage } from './utils/storage'
import { generateQuitPlan, getCurrentWeekPlan, getTimeUntilNext } from './utils/quittingLogic'
import { requestNotificationPermission, showNotification, scheduleNotification } from './utils/notifications'
import { checkAchievements, calculateStats } from './utils/achievements'
import { recalculateAdaptivePlan, shouldRecalculatePlan } from './utils/adaptivePlan'
import { Home, TrendingUp, Trophy, Heart } from 'lucide-react'

function App() {
  const [currentView, setCurrentView] = useState('loading')
  const [userData, setUserData] = useState(null)
  const [quitPlan, setQuitPlan] = useState(null)
  const [logs, setLogs] = useState([])
  const [achievements, setAchievements] = useState([])

  useEffect(() => {
    // Load data from storage
    const loadData = async () => {
      const isOnboarded = storage.isOnboardingComplete()

      if (isOnboarded) {
        const savedUserData = storage.getUserData()
        const savedQuitPlan = storage.getQuitPlan()
        const savedLogs = storage.getLogs()
        const savedAchievements = storage.getAchievements()

        setUserData(savedUserData)
        setLogs(savedLogs)
        setAchievements(savedAchievements)

        // Recalculate adaptive plan if needed
        let activePlan = savedQuitPlan
        if (savedQuitPlan && shouldRecalculatePlan(savedQuitPlan)) {
          activePlan = recalculateAdaptivePlan(savedLogs, savedQuitPlan, savedUserData)
          storage.saveQuitPlan(activePlan)
        }
        setQuitPlan(activePlan)
        setCurrentView('dashboard')

        // Check for new achievements
        if (savedQuitPlan && savedUserData) {
          const stats = calculateStats(savedLogs, savedQuitPlan, savedUserData)
          const newAchievements = checkAchievements(stats, savedAchievements)

          if (newAchievements.length > 0) {
            const updatedAchievements = [...savedAchievements, ...newAchievements]
            setAchievements(updatedAchievements)
            storage.saveAchievements(updatedAchievements)

            // Show notification for new achievement
            newAchievements.forEach(achievement => {
              showNotification(`🏆 Achievement Unlocked!`, {
                body: `${achievement.icon} ${achievement.title}: ${achievement.description}`,
                tag: 'achievement'
              })
            })
          }
        }
      } else {
        setCurrentView('onboarding')
      }
    }

    loadData()
  }, [])

  // Listen for Android deep link navigation events
  useEffect(() => {
    const handleAndroidNavigation = (event) => {
      const { page } = event.detail
      console.log(`[Android] Navigating to: ${page}`)

      if (page === 'stats') {
        setCurrentView('stats')
      } else if (page === 'achievements') {
        setCurrentView('achievements')
      } else if (page === 'dashboard' || page === 'home') {
        setCurrentView('dashboard')
      } else if (page === 'craving' || page === 'help') {
        setCurrentView('craving')
      }
    }

    // Listen for Android navigation events
    window.addEventListener('android-navigate', handleAndroidNavigation)

    // Cleanup
    return () => {
      window.removeEventListener('android-navigate', handleAndroidNavigation)
    }
  }, [])

  const handleOnboardingComplete = async (data) => {
    // Request notification permission
    await requestNotificationPermission()

    // Generate quit plan
    const plan = generateQuitPlan(data)
    
    // Save everything
    storage.saveUserData(data)
    storage.saveQuitPlan(plan)
    storage.setOnboardingComplete(true)
    
    setUserData(data)
    setQuitPlan(plan)
    setCurrentView('dashboard')

    // Show welcome notification
    showNotification('Welcome to your quitting journey!', {
      body: 'Your personalized plan is ready. You\'ll receive notifications when you can smoke.',
      tag: 'welcome'
    })
  }

  const handleLogSmoke = (type) => {
    const newLog = {
      type,
      timestamp: Date.now()
    }
    
    const updatedLogs = [...logs, newLog]
    setLogs(updatedLogs)
    storage.saveLogs(updatedLogs)
    
    // Recalculate adaptive plan if needed
    let updatedPlan = quitPlan
    if (quitPlan && shouldRecalculatePlan(quitPlan)) {
      updatedPlan = recalculateAdaptivePlan(updatedLogs, quitPlan, userData)
      setQuitPlan(updatedPlan)
      storage.saveQuitPlan(updatedPlan)
    }

    // Check for achievements
    const stats = calculateStats(updatedLogs, quitPlan, userData)
    const newAchievements = checkAchievements(stats, achievements)
    
    if (newAchievements.length > 0) {
      const updatedAchievements = [...achievements, ...newAchievements]
      setAchievements(updatedAchievements)
      storage.saveAchievements(updatedAchievements)
      
      // Show notification for new achievement
      newAchievements.forEach(achievement => {
        setTimeout(() => {
          showNotification(`🏆 Achievement Unlocked!`, {
            body: `${achievement.icon} ${achievement.title}`,
            tag: 'achievement'
          })
        }, 500)
      })
    }

    // Schedule next notification
    const currentWeekPlan = getCurrentWeekPlan(updatedPlan)
    const lastLog = newLog
    const waitTime = getTimeUntilNext(type, lastLog, currentWeekPlan, updatedPlan, updatedLogs)
    
    if (waitTime > 0 && waitTime !== Infinity) {
      scheduleNotification(type, waitTime)
    }

    // Show success notification
    showNotification('Logged successfully!', {
      body: `${type === 'cigarette' ? 'Cigarette' : 'Vape session'} has been logged.`,
      tag: 'log-success'
    })
  }

  const handleNavigate = (view) => {
    setCurrentView(view)
  }

  const handleBack = () => {
    setCurrentView('dashboard')
  }

  if (currentView === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Loading...</p>
        </div>
      </div>
    )
  }

  if (currentView === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="relative">
      {currentView === 'dashboard' && (
        <Dashboard
          userData={userData}
          quitPlan={quitPlan}
          logs={logs}
          onLogSmoke={handleLogSmoke}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === 'achievements' && (
        <Achievements
          unlockedAchievements={achievements}
          userData={userData}
          quitPlan={quitPlan}
          logs={logs}
          onBack={handleBack}
        />
      )}

      {currentView === 'stats' && (
        <Stats
          userData={userData}
          quitPlan={quitPlan}
          logs={logs}
          achievements={achievements}
          onBack={handleBack}
        />
      )}

      {currentView === 'craving' && (
        <CravingHelp
          onBack={handleBack}
        />
      )}

      {/* Bottom Navigation */}
      {currentView !== 'onboarding' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
          <div className="max-w-md mx-auto px-4">
            <div className="flex items-center justify-around py-2">
              <button
                onClick={() => handleNavigate('dashboard')}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all ${
                  currentView === 'dashboard'
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600'
                }`}
              >
                <Home className="w-6 h-6" />
                <span className="text-xs font-semibold">Home</span>
              </button>

              <button
                onClick={() => handleNavigate('stats')}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all ${
                  currentView === 'stats'
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600'
                }`}
              >
                <TrendingUp className="w-6 h-6" />
                <span className="text-xs font-semibold">Stats</span>
              </button>

              <button
                onClick={() => handleNavigate('achievements')}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all ${
                  currentView === 'achievements'
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600'
                }`}
              >
                <Trophy className="w-6 h-6" />
                <span className="text-xs font-semibold">Achievements</span>
              </button>

              <button
                onClick={() => handleNavigate('craving')}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all ${
                  currentView === 'craving'
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600'
                }`}
              >
                <Heart className="w-6 h-6" />
                <span className="text-xs font-semibold">Help</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
