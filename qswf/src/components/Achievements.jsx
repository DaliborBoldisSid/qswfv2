import { ArrowLeft, Trophy, Lock } from 'lucide-react'
import { ACHIEVEMENTS, calculateStats } from '../utils/achievements'

const Achievements = ({ unlockedAchievements, userData, quitPlan, logs, onBack }) => {
  const unlockedIds = unlockedAchievements.map(a => a.id)
  const currencySymbol = userData?.currency === 'EUR' ? '€' : '$'
  const stats = calculateStats(logs, quitPlan, userData)

  // Replace $ with user's currency in achievement descriptions
  const formatDescription = (description) => {
    return description.replace(/\$/g, currencySymbol)
  }

  // Calculate progress for locked achievements
  const getAchievementProgress = (achievement) => {
    const conditionStr = achievement.condition.toString()

    // Extract target values from condition
    if (conditionStr.includes('totalLogged >= ')) {
      const target = parseInt(conditionStr.match(/totalLogged >= (\d+)/)?.[1] || 0)
      return { current: stats.totalLogged, target, type: 'sessions' }
    }
    if (conditionStr.includes('daysActive >= ')) {
      const target = parseInt(conditionStr.match(/daysActive >= (\d+)/)?.[1] || 0)
      return { current: stats.daysActive, target, type: 'days' }
    }
    if (conditionStr.includes('reductionPercentage >= ')) {
      const target = parseInt(conditionStr.match(/reductionPercentage >= (\d+)/)?.[1] || 0)
      return { current: stats.reductionPercentage, target, type: 'reduction' }
    }
    if (conditionStr.includes('moneySaved >= ')) {
      const target = parseInt(conditionStr.match(/moneySaved >= (\d+)/)?.[1] || 0)
      return { current: stats.moneySaved, target, type: 'money' }
    }
    if (conditionStr.includes('currentStreak >= ')) {
      const target = parseInt(conditionStr.match(/currentStreak >= (\d+)/)?.[1] || 0)
      return { current: stats.currentStreak, target, type: 'streak' }
    }

    return null
  }

  // Sort achievements: unlocked first, then by proximity to unlocking
  const sortedAchievements = [...ACHIEVEMENTS].sort((a, b) => {
    const aUnlocked = unlockedIds.includes(a.id)
    const bUnlocked = unlockedIds.includes(b.id)

    // Unlocked achievements first
    if (aUnlocked && !bUnlocked) return -1
    if (!aUnlocked && bUnlocked) return 1

    // For locked achievements, sort by progress (closest to unlocking first)
    if (!aUnlocked && !bUnlocked) {
      const aProgress = getAchievementProgress(a)
      const bProgress = getAchievementProgress(b)

      if (aProgress && bProgress) {
        const aPercent = (aProgress.current / aProgress.target) * 100
        const bPercent = (bProgress.current / bProgress.target) * 100
        return bPercent - aPercent // Higher progress first
      }
    }

    return 0
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-blue-500 to-purple-600 pb-20">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg p-4 text-white sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Achievements</h1>
              <p className="text-sm text-white/80">
                {unlockedAchievements.length} of {ACHIEVEMENTS.length} unlocked
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-300" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-3">
        {/* Progress Bar */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-primary-600">
              {Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-blue-500 transition-all duration-500"
              style={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Achievements Grid */}
        {sortedAchievements.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id)
          const unlockedData = unlockedAchievements.find(a => a.id === achievement.id)
          const progress = !isUnlocked ? getAchievementProgress(achievement) : null

          return (
            <div
              key={achievement.id}
              className={`card transition-all ${
                isUnlocked
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300'
                  : 'bg-white/50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl flex-shrink-0 ${
                    isUnlocked
                      ? 'bg-yellow-100'
                      : 'bg-gray-200'
                  }`}
                >
                  {isUnlocked ? achievement.icon : <Lock className="w-6 h-6 text-gray-400" />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                    {formatDescription(achievement.description)}
                  </p>
                  {isUnlocked && unlockedData && (
                    <p className="text-xs text-yellow-700 mt-2">
                      Unlocked {new Date(unlockedData.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                  {!isUnlocked && progress && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">
                          Progress: {progress.current}/{progress.target}
                          {progress.type === 'days' && ' days'}
                          {progress.type === 'sessions' && ' sessions'}
                          {progress.type === 'reduction' && '%'}
                          {progress.type === 'streak' && ' days'}
                          {progress.type === 'money' && ` ${currencySymbol}`}
                        </span>
                        <span className="font-semibold text-gray-700">
                          {Math.min(100, Math.round((progress.current / progress.target) * 100))}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-blue-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, (progress.current / progress.target) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Achievements
