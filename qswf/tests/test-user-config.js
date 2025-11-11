// Test with exact user configuration
import { generateQuitPlan } from '../src/utils/quittingLogic.js';

console.log('Testing user configuration...\n');

const config = {
  cigarettesPerWeek: 20,
  vapesPerWeek: 250,
  planSpeed: 'medium',
  reductionFrequency: 'weekly',
  reductionMethod: 'compound',
  adaptiveMode: false
};

console.log('Config:', JSON.stringify(config, null, 2));
console.log();

const plan = generateQuitPlan(config);

console.log(`Total weeks: ${plan.totalWeeks}`);
console.log('\nLast 5 weeks:');

const last5 = plan.weeks.slice(-5);
last5.forEach(week => {
  const sum = week.cigarettesAllowed + week.vapesAllowed;
  const match = sum === week.totalAllowed ? '✓' : '✗';
  console.log(`Week ${week.weekNumber}: total=${week.totalAllowed}, cigs=${week.cigarettesAllowed}, vapes=${week.vapesAllowed}, sum=${sum} ${match}`);
});

// Check for duplicate 0 weeks
const zeroWeeks = plan.weeks.filter(w => w.totalAllowed === 0);
console.log(`\nWeeks with totalAllowed = 0: ${zeroWeeks.length}`);
if (zeroWeeks.length > 1) {
  console.log('❌ ERROR: Multiple 0 weeks found:');
  zeroWeeks.forEach(w => console.log(`   Week ${w.weekNumber}`));
} else {
  console.log('✅ Correct: Only one 0 week');
}
