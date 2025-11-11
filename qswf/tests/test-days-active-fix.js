// Test to verify the Days Active fix
import { calculateStats } from '../src/utils/achievements.js'

console.log('Testing Days Active Fix\n')
console.log('='.repeat(60))

// Test Case 1: User just started (2 hours ago)
const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000)

const mockQuitPlan1 = {
  startDate: new Date(twoHoursAgo).toISOString(),
  originalCigarettesPerWeek: 0,
  originalVapesPerWeek: 20,
  weeks: [
    { weekNumber: 1, cigarettesAllowed: 0, vapesAllowed: 20, totalAllowed: 20 }
  ]
}

const mockUserData = {
  cigarettePrice: 8,
  vapePrice: 15
}

console.log('\n📊 Test Case 1: User logged 1 vape just 2 hours after starting')
console.log('   Time since start: 2 hours')
console.log('   Logged: 1 vape')

const logs1 = [
  { type: 'vape', timestamp: Date.now() }
]

const stats1 = calculateStats(logs1, mockQuitPlan1, mockUserData)

console.log('\n   Results:')
console.log(`   ✓ Days Active: ${stats1.daysActive} (should be 1)`)
console.log(`   ✓ Vapes Logged: ${stats1.vapesLogged}`)

// Test Case 2: User active for exactly 1 day
const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)

const mockQuitPlan2 = {
  startDate: new Date(oneDayAgo).toISOString(),
  originalCigarettesPerWeek: 0,
  originalVapesPerWeek: 20,
  weeks: [
    { weekNumber: 1, cigarettesAllowed: 0, vapesAllowed: 20, totalAllowed: 20 }
  ]
}

console.log('\n📊 Test Case 2: User logged vapes over 1 complete day')
console.log('   Time since start: 24 hours')
console.log('   Logged: 3 vapes')

const logs2 = [
  { type: 'vape', timestamp: oneDayAgo },
  { type: 'vape', timestamp: oneDayAgo + (8 * 60 * 60 * 1000) },
  { type: 'vape', timestamp: Date.now() }
]

const stats2 = calculateStats(logs2, mockQuitPlan2, mockUserData)

console.log('\n   Results:')
console.log(`   ✓ Days Active: ${stats2.daysActive} (should be 1)`)
console.log(`   ✓ Vapes Logged: ${stats2.vapesLogged}`)

// Test Case 3: User active for 5 days
const fiveDaysAgo = Date.now() - (5 * 24 * 60 * 60 * 1000)

const mockQuitPlan3 = {
  startDate: new Date(fiveDaysAgo).toISOString(),
  originalCigarettesPerWeek: 0,
  originalVapesPerWeek: 20,
  weeks: [
    { weekNumber: 1, cigarettesAllowed: 0, vapesAllowed: 20, totalAllowed: 20 }
  ]
}

console.log('\n📊 Test Case 3: User logged vapes over 5 days')
console.log('   Time since start: 5 days')
console.log('   Logged: 10 vapes')

const logs3 = Array(10).fill(null).map((_, i) => ({
  type: 'vape',
  timestamp: fiveDaysAgo + (i * 12 * 60 * 60 * 1000)
}))

const stats3 = calculateStats(logs3, mockQuitPlan3, mockUserData)

console.log('\n   Results:')
console.log(`   ✓ Days Active: ${stats3.daysActive} (should be 5)`)
console.log(`   ✓ Vapes Logged: ${stats3.vapesLogged}`)

// Test Case 4: User started but hasn't logged anything yet
console.log('\n📊 Test Case 4: User started but no logs yet')
console.log('   Time since start: 2 hours')
console.log('   Logged: 0 vapes')

const logs4 = []

const stats4 = calculateStats(logs4, mockQuitPlan1, mockUserData)

console.log('\n   Results:')
console.log(`   ✓ Days Active: ${stats4.daysActive} (should be 0)`)
console.log(`   ✓ Vapes Logged: ${stats4.vapesLogged}`)

// Test Case 5: User active for 1.5 days
const oneAndHalfDaysAgo = Date.now() - (36 * 60 * 60 * 1000)

const mockQuitPlan5 = {
  startDate: new Date(oneAndHalfDaysAgo).toISOString(),
  originalCigarettesPerWeek: 0,
  originalVapesPerWeek: 20,
  weeks: [
    { weekNumber: 1, cigarettesAllowed: 0, vapesAllowed: 20, totalAllowed: 20 }
  ]
}

console.log('\n📊 Test Case 5: User logged vapes over 1.5 days')
console.log('   Time since start: 36 hours (1.5 days)')
console.log('   Logged: 2 vapes')

const logs5 = [
  { type: 'vape', timestamp: oneAndHalfDaysAgo },
  { type: 'vape', timestamp: Date.now() }
]

const stats5 = calculateStats(logs5, mockQuitPlan5, mockUserData)

console.log('\n   Results:')
console.log(`   ✓ Days Active: ${stats5.daysActive} (should be 1, rounds down from 1.5)`)
console.log(`   ✓ Vapes Logged: ${stats5.vapesLogged}`)

// Summary
console.log('\n' + '='.repeat(60))
console.log('\n✅ FIX VERIFICATION SUMMARY:')
console.log('   • With logs < 1 day: Shows 1 day active ✓')
console.log('   • With logs = 1 day: Shows 1 day active ✓')
console.log('   • With logs > 1 day: Shows correct day count ✓')
console.log('   • No logs: Shows 0 days active ✓')

const allTestsPass =
  stats1.daysActive === 1 && // 2 hours should show 1
  stats2.daysActive === 1 && // 24 hours should show 1
  stats3.daysActive === 5 && // 5 days should show 5
  stats4.daysActive === 0 && // No logs should show 0
  stats5.daysActive === 1    // 1.5 days floors to 1

if (allTestsPass) {
  console.log('\n🎉 All Days Active tests passed!\n')
} else {
  console.log('\n❌ Some tests failed:')
  console.log(`   Test 1 (2 hours): ${stats1.daysActive === 1 ? '✓' : '✗'} Expected 1, got ${stats1.daysActive}`)
  console.log(`   Test 2 (1 day): ${stats2.daysActive === 1 ? '✓' : '✗'} Expected 1, got ${stats2.daysActive}`)
  console.log(`   Test 3 (5 days): ${stats3.daysActive === 5 ? '✓' : '✗'} Expected 5, got ${stats3.daysActive}`)
  console.log(`   Test 4 (no logs): ${stats4.daysActive === 0 ? '✓' : '✗'} Expected 0, got ${stats4.daysActive}`)
  console.log(`   Test 5 (1.5 days): ${stats5.daysActive === 1 ? '✓' : '✗'} Expected 1, got ${stats5.daysActive}`)
  console.log()
}
