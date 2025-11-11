// Verify that the plateau fix works for slow compound reduction
import { generateQuitPlan } from '../src/utils/quittingLogic.js';

console.log('='.repeat(80));
console.log('PLATEAU FIX VERIFICATION TEST');
console.log('='.repeat(80));
console.log();

// Test with the user's exact scenario
const config = {
  cigarettesPerWeek: 20,
  vapesPerWeek: 250,
  planSpeed: 'slow',
  reductionFrequency: 'weekly',
  reductionMethod: 'compound',
  adaptiveMode: true
};

console.log('Testing scenario:');
console.log(`- ${config.cigarettesPerWeek} cigarettes/week, ${config.vapesPerWeek} vapes/week`);
console.log(`- ${config.planSpeed} pace, ${config.reductionMethod} ${config.reductionFrequency}`);
console.log();

const plan = generateQuitPlan(config);

// Check for plateaus (consecutive weeks with same total)
let plateausFound = [];
for (let i = 1; i < plan.weeks.length; i++) {
  const prevWeek = plan.weeks[i - 1];
  const currWeek = plan.weeks[i];
  
  if (prevWeek.totalAllowed === currWeek.totalAllowed && currWeek.totalAllowed > 0) {
    plateausFound.push({
      week: i,
      value: currWeek.totalAllowed
    });
  }
}

console.log('📊 PLAN ANALYSIS:');
console.log(`   Total duration: ${plan.totalWeeks} weeks`);
console.log(`   Start: ${plan.weeks[0].totalAllowed} total (${plan.weeks[0].cigarettesAllowed} cigs, ${plan.weeks[0].vapesAllowed} vapes)`);
console.log(`   End: ${plan.weeks[plan.weeks.length - 1].totalAllowed} total`);
console.log();

// Show last 15 weeks to verify no plateaus
console.log('📅 LAST 15 WEEKS (checking for plateaus):');
const last15 = plan.weeks.slice(-16, -1); // Exclude the final 0 week
last15.forEach((week, idx) => {
  const weekNum = week.weekNumber;
  const isPlateau = plateausFound.some(p => p.week === weekNum);
  const marker = isPlateau ? '⚠️ PLATEAU' : '✓';
  console.log(`   Week ${weekNum}: ${week.totalAllowed} total (${week.cigarettesAllowed} cigs, ${week.vapesAllowed} vapes) ${marker}`);
});
console.log();

// Test result
if (plateausFound.length === 0) {
  console.log('✅ SUCCESS: No plateaus found! Each week makes progress.');
  console.log(`   Plan completes in ${plan.totalWeeks} weeks`);
} else {
  console.log(`❌ FAILURE: Found ${plateausFound.length} plateau(s):`);
  plateausFound.slice(0, 10).forEach(p => {
    console.log(`   Week ${p.week}: stuck at ${p.value}`);
  });
  if (plateausFound.length > 10) {
    console.log(`   ... and ${plateausFound.length - 10} more`);
  }
}
console.log();
console.log('='.repeat(80));
