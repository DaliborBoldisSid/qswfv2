// Verification script for quit plan calculations

const data = {
  weeks: [
    {w: 0, total: 270, cigs: 20, vapes: 250, waitCigs: 336, waitVapes: 26},
    {w: 1, total: 257, cigs: 19, vapes: 238, waitCigs: 353, waitVapes: 28},
    {w: 2, total: 243, cigs: 18, vapes: 225, waitCigs: 373, waitVapes: 29},
    {w: 10, total: 135, cigs: 10, vapes: 125, waitCigs: 672, waitVapes: 53},
    {w: 19, total: 13, cigs: 1, vapes: 12, waitCigs: 6720, waitVapes: 560},
  ],
};

const cigPct = 20/270;
const vapePct = 250/270;
const reductionPerWeek = 13.5;

console.log('=== QUIT PLAN VERIFICATION ===\n');

let allCorrect = true;

data.weeks.forEach(({w, total, cigs, vapes, waitCigs, waitVapes}) => {
  const expectedTotal = 270 - (reductionPerWeek * w);
  const expectedCigs = Math.round(expectedTotal * cigPct);
  const expectedVapes = Math.round(expectedTotal * vapePct);
  const expectedWaitCigs = expectedCigs > 0 ? Math.floor(6720 / expectedCigs) : 0;
  const expectedWaitVapes = expectedVapes > 0 ? Math.floor(6720 / expectedVapes) : 0;
  
  const totalMatch = total === Math.round(expectedTotal);
  const cigsMatch = cigs === expectedCigs;
  const vapesMatch = vapes === expectedVapes;
  const waitCigsMatch = waitCigs === expectedWaitCigs;
  const waitVapesMatch = waitVapes === expectedWaitVapes;
  
  console.log(`Week ${w}:`);
  console.log(`  Total: ${total} vs ${Math.round(expectedTotal)} ${totalMatch ? '✓' : '✗'}`);
  console.log(`  Cigs: ${cigs} vs ${expectedCigs} ${cigsMatch ? '✓' : '✗'}`);
  console.log(`  Vapes: ${vapes} vs ${expectedVapes} ${vapesMatch ? '✓' : '✗'}`);
  console.log(`  Wait Cigs: ${waitCigs} vs ${expectedWaitCigs} ${waitCigsMatch ? '✓' : '✗'}`);
  console.log(`  Wait Vapes: ${waitVapes} vs ${expectedWaitVapes} ${waitVapesMatch ? '✓' : '✗'}`);
  console.log();
  
  if (!totalMatch || !cigsMatch || !vapesMatch || !waitCigsMatch || !waitVapesMatch) {
    allCorrect = false;
  }
});

// Check when it reaches 0
const weeksToZero = Math.ceil(270 / 13.5);
console.log(`Expected weeks to reach 0: ${weeksToZero}`);
console.log(`Your plan has: 21 weeks (week 20 = 0)`);
console.log(`270 / 13.5 = ${270/13.5} weeks\n`);

console.log(`\n=== RESULT: ${allCorrect ? 'ALL CALCULATIONS CORRECT ✓' : 'ERRORS FOUND ✗'} ===`);
