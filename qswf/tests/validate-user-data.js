// Validate user's complete quit plan data

const userWeeks = [
  {w: 0, total: 270, cigs: 20, vapes: 250, waitCigs: 336, waitVapes: 26},
  {w: 1, total: 257, cigs: 19, vapes: 238, waitCigs: 353, waitVapes: 28},
  {w: 2, total: 243, cigs: 18, vapes: 225, waitCigs: 373, waitVapes: 29},
  {w: 3, total: 230, cigs: 17, vapes: 213, waitCigs: 395, waitVapes: 31},
  {w: 4, total: 216, cigs: 16, vapes: 200, waitCigs: 420, waitVapes: 33},
  {w: 5, total: 203, cigs: 15, vapes: 188, waitCigs: 448, waitVapes: 35},
  {w: 6, total: 189, cigs: 14, vapes: 175, waitCigs: 480, waitVapes: 38},
  {w: 7, total: 176, cigs: 13, vapes: 163, waitCigs: 516, waitVapes: 41},
  {w: 8, total: 162, cigs: 12, vapes: 150, waitCigs: 560, waitVapes: 44},
  {w: 9, total: 149, cigs: 11, vapes: 138, waitCigs: 610, waitVapes: 48},
  {w: 10, total: 135, cigs: 10, vapes: 125, waitCigs: 672, waitVapes: 53},
  {w: 11, total: 122, cigs: 9, vapes: 113, waitCigs: 746, waitVapes: 59},
  {w: 12, total: 108, cigs: 8, vapes: 100, waitCigs: 840, waitVapes: 67},
  {w: 13, total: 95, cigs: 7, vapes: 88, waitCigs: 960, waitVapes: 76},
  {w: 14, total: 81, cigs: 6, vapes: 75, waitCigs: 1120, waitVapes: 89},
  {w: 15, total: 68, cigs: 5, vapes: 63, waitCigs: 1344, waitVapes: 106},
  {w: 16, total: 54, cigs: 4, vapes: 50, waitCigs: 1680, waitVapes: 134},
  {w: 17, total: 41, cigs: 3, vapes: 38, waitCigs: 2240, waitVapes: 176},
  {w: 18, total: 27, cigs: 2, vapes: 25, waitCigs: 3360, waitVapes: 268},
  {w: 19, total: 13, cigs: 1, vapes: 12, waitCigs: 6720, waitVapes: 560},
  {w: 20, total: 0, cigs: 0, vapes: 0, waitCigs: 0, waitVapes: 0}
];

// Run simulation
const cigarettesPerWeek = 20;
const vapesPerWeek = 250;
const totalPerWeek = cigarettesPerWeek + vapesPerWeek;
const cigPercentage = cigarettesPerWeek / totalPerWeek;
const vapePercentage = vapesPerWeek / totalPerWeek;
const reductionRate = 0.05;

let currentTotal = totalPerWeek;
const dailyReduction = totalPerWeek * (reductionRate / 7);

console.log('=== COMPLETE VALIDATION ===\n');
let allMatch = true;

for (let weekNumber = 0; weekNumber <= 20; weekNumber++) {
  const userData = userWeeks.find(w => w.w === weekNumber);
  
  const cigarettesThisWeek = Math.round(currentTotal * cigPercentage);
  const vapesThisWeek = Math.round(currentTotal * vapePercentage);
  const totalAllowed = Math.round(currentTotal);
  const waitCigs = cigarettesThisWeek > 0 ? Math.floor(6720 / cigarettesThisWeek) : 0;
  const waitVapes = vapesThisWeek > 0 ? Math.floor(6720 / vapesThisWeek) : 0;
  
  const match = (
    userData.total === totalAllowed &&
    userData.cigs === cigarettesThisWeek &&
    userData.vapes === vapesThisWeek &&
    userData.waitCigs === waitCigs &&
    userData.waitVapes === waitVapes
  );
  
  if (!match) {
    console.log(`❌ Week ${weekNumber}:`);
    console.log(`   Expected: total=${totalAllowed}, cigs=${cigarettesThisWeek}, vapes=${vapesThisWeek}, waitC=${waitCigs}, waitV=${waitVapes}`);
    console.log(`   Got:      total=${userData.total}, cigs=${userData.cigs}, vapes=${userData.vapes}, waitC=${userData.waitCigs}, waitV=${userData.waitVapes}`);
    allMatch = false;
  }
  
  currentTotal = currentTotal - (dailyReduction * 7);
  if (currentTotal < 0) currentTotal = 0;
}

console.log(`\n=== RESULT: ${allMatch ? '✅ ALL DATA MATCHES PERFECTLY' : '❌ DISCREPANCIES FOUND'} ===`);

// Check consistency
console.log('\n=== INTERNAL CONSISTENCY CHECK ===\n');
let consistencyIssues = 0;

userWeeks.forEach(({w, total, cigs, vapes}) => {
  const sum = cigs + vapes;
  if (sum !== total && total !== 0) {
    console.log(`⚠️  Week ${w}: total=${total}, but cigs(${cigs}) + vapes(${vapes}) = ${sum}`);
    consistencyIssues++;
  }
});

if (consistencyIssues === 0) {
  console.log('✅ All weeks are internally consistent (cigs + vapes = total)');
} else {
  console.log(`\n❌ Found ${consistencyIssues} consistency issues`);
}
