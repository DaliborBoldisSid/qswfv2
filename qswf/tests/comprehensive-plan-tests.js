// Comprehensive automated tests for all quit plan variants
// Tests all combinations of: speed, frequency, method, and adaptive mode

import { generateQuitPlan } from '../src/utils/quittingLogic.js';

// Test configuration
const BASE_CONFIG = {
  cigarettesPerWeek: 20,
  vapesPerWeek: 250,
  startDate: Date.now()
};

const PLAN_VARIANTS = {
  speeds: ['slow', 'medium', 'quick'],
  frequencies: ['weekly', 'daily'],
  methods: ['linear', 'compound'],
  adaptiveModes: [true, false]
};

const REDUCTION_RATES = {
  slow: 0.05,
  medium: 0.10,
  quick: 0.15
};

// Validation functions
function validateWeekData(week, config, weekNumber) {
  const errors = [];
  
  // Check if cigs + vapes = total (allowing for rounding)
  const sum = week.cigarettesAllowed + week.vapesAllowed;
  if (sum !== week.totalAllowed && week.totalAllowed !== 0) {
    errors.push(`Week ${weekNumber}: Sum mismatch - ${week.cigarettesAllowed} + ${week.vapesAllowed} = ${sum}, but total is ${week.totalAllowed}`);
  }
  
  // Check wait times
  if (week.cigarettesAllowed > 0) {
    const expectedWaitCigs = Math.floor(6720 / week.cigarettesAllowed);
    if (week.waitTimeCigs !== expectedWaitCigs) {
      errors.push(`Week ${weekNumber}: Cigarette wait time mismatch - expected ${expectedWaitCigs}, got ${week.waitTimeCigs}`);
    }
  }
  
  if (week.vapesAllowed > 0) {
    const expectedWaitVapes = Math.floor(6720 / week.vapesAllowed);
    if (week.waitTimeVapes !== expectedWaitVapes) {
      errors.push(`Week ${weekNumber}: Vape wait time mismatch - expected ${expectedWaitVapes}, got ${week.waitTimeVapes}`);
    }
  }
  
  return errors;
}

function validateReductionPattern(plan, config) {
  const errors = [];
  const { planSpeed, reductionFrequency, reductionMethod } = config;
  const reductionRate = REDUCTION_RATES[planSpeed];
  
  // Check if reduction follows expected pattern
  for (let i = 1; i < plan.weeks.length - 1; i++) {
    const prevWeek = plan.weeks[i - 1];
    const currentWeek = plan.weeks[i];
    
    const actualReduction = prevWeek.totalAllowed - currentWeek.totalAllowed;
    
    if (reductionFrequency === 'daily' && reductionMethod === 'linear') {
      // Linear daily: constant reduction per week
      const expectedReduction = (BASE_CONFIG.cigarettesPerWeek + BASE_CONFIG.vapesPerWeek) * reductionRate;
      const tolerance = 2; // Allow 2 items tolerance for rounding
      
      if (Math.abs(actualReduction - expectedReduction) > tolerance) {
        errors.push(`Week ${i}: Linear daily reduction off - expected ~${expectedReduction.toFixed(1)}, got ${actualReduction}`);
      }
    }
    // Add more pattern checks for other methods if needed
  }
  
  return errors;
}

function validatePlanStructure(plan, config) {
  const errors = [];
  
  // Check plan has required properties
  if (!plan.weeks || !Array.isArray(plan.weeks)) {
    errors.push('Plan missing weeks array');
  }
  
  if (plan.weeks && plan.weeks.length === 0) {
    errors.push('Plan has no weeks');
  }
  
  // Check first week
  const firstWeek = plan.weeks?.[0];
  if (firstWeek) {
    const expectedTotal = config.cigarettesPerWeek + config.vapesPerWeek;
    if (firstWeek.totalAllowed !== expectedTotal) {
      errors.push(`First week total mismatch - expected ${expectedTotal}, got ${firstWeek.totalAllowed}`);
    }
  }
  
  // Check last week
  const lastWeek = plan.weeks?.[plan.weeks.length - 1];
  if (lastWeek) {
    if (lastWeek.totalAllowed !== 0) {
      errors.push(`Last week should be 0, got ${lastWeek.totalAllowed}`);
    }
  }
  
  // Check week numbers are sequential
  plan.weeks?.forEach((week, index) => {
    if (week.weekNumber !== index) {
      errors.push(`Week ${index}: weekNumber mismatch - expected ${index}, got ${week.weekNumber}`);
    }
  });
  
  return errors;
}

