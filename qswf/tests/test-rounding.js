// Test JavaScript rounding behavior

console.log('Math.round(13.5):', Math.round(13.5));
console.log('Math.round(14.5):', Math.round(14.5));
console.log('Math.round(256.5):', Math.round(256.5));
console.log('Math.round(257.5):', Math.round(257.5));

// Test the specific calculation
const current = 13.5;
const cigPct = 20/270;
const vapePct = 250/270;

console.log('\nFor currentTotal = 13.5:');
console.log('cigPct * 13.5 =', current * cigPct);
console.log('Math.round(cigPct * 13.5) =', Math.round(current * cigPct));
console.log('vapePct * 13.5 =', current * vapePct);
console.log('Math.round(vapePct * 13.5) =', Math.round(current * vapePct));
console.log('Sum =', Math.round(current * cigPct) + Math.round(current * vapePct));
