import { ArrowLeft, TrendingDown, DollarSign, Calendar, Flame, Cigarette, Wind, Award } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { calculateStats } from '../utils/achievements'
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns'

const Stats = ({ userData, quitPlan, logs, achievements, onBack }) => {
  const stats = calculateStats(logs, quitPlan, userData)
  const currencySymbol = userData?.currency === 'EUR' ? '€' : '$'

  // Prepare weekly data for chart
  const weeklyData = []
  const weeks = Math.min(12, Math.max(1, stats.weeksSinceStart + 1))

  for (let i = 0; i < weeks; i++) {
    const weekStart = new Date(quitPlan?.startDate || Date.now())
    weekStart.setDate(weekStart.getDate() + (i * 7))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const weekLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp)
      return logDate >= weekStart && logDate <= weekEnd
    })

    const weekPlan = quitPlan?.weeks?.[i] || { cigarettesAllowed: 0, vapesAllowed: 0 }

    weeklyData.push({
      week: `W${i + 1}`,
      actual: weekLogs.length || 0,
      target: (weekPlan.cigarettesAllowed || 0) + (weekPlan.vapesAllowed || 0),
      cigarettes: weekLogs.filter(l => l.type === 'cigarette').length || 0,
      vapes: weekLogs.filter(l => l.type === 'vape').length || 0
    })
  }

  // Calculate dynamic Y-axis domain for Weekly Progress chart
  const maxActual = Math.max(...weeklyData.map(d => d.actual), 0)
  const maxTarget = Math.max(...weeklyData.map(d => d.target), 0)

  // Use the higher of: (maxActual + 20% padding) or a minimum of 10
  // This ensures the chart scales appropriately for small values
  const weeklyChartMax = Math.max(
    Math.ceil(maxActual * 1.2),
    10
  )

  // If targets are shown and are reasonably close to actuals, include them in scale
  const shouldIncludeTargets = maxTarget > 0 && maxTarget <= maxActual * 3
  const weeklyYAxisDomain = shouldIncludeTargets
    ? [0, Math.ceil(Math.max(maxActual, maxTarget) * 1.2)]
    : [0, weeklyChartMax]

  // Daily data for last 7 days
  const dailyData = []
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const dayLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp)
      return logDate.toDateString() === date.toDateString()
    })

    dailyData.push({
      day: format(date, 'EEE'),
      count: dayLogs.length,
      cigarettes: dayLogs.filter(l => l.type === 'cigarette').length,
      vapes: dayLogs.filter(l => l.type === 'vape').length
    })
  }

  // Calculate dynamic Y-axis domain for Last 7 Days chart
  const maxDaily = Math.max(...dailyData.map(d => d.count), 0)
  const dailyYAxisDomain = [0, Math.max(Math.ceil(maxDaily * 1.2), 5)]

  // Type distribution - filter out 0% entries
  const typeData = [
    { name: 'Cigarettes', value: stats.cigarettesLogged, color: '#f97316' },
    { name: 'Vapes', value: stats.vapesLogged, color: '#3b82f6' }
  ].filter(item => item.value > 0)

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
              <h1 className="text-2xl font-bold">Your Stats</h1>
              <p className="text-sm text-white/80">Track your progress</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-800">Reduction</span>
            </div>
            <p className="text-3xl font-bold text-green-900">{stats.reductionPercentage}%</p>
          </div>

          <div className="card bg-gradient-to-br from-yellow-50 to-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-800">Saved</span>
            </div>
            <p className="text-3xl font-bold text-yellow-900">{currencySymbol}{stats.moneySaved}</p>
            {stats.moneySaved === 0 && (
              <p className="text-xs text-yellow-700 mt-2">
                💡 Start reducing below target to see savings
              </p>
            )}
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-cyan-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">Days Active</span>
            </div>
            <p className="text-3xl font-bold text-blue-900">{stats.daysActive}</p>
          </div>

          <div className="card bg-gradient-to-br from-orange-50 to-red-100">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-semibold text-orange-800">Streak</span>
            </div>
            <p className="text-3xl font-bold text-orange-900">{stats.currentStreak}</p>
          </div>
        </div>

        {/* Achievement Summary */}
        <div className="card bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-700 font-semibold">Achievements Unlocked</p>
                <p className="text-2xl font-bold text-purple-900">{achievements.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Type Distribution */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Consumption Breakdown</h3>
          <div className="flex items-center justify-between mb-4">
            {stats.cigarettesLogged > 0 && (
              <div className="flex items-center gap-2">
                <Cigarette className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Cigarettes</p>
                  <p className="text-xl font-bold text-gray-800">{stats.cigarettesLogged}</p>
                </div>
              </div>
            )}
            {stats.vapesLogged > 0 && (
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Vapes</p>
                  <p className="text-xl font-bold text-gray-800">{stats.vapesLogged}</p>
                </div>
              </div>
            )}
            {stats.cigarettesLogged === 0 && stats.vapesLogged === 0 && (
              <div className="w-full text-center text-gray-500">
                <p className="text-sm">No consumption logged yet</p>
              </div>
            )}
          </div>
          {typeData.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Last 7 Days Chart */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Last 7 Days</h3>
          {dailyData.filter(d => d.count > 0).length < 3 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-600 text-center font-semibold">Start logging to see trends</p>
              <p className="text-gray-500 text-sm text-center mt-2">Your daily activity will appear here</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={dailyYAxisDomain} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cigarettes" fill="#f97316" name="Cigarettes" />
                <Bar dataKey="vapes" fill="#3b82f6" name="Vapes" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Weekly Progress Chart */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Weekly Progress</h3>
          {weeklyData.filter(d => d.actual > 0).length < 3 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-4">📈</div>
              <p className="text-gray-600 text-center font-semibold">Start logging to see trends</p>
              <p className="text-gray-500 text-sm text-center mt-2">Your weekly progress will appear here</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={weeklyYAxisDomain} allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Target"
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Actual"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-green-500 rounded" style={{ borderStyle: 'dashed' }}></div>
                  <span className="text-gray-600">Target</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-blue-500 rounded"></div>
                  <span className="text-gray-600">Actual</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Milestone Progress */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Your Journey</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">Progress to Quit</span>
                <span className="font-bold text-primary-600">{stats.reductionPercentage}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-green-500 transition-all"
                  style={{ width: `${Math.min(100, stats.reductionPercentage)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Total Logged</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalLogged}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Weeks Active</p>
                <p className="text-2xl font-bold text-gray-800">{stats.weeksSinceStart}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Stats
