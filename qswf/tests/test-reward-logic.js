// Test reward message logic
import { calculateDelayReward } from '../src/utils/adaptivePlan.js';
import { generateQuitPlan } from '../src/utils/quittingLogic.js';

console.log('Testing reward message logic...\n');

const quitPlan = generateQuitPlan({
  cigarettesPerWeek: 20,
  vapesPerWeek: 250,
  planSpeed: 'medium',
  reductionFrequency: 'weekly',
  reductionMethod: 'compound',
  adaptiveMode: true
});

console.log('Scenario 1: New user with 1 log');
const logs1 = [
  { type: 'vape', timestamp: Date.now() - 1000 }
];
const reward1 = calculateDelayReward(logs1, quitPlan);
console.log(`Result: ${reward1.hasReward ? 'SHOW reward' : 'NO reward'}`);
console.log(`Expected: NO reward (too few logs)\n`);

console.log('Scenario 2: New user with 2 logs (just logged extraordinary)');
const logs2 = [
  { type: 'vape', timestamp: Date.now() - 60000 },
  { type: 'vape', timestamp: Date.now() - 1000 }
];
const reward2 = calculateDelayReward(logs2, quitPlan);
console.log(`Result: ${reward2.hasReward ? 'SHOW reward' : 'NO reward'}`);
console.log(`Expected: NO reward (just logged something)\n`);

console.log('Scenario 3: User with 10 logs, last one 2 hours ago, below target');
const logs3 = [];
for (let i = 0; i < 10; i++) {
  logs3.push({
    type: 'vape',
    timestamp: Date.now() - (2 * 60 * 60 * 1000) - (i * 60 * 60 * 1000) // 2+ hours ago
  });
}
const reward3 = calculateDelayReward(logs3, quitPlan);
console.log(`Result: ${reward3.hasReward ? 'SHOW reward' : 'NO reward'}`);
console.log(`Expected: SHOW reward (good behavior, time has passed)\n`);

console.log('Scenario 4: User with 10 logs, last one 30 mins ago');
const logs4 = [];
for (let i = 0; i < 9; i++) {
  logs4.push({
    type: 'vape',
    timestamp: Date.now() - (2 * 60 * 60 * 1000) - (i * 60 * 60 * 1000)
  });
}
logs4.push({
  type: 'vape',
  timestamp: Date.now() - (30 * 60 * 1000) // 30 mins ago
});
const reward4 = calculateDelayReward(logs4, quitPlan);
console.log(`Result: ${reward4.hasReward ? 'SHOW reward' : 'NO reward'}`);
console.log(`Expected: NO reward (just logged 30 mins ago)\n`);
