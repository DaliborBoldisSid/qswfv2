// Simulate the actual loop from quittingLogic.js

const cigarettesPerWeek = 20;
const vapesPerWeek = 250;
const totalPerWeek = cigarettesPerWeek + vapesPerWeek;
const cigPercentage = cigarettesPerWeek / totalPerWeek;
const vapePercentage = vapesPerWeek / totalPerWeek;
const reductionRate = 0.05;

let currentTotal = totalPerWeek;
let weekNumber = 0;

console.log('=== Simulating Actual Loop ===\n');

const dailyReduction = totalPerWeek * (reductionRate / 7);
console.log(`Daily reduction: ${dailyReduction}`);
console.log(`Weekly reduction: ${dailyReduction * 7}\n`);

while (currentTotal > 0.5 && weekNumber <= 20) {
  const cigarettesThisWeek = Math.round(currentTotal * cigPercentage);
  const vapesThisWeek = Math.round(currentTotal * vapePercentage);
  const totalAllowed = Math.round(currentTotal);
  const sum = cigarettesThisWeek + vapesThisWeek;
  
  if (sum !== totalAllowed) {
    console.log(`⚠️  Week ${weekNumber}: currentTotal=${currentTotal.toFixed(4)}, totalAllowed=${totalAllowed}, cigs=${cigarettesThisWeek}, vapes=${vapesThisWeek}, sum=${sum} - MISMATCH!`);
  } else if (weekNumber <= 5 || weekNumber === 10 || weekNumber === 19) {
    console.log(`✓  Week ${weekNumber}: currentTotal=${currentTotal.toFixed(4)}, totalAllowed=${totalAllowed}, cigs=${cigarettesThisWeek}, vapes=${vapesThisWeek}, sum=${sum}`);
  }
  
  // Apply linear daily reduction
  currentTotal = currentTotal - (dailyReduction * 7);
  weekNumber++;
  
  if (weekNumber > 100) break; // Safety
}

console.log(`\nFinal week: ${weekNumber}, currentTotal: ${currentTotal}`);
