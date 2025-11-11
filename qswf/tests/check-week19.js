// Check week 19 specifically

console.log('Week 19 calculation:');
const currentTotal = 270 - (13.5 * 19);
console.log('currentTotal:', currentTotal);

const cigPct = 20/270;
const vapePct = 250/270;

const cigs = Math.round(currentTotal * cigPct);
const vapes = Math.round(currentTotal * vapePct);

console.log('Cigs:', cigs);
console.log('Vapes:', vapes);
console.log('Sum:', cigs + vapes);
console.log('Rounded total:', Math.round(currentTotal));

console.log('\nUser provided data for week 19:');
console.log('Total: 13');
console.log('Cigs: 1');
console.log('Vapes: 12');
console.log('Sum: 13');

console.log('\n=== Checking all weeks for rounding issues ===\n');

for (let w = 0; w <= 20; w++) {
  const ct = 270 - (13.5 * w);
  const c = Math.round(ct * cigPct);
  const v = Math.round(ct * vapePct);
  const total = Math.round(ct);
  const sum = c + v;
  
  if (sum !== total) {
    console.log(`Week ${w}: Total=${total}, Cigs=${c}, Vapes=${v}, Sum=${sum} - MISMATCH!`);
  }
}
