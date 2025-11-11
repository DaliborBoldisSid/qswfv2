import { useState, useEffect } from 'react'
import { Cigarette, Wind, Clock, CheckCircle, Trophy, TrendingDown, Calendar, Bell, Bug, Settings, GripVertical, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react'
import { getCurrentWeekPlan, canSmokeNow, getTimeUntilNext } from '../utils/quittingLogic'
import { requestNotificationPermission, showNotification, getNotificationPermission } from '../utils/notifications'
import { storage } from '../utils/storage'
import { enforceMinimumWait, calculateDelayReward } from '../utils/adaptivePlan'
import NotificationDebug from './NotificationDebug'

const Dashboard = ({ userData, quitPlan, logs, onLogSmoke, onNavigate }) => {
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [selectedType, setSelectedType] = useState(null)
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission())
  const [showInstructions, setShowInstructions] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSmokeFreeConfirmation, setShowSmokeFreeConfirmation] = useState(false)
  const [showWeekPlanModal, setShowWeekPlanModal] = useState(false)
  const [isRequestingPermission, setIsRequestingPermission] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [componentOrder, setComponentOrder] = useState(() => {
    return storage.getDashboardOrder() || ['vape', 'cigarette', 'weekSummary', 'notifications']
  })
  const [componentVisibility, setComponentVisibility] = useState(() => {
    return storage.getDashboardVisibility() || {
      vape: true,
      cigarette: true,
      weekSummary: true,
      notifications: true
    }
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Toast notification handler
  const showToastNotification = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  const currentWeekPlan = getCurrentWeekPlan(quitPlan)
  
  const lastCigLog = [...logs].filter(l => l.type === 'cigarette').sort((a, b) => b.timestamp - a.timestamp)[0]
  const lastVapeLog = [...logs].filter(l => l.type === 'vape').sort((a, b) => b.timestamp - a.timestamp)[0]
  
  const canSmokeCig = canSmokeNow('cigarette', lastCigLog, currentWeekPlan, quitPlan, logs)
  const canSmokeVape = canSmokeNow('vape', lastVapeLog, currentWeekPlan, quitPlan, logs)
  
  const timeUntilCig = getTimeUntilNext('cigarette', lastCigLog, currentWeekPlan, quitPlan, logs)
  const timeUntilVape = getTimeUntilNext('vape', lastVapeLog, currentWeekPlan, quitPlan, logs)

  const formatTime = (ms) => {
    if (ms === Infinity) return 'No more this week'
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    // Show only minutes when > 1 minute to reduce visual noise
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    } else if (minutes > 1) {
      return `${minutes}m`
    } else if (minutes === 1) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  // Check for adaptive mode messaging
  const getAdaptiveMessage = (type) => {
    if (!quitPlan?.adaptiveMode) return null
    
    const reward = calculateDelayReward(logs, quitPlan)
    if (reward.hasReward) {
      return { type: 'reward', text: reward.message }
    }
    
    const timeUntil = type === 'cigarette' ? timeUntilCig : timeUntilVape
    if (timeUntil > 0 && timeUntil < Infinity) {
      const enforcement = enforceMinimumWait(timeUntil)
      if (enforcement.isMinimumEnforced) {
        return { type: 'enforcement', text: enforcement.message }
      }
    }
    
    return null
  }

  const handleLog = (type, isExtraordinary = false) => {
    setSelectedType({ type, isExtraordinary })
  }

  const confirmLog = () => {
    if (selectedType) {
      try {
        // Close modal immediately for better UX
        const typeToLog = selectedType.type
        setSelectedType(null)
        // Then log the session
        onLogSmoke(typeToLog)
      } catch (error) {
        console.error('Error logging session:', error)
        // Ensure modal is closed even if there's an error
        setSelectedType(null)
      }
    }
  }

  const todaysLogs = logs.filter(log => {
    const logDate = new Date(log.timestamp)
    const today = new Date()
    return logDate.toDateString() === today.toDateString()
  })
  
  const todaysLogsCount = todaysLogs.length
  const todaysCigs = todaysLogs.filter(l => l.type === 'cigarette').length
  const todaysVapes = todaysLogs.filter(l => l.type === 'vape').length

  const weekStartDate = new Date(currentWeekPlan?.weekStart)
  const weekNumber = currentWeekPlan?.weekNumber || 0

  const handleTestNotification = async () => {
    console.log('Button tapped, current permission:', getNotificationPermission())

    // Check current permission state
    const currentPerm = getNotificationPermission()

    if (currentPerm === 'denied') {
      setShowInstructions(true)
      return
    }

    if (currentPerm === 'default') {
      // Need to request permission
      setIsRequestingPermission(true)
      try {
        console.log('Requesting notification permission...')
        const result = await requestNotificationPermission()
        console.log('Permission result:', result)

        setNotificationPermission(getNotificationPermission())

        if (result.success) {
          showNotification('🎉 Notifications Enabled!', {
            body: 'You will now receive alerts when you can smoke/vape.',
            tag: 'test-notification',
            vibrate: [200, 100, 200]
          })
          // Mark notification as tested
          storage.setNotificationTested(true)
        } else if (result.reason === 'blocked') {
          setShowInstructions(true)
        } else if (result.reason === 'denied') {
          alert('❌ Permission denied. Tap the button again to try once more.')
        }
      } catch (error) {
        console.error('Error requesting permission:', error)
        alert('Error requesting permission. Please try again.')
      } finally {
        setIsRequestingPermission(false)
      }
    } else if (currentPerm === 'granted') {
      // Already granted, just test
      showNotification('✅ Test Notification', {
        body: 'Notifications are working! You will be notified when you can smoke.',
        tag: 'test-notification',
        vibrate: [200, 100, 200],
        requireInteraction: false
      })
      // Mark notification as tested
      storage.setNotificationTested(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-blue-500 to-purple-600 pb-20">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg p-4 text-white">
        <div className="max-w-md mx-auto space-y-3">
          {userData?.name && (
            <div>
              <p className="text-sm text-white/70">Welcome back</p>
              <h1 className="text-3xl font-extrabold tracking-tight">{userData.name}</h1>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Week {weekNumber + 1}</h1>
                {quitPlan?.adaptiveMode && (
                  <span className="px-2 py-1 bg-purple-500/80 text-xs font-semibold rounded-full">
                    🧠 ADAPTIVE
                  </span>
                )}
              </div>
              <p className="text-sm text-white/80">
                {weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              {quitPlan?.adaptiveMode && quitPlan?.adaptiveStats && (
                <p className="text-xs text-white/70 mt-1">
                  {quitPlan.adaptiveStats.trend === 'decreasing' && '📉 Doing great!'}
                  {quitPlan.adaptiveStats.trend === 'stable' && '➡️ Staying steady'}
                  {quitPlan.adaptiveStats.trend === 'increasing' && '📈 Stay focused'}
                  {quitPlan.adaptiveStats.deviationPercent !== undefined && 
                    ` ${Math.abs(quitPlan.adaptiveStats.deviationPercent)}% ${quitPlan.adaptiveStats.deviationPercent < 0 ? 'below' : 'above'} target`
                  }
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                title="Customize Dashboard"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDebug(true)}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <Bug className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('achievements')}
                className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <Trophy className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Smoke-Free Celebration Card */}
        {currentWeekPlan && currentWeekPlan.totalAllowed === 0 && (
          <div className="card bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500 border-4 border-white shadow-2xl animate-pulse">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-2">You're Smoke-Free!</h2>
              <p className="text-lg mb-4 text-white/90">
                Congratulations! You've completed your quit plan.
              </p>
              <button
                onClick={() => setShowSmokeFreeConfirmation(true)}
                className="w-full py-4 bg-white text-green-600 rounded-xl font-bold text-lg hover:bg-green-50 transition-all active:scale-95 shadow-lg"
              >
                🏆 Confirm I'm Smoke-Free!
              </button>
            </div>
          </div>
        )}

        {/* Render components in custom order */}
        {componentOrder.map((componentId) => {
          if (!componentVisibility[componentId]) return null
          
          if (componentId === 'vape' && currentWeekPlan && currentWeekPlan.vapesAllowed > 0) {
            return (
              <div key="vape" className={`card border-2 ${canSmokeVape ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Wind className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Vape Session</h3>
                      <p className="text-sm text-gray-600">
                        {currentWeekPlan.vapesAllowed} allowed this week
                      </p>
                    </div>
                  </div>
                  {canSmokeVape && (
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                      READY
                    </span>
                  )}
                </div>

                {/* Today's Activity */}
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <p className="text-xs font-semibold text-blue-800 mb-1">Today's Activity</p>
                  <p className="text-lg font-bold text-blue-600">{todaysVapes} logged today</p>
                </div>

                {!canSmokeVape && (
                  <>
                    <div className="bg-blue-100 p-3 rounded-lg mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-800">Next available in:</p>
                        <p className="text-lg font-bold text-blue-600">{formatTime(timeUntilVape)}</p>
                      </div>
                    </div>
                    {(() => {
                      const adaptiveMsg = getAdaptiveMessage('vape')
                      if (adaptiveMsg) {
                        return (
                          <div className={`p-2 rounded-lg mb-3 text-xs ${
                            adaptiveMsg.type === 'reward' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {adaptiveMsg.text}
                          </div>
                        )
                      }
                      return null
                    })()}
                  </>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleLog('vape', false)}
                    disabled={!canSmokeVape}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                      canSmokeVape
                        ? 'bg-blue-500 hover:bg-blue-600 text-white active:scale-95'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {canSmokeVape ? 'Log Vape Session' : 'Not Available Yet'}
                  </button>
                  {!canSmokeVape && (
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => handleLog('vape', true)}
                        className="px-4 py-3 rounded-lg font-semibold transition-all bg-red-500 hover:bg-red-600 text-white active:scale-95"
                        title="Log an extraordinary session outside of schedule"
                      >
                        ⚠️
                      </button>
                      <span className="text-xs font-semibold text-red-600">Emergency</span>
                    </div>
                  )}
                </div>
              </div>
            )
          }
          
          if (componentId === 'cigarette' && currentWeekPlan && currentWeekPlan.cigarettesAllowed > 0) {
            return (
          <div key="cigarette" className={`card border-2 ${canSmokeCig ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Cigarette className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Cigarette</h3>
                  <p className="text-sm text-gray-600">
                    {currentWeekPlan.cigarettesAllowed} allowed this week
                  </p>
                </div>
              </div>
              {canSmokeCig && (
                <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                  READY
                </span>
              )}
            </div>

            {/* Today's Activity */}
            <div className="bg-orange-50 p-3 rounded-lg mb-3">
              <p className="text-xs font-semibold text-orange-800 mb-1">Today's Activity</p>
              <p className="text-lg font-bold text-orange-600">{todaysCigs} logged today</p>
            </div>

            {!canSmokeCig && (
              <>
                <div className="bg-orange-100 p-3 rounded-lg mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-orange-800">Next available in:</p>
                    <p className="text-lg font-bold text-orange-600">{formatTime(timeUntilCig)}</p>
                  </div>
                </div>
                {(() => {
                  const adaptiveMsg = getAdaptiveMessage('cigarette')
                  if (adaptiveMsg) {
                    return (
                      <div className={`p-2 rounded-lg mb-3 text-xs ${
                        adaptiveMsg.type === 'reward' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {adaptiveMsg.text}
                      </div>
                    )
                  }
                  return null
                })()}
              </>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleLog('cigarette', false)}
                disabled={!canSmokeCig}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  canSmokeCig
                    ? 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {canSmokeCig ? 'Log Cigarette' : 'Not Available Yet'}
              </button>
              {!canSmokeCig && (
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => handleLog('cigarette', true)}
                    className="px-4 py-3 rounded-lg font-semibold transition-all bg-red-500 hover:bg-red-600 text-white active:scale-95"
                    title="Log an extraordinary session outside of schedule"
                  >
                    ⚠️
                  </button>
                  <span className="text-xs font-semibold text-red-600">Emergency</span>
                </div>
              )}
            </div>
              </div>
            )
          }
          
          if (componentId === 'weekSummary') {
            return (
        <div key="weekSummary" className="card">
          <button
            onClick={() => setShowWeekPlanModal(true)}
            className="w-full hover:opacity-80 transition-all active:scale-95 text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">This Week's Plan</h3>
              <span className="text-xs font-semibold text-primary-600">Tap for details →</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                <Cigarette className="w-6 h-6 text-orange-600 mb-2" />
                <p className="text-2xl font-bold text-orange-900">{currentWeekPlan?.cigarettesAllowed || 0}</p>
                <p className="text-sm text-orange-700">Cigarettes</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                <Wind className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-blue-900">{currentWeekPlan?.vapesAllowed || 0}</p>
                <p className="text-sm text-blue-700">Vapes</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <TrendingDown className="w-4 h-4 text-green-600" />
              <span>
                {quitPlan?.reductionFrequency === 'daily'
                  ? `Reducing daily (${quitPlan?.reductionMethod === 'linear' ? 'steady' : 'faster'})`
                  : 'Reducing gradually each week'
                }
              </span>
            </div>
          </button>
        </div>
            )
          }
          
          if (componentId === 'notifications') {
            return (
              <div key="notifications">
        {notificationPermission === 'denied' && (
          <button
            onClick={() => setShowInstructions(true)}
            className="card bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-400 hover:shadow-2xl transition-all active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-400 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-800">⚠️ Notifications Blocked</h3>
                <p className="text-sm text-gray-600">Tap for instructions to enable</p>
              </div>
            </div>
          </button>
        )}

        {notificationPermission === 'default' && (
          <button
            onClick={handleTestNotification}
            disabled={isRequestingPermission}
            className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 hover:shadow-2xl transition-all active:scale-95 animate-pulse disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                {isRequestingPermission ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Bell className="w-6 h-6 text-white animate-bounce" />
                )}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-800 text-lg">
                  {isRequestingPermission ? 'Requesting Permission...' : '🔔 TAP HERE to Enable Notifications'}
                </h3>
                <p className="text-sm text-gray-600 font-semibold">
                  {isRequestingPermission ? 'Please check your browser prompt' : 'Required for smoke/vape reminders'}
                </p>
              </div>
            </div>
          </button>
        )}

        {notificationPermission === 'granted' && !storage.hasNotificationBeenTested() && (
          <button
            onClick={handleTestNotification}
            className="card bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 hover:shadow-2xl transition-all active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-800">✅ Test Notification</h3>
                <p className="text-sm text-gray-600">Tap to send a test notification</p>
              </div>
            </div>
          </button>
        )}
              </div>
            )
          }
          
          return null
        })}
      </div>

      {/* Debug Modal */}
      {showDebug && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Notification Debug</h2>
              <button
                onClick={() => setShowDebug(false)}
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
              >
                ✕
              </button>
            </div>
            <NotificationDebug />
          </div>
        </div>
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Enable Notifications
              </h3>
            </div>
            
            <div className="space-y-4 text-left">
              <p className="text-gray-700">
                Notifications are currently <strong>blocked</strong> in Chrome. Follow these steps:
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                  <div>
                    <p className="font-semibold text-gray-800">Tap the lock icon</p>
                    <p className="text-sm text-gray-600">In the address bar at the top</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                  <div>
                    <p className="font-semibold text-gray-800">Find "Notifications"</p>
                    <p className="text-sm text-gray-600">In the permissions list</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                  <div>
                    <p className="font-semibold text-gray-800">Change to "Allow"</p>
                    <p className="text-sm text-gray-600">Tap and select "Allow"</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">4</div>
                  <div>
                    <p className="font-semibold text-gray-800">Reload the page</p>
                    <p className="text-sm text-gray-600">Refresh to apply changes</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> You can also enable notifications in Chrome Settings → Site Settings → Notifications
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInstructions(false)}
                className="btn-secondary flex-1"
              >
                Got it
              </button>
              <button
                onClick={() => {
                  setShowInstructions(false)
                  window.location.reload()
                }}
                className="btn-primary flex-1"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Customize Dashboard</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">Reorder and toggle components</p>
              
              {componentOrder.map((componentId, index) => {
                const labels = {
                  vape: 'Vape Session',
                  cigarette: 'Cigarette',
                  weekSummary: "This Week's Plan",
                  notifications: 'Notifications'
                }
                
                return (
                  <div key={componentId} className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{labels[componentId]}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newVisibility = { ...componentVisibility, [componentId]: !componentVisibility[componentId] }
                          setComponentVisibility(newVisibility)
                          storage.saveDashboardVisibility(newVisibility)
                          showToastNotification('✅ Visibility updated!')
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                        title={componentVisibility[componentId] ? 'Hide' : 'Show'}
                      >
                        {componentVisibility[componentId] ? (
                          <Eye className="w-5 h-5 text-green-600" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if (index === 0) return
                          const newOrder = [...componentOrder]
                          ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
                          setComponentOrder(newOrder)
                          storage.saveDashboardOrder(newOrder)
                          showToastNotification('✅ Order updated!')
                        }}
                        disabled={index === 0}
                        className={`p-2 rounded-lg transition-all ${
                          index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200'
                        }`}
                      >
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      </button>

                      <button
                        onClick={() => {
                          if (index === componentOrder.length - 1) return
                          const newOrder = [...componentOrder]
                          ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
                          setComponentOrder(newOrder)
                          storage.saveDashboardOrder(newOrder)
                          showToastNotification('✅ Order updated!')
                        }}
                        disabled={index === componentOrder.length - 1}
                        className={`p-2 rounded-lg transition-all ${
                          index === componentOrder.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200'
                        }`}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => {
                const defaultOrder = ['vape', 'cigarette', 'weekSummary', 'notifications']
                const defaultVisibility = { vape: true, cigarette: true, weekSummary: true, notifications: true }
                setComponentOrder(defaultOrder)
                setComponentVisibility(defaultVisibility)
                storage.saveDashboardOrder(defaultOrder)
                storage.saveDashboardVisibility(defaultVisibility)
              }}
              className="btn-secondary w-full mt-6"
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto ${selectedType.type === 'cigarette' ? 'bg-orange-100' : 'bg-blue-100'} rounded-full flex items-center justify-center mb-4`}>
                {selectedType.type === 'cigarette' ? (
                  <Cigarette className="w-8 h-8 text-orange-600" />
                ) : (
                  <Wind className="w-8 h-8 text-blue-600" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {selectedType.isExtraordinary ? '⚠️ Extraordinary Session' : `Confirm ${selectedType.type === 'cigarette' ? 'Cigarette' : 'Vape Session'}`}
              </h3>
              <p className="text-gray-600">
                {selectedType.isExtraordinary 
                  ? `You're logging this ${selectedType.type === 'cigarette' ? 'cigarette' : 'vape session'} outside your schedule. This will be tracked but won't affect your timer.`
                  : `Are you sure you want to log this ${selectedType.type === 'cigarette' ? 'cigarette' : 'vape session'}?`
                }
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedType(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmLog}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                  selectedType.type === 'cigarette' 
                    ? selectedType.isExtraordinary ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'
                    : selectedType.isExtraordinary ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Week Plan Details Modal */}
      {showWeekPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Your Quit Plan</h2>
              <button
                onClick={() => setShowWeekPlanModal(false)}
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Current Week Highlight */}
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 rounded-xl border-2 border-primary-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800">Week {weekNumber + 1} (Current)</h3>
                  <span className="px-2 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">NOW</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <p className="text-xs text-gray-600">Cigarettes</p>
                    <p className="text-lg font-bold text-orange-600">{currentWeekPlan?.cigarettesAllowed || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Vapes</p>
                    <p className="text-lg font-bold text-blue-600">{currentWeekPlan?.vapesAllowed || 0}</p>
                  </div>
                </div>
              </div>

              {/* Next 3 Weeks Preview */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700 text-sm">Upcoming Weeks</h3>
                {quitPlan?.weeks?.slice(weekNumber + 1, weekNumber + 4).map((week, index) => (
                  <div key={week.weekNumber} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-700">Week {week.weekNumber + 1}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(week.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <Cigarette className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-bold text-gray-800">{week.cigarettesAllowed}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-bold text-gray-800">{week.vapesAllowed}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Summary */}
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <h3 className="font-bold text-green-800 mb-2">Your Progress</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total weeks:</span>
                    <span className="font-bold text-gray-800">{quitPlan?.totalWeeks || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Weeks completed:</span>
                    <span className="font-bold text-green-600">{weekNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Weeks remaining:</span>
                    <span className="font-bold text-primary-600">{Math.max(0, (quitPlan?.totalWeeks || 0) - weekNumber - 1)}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowWeekPlanModal(false)}
              className="btn-primary w-full mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Smoke-Free Confirmation Modal */}
      {showSmokeFreeConfirmation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-green-400">
            <div className="text-center">
              <div className="text-8xl mb-6 animate-bounce">🎊</div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Incredible Achievement!
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                You've officially completed your quit smoking journey. This is a huge milestone that will improve your health, save you money, and give you freedom.
              </p>
              
              <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
                <h3 className="font-bold text-gray-800 mb-4 text-xl">Your Journey Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">📅 Weeks to quit:</span>
                    <span className="font-bold text-green-600">{quitPlan?.totalWeeks - 1 || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">🚬 Started with:</span>
                    <span className="font-bold text-gray-800">
                      {quitPlan?.originalCigarettesPerWeek || 0} cigs + {quitPlan?.originalVapesPerWeek || 0} vapes/week
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">📝 Total logs:</span>
                    <span className="font-bold text-blue-600">{logs.length}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6 italic">
                "The greatest glory in living lies not in never falling, but in rising every time we fall." - Nelson Mandela
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowSmokeFreeConfirmation(false)
                    onNavigate('achievements')
                  }}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all active:scale-95 shadow-lg"
                >
                  🏆 View My Achievements
                </button>
                <button
                  onClick={() => setShowSmokeFreeConfirmation(false)}
                  className="w-full py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all border-2 border-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top">
          <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2">
            <span className="font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