function validatePercentages(plan, config) {
  const errors = [];
  const expectedCigPct = config.cigarettesPerWeek / (config.cigarettesPerWeek + config.vapesPerWeek);
  const expectedVapePct = config.vapesPerWeek / (config.cigarettesPerWeek + config.vapesPerWeek);
  
  // Check each week maintains the ratio (allowing for rounding)
  plan.weeks.forEach((week, index) => {
    if (week.totalAllowed > 0) {
      const actualCigPct = week.cigarettesAllowed / week.totalAllowed;
      const actualVapePct = week.vapesAllowed / week.totalAllowed;
      
      // Allow 0.1 tolerance for rounding errors
      if (Math.abs(actualCigPct - expectedCigPct) > 0.1) {
        errors.push(`Week ${index}: Cigarette percentage off - expected ~${(expectedCigPct * 100).toFixed(1)}%, got ${(actualCigPct * 100).toFixed(1)}%`);
      }
      
      if (Math.abs(actualVapePct - expectedVapePct) > 0.1) {
        errors.push(`Week ${index}: Vape percentage off - expected ~${(expectedVapePct * 100).toFixed(1)}%, got ${(actualVapePct * 100).toFixed(1)}%`);
      }
    }
  });
  
  return errors;
}

// Main test runner
function runTests() {
  console.log('='.repeat(80));
  console.log('COMPREHENSIVE QUIT PLAN VALIDATION SUITE');
  console.log('='.repeat(80));
  console.log();
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  // Test all combinations
  for (const speed of PLAN_VARIANTS.speeds) {
    for (const frequency of PLAN_VARIANTS.frequencies) {
      for (const method of PLAN_VARIANTS.methods) {
        for (const adaptive of PLAN_VARIANTS.adaptiveModes) {
          totalTests++;
          
          const config = {
            ...BASE_CONFIG,
            planSpeed: speed,
            reductionFrequency: frequency,
            reductionMethod: method,
            adaptiveMode: adaptive
          };
          
          const testName = `${speed.toUpperCase()} | ${frequency} | ${method} | adaptive=${adaptive}`;
          
          try {
            const plan = generateQuitPlan(config);
            
            // Run all validations
            const allErrors = [
              ...validatePlanStructure(plan, config),
              ...plan.weeks.flatMap((week, i) => validateWeekData(week, config, i)),
              ...validateReductionPattern(plan, config),
              ...validatePercentages(plan, config)
            ];
            
            if (allErrors.length === 0) {
              console.log(`✅ ${testName}`);
              console.log(`   Duration: ${plan.totalWeeks} weeks, Final date: ${new Date(plan.estimatedQuitDate).toLocaleDateString()}`);
              passedTests++;
            } else {
              console.log(`❌ ${testName}`);
              allErrors.forEach(err => console.log(`   ⚠️  ${err}`));
              failedTests++;
            }
          } catch (error) {
            console.log(`❌ ${testName}`);
            console.log(`   💥 Error: ${error.message}`);
            failedTests++;
          }
          
          console.log();
        }
      }
    }
  }
  
  // Summary
  console.log('='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests:  ${totalTests}`);
  console.log(`✅ Passed:    ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log(`❌ Failed:    ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log('='.repeat(80));
  
  return { totalTests, passedTests, failedTests };
}

// Run the tests
runTests();
