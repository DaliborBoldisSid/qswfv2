// Test to verify the last week calculation is fixed
import { generateQuitPlan } from '../src/utils/quittingLogic.js';

console.log('Testing final week calculation...\n');

const config = {
  cigarettesPerWeek: 20,
  vapesPerWeek: 250,
  planSpeed: 'medium',
  reductionFrequency: 'weekly',
  reductionMethod: 'compound',
  adaptiveMode: false
};

const plan = generateQuitPlan(config);

console.log(`Total weeks: ${plan.totalWeeks}`);
console.log('\nLast 5 weeks:');

const last5 = plan.weeks.slice(-5);
last5.forEach(week => {
  const sum = week.cigarettesAllowed + week.vapesAllowed;
  const match = sum === week.totalAllowed ? '✓' : '✗';
  console.log(`Week ${week.weekNumber}: total=${week.totalAllowed}, cigs=${week.cigarettesAllowed}, vapes=${week.vapesAllowed}, sum=${sum} ${match}`);
});

// Check for consistency
let errors = 0;
for (let i = 0; i < plan.weeks.length; i++) {
  const week = plan.weeks[i];
  const sum = week.cigarettesAllowed + week.vapesAllowed;
  if (sum !== week.totalAllowed) {
    console.log(`\n❌ ERROR at week ${week.weekNumber}: ${week.cigarettesAllowed} + ${week.vapesAllowed} = ${sum}, but totalAllowed is ${week.totalAllowed}`);
    errors++;
  }
}

// Check for duplicate 0 weeks
let zeroWeeks = plan.weeks.filter(w => w.totalAllowed === 0);
if (zeroWeeks.length > 1) {
  console.log(`\n❌ ERROR: Found ${zeroWeeks.length} weeks with totalAllowed = 0 (should be only 1)`);
  zeroWeeks.forEach(w => console.log(`   Week ${w.weekNumber}: total=${w.totalAllowed}`));
  errors++;
} else if (zeroWeeks.length === 1) {
  console.log('\n✅ Exactly one week with totalAllowed = 0 (correct!)');
}

if (errors === 0) {
  console.log('✅ All weeks are consistent!');
} else {
  console.log(`\n❌ Found ${errors} issue(s)`);
}
