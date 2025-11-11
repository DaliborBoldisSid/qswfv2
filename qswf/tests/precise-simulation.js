// More precise simulation to check floating point errors

const cigarettesPerWeek = 20;
const vapesPerWeek = 250;
const totalPerWeek = cigarettesPerWeek + vapesPerWeek;
const cigPercentage = cigarettesPerWeek / totalPerWeek;
const vapePercentage = vapesPerWeek / totalPerWeek;
const reductionRate = 0.05;

let currentTotal = totalPerWeek;
let weekNumber = 0;

const dailyReduction = totalPerWeek * (reductionRate / 7);

console.log('Week | currentTotal (exact) | totalAllowed | cigs | vapes | sum | match');
console.log('-----|---------------------|--------------|------|-------|-----|------');

while (currentTotal > 0.5 && weekNumber <= 20) {
  const cigarettesThisWeek = Math.round(currentTotal * cigPercentage);
  const vapesThisWeek = Math.round(currentTotal * vapePercentage);
  const totalAllowed = Math.round(currentTotal);
  const sum = cigarettesThisWeek + vapesThisWeek;
  const match = sum === totalAllowed ? '✓' : '✗';
  
  console.log(`${weekNumber.toString().padStart(4)} | ${currentTotal.toFixed(15).padEnd(19)} | ${totalAllowed.toString().padStart(12)} | ${cigarettesThisWeek.toString().padStart(4)} | ${vapesThisWeek.toString().padStart(5)} | ${sum.toString().padStart(3)} | ${match}`);
  
  // Apply linear daily reduction
  currentTotal = currentTotal - (dailyReduction * 7);
  weekNumber++;
  
  if (weekNumber > 100) break;
}
