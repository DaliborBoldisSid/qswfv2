// Scenario-based tests for common use cases
// Run with: node tests/scenario-tests.js

// Simulate generateQuitPlan logic inline for standalone testing
const REDUCTION_RATES = {
  slow: 0.05,
  medium: 0.10,
  quick: 0.15
};

function calculateInitialWaitTime(weeklyAmount) {
  const wakingMinutesPerWeek = 6720;
  return Math.floor(wakingMinutesPerWeek / weeklyAmount);
}

function generateQuitPlan(userData) {
  const { 
    cigarettesPerWeek = 0, 
    vapesPerWeek = 0, 
    planSpeed,
    reductionFrequency = 'weekly',
    reductionMethod = 'compound',
    adaptiveMode = false,
    startDate = Date.now()
  } = userData;

  const totalPerWeek = cigarettesPerWeek + vapesPerWeek;
  const cigPercentage = cigarettesPerWeek / totalPerWeek;
  const vapePercentage = vapesPerWeek / totalPerWeek;
  
  const reductionRate = REDUCTION_RATES[planSpeed] || REDUCTION_RATES.medium;
  
  const plan = {
    startDate,
    planSpeed,
    reductionFrequency,
    reductionMethod,
    adaptiveMode,
    originalCigarettesPerWeek: cigarettesPerWeek,
    originalVapesPerWeek: vapesPerWeek,
    cigPercentage,
    vapePercentage,
    reductionRate,
    weeks: []
  };

  let currentTotal = totalPerWeek;
  let weekNumber = 0;
  
  const reductionPeriod = reductionFrequency === 'daily' ? 7 : 1;
  
  while (currentTotal > 0.5) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + (weekNumber * 7));
    
    // Use proportional rounding to ensure cigarettes + vapes = total
    const totalAllowed = Math.round(currentTotal);
    const cigarettesThisWeek = Math.round(totalAllowed * cigPercentage);
    const vapesThisWeek = totalAllowed - cigarettesThisWeek; // Force consistency
    
    const waitTimeCigs = cigarettesThisWeek > 0 ? calculateInitialWaitTime(cigarettesThisWeek) : 0;
    const waitTimeVapes = vapesThisWeek > 0 ? calculateInitialWaitTime(vapesThisWeek) : 0;
    
    plan.weeks.push({
      weekNumber,
      weekStart: weekStart.toISOString(),
      totalAllowed,
      cigarettesAllowed: cigarettesThisWeek,
      vapesAllowed: vapesThisWeek,
      waitTimeCigs,
      waitTimeVapes
    });
    
    if (reductionFrequency === 'daily') {
      if (reductionMethod === 'linear') {
        const dailyReduction = totalPerWeek * (reductionRate / 7);
        currentTotal = currentTotal - (dailyReduction * 7);
      } else {
        const dailyRate = reductionRate / 7;
        for (let i = 0; i < 7; i++) {
          currentTotal = currentTotal * (1 - dailyRate);
        }
      }
    } else {
      currentTotal = currentTotal * (1 - reductionRate);
    }
    
    weekNumber++;
    
    if (weekNumber > 100) break;
  }
  
  const finalWeekStart = new Date(startDate);
  finalWeekStart.setDate(finalWeekStart.getDate() + (weekNumber * 7));
  
  plan.weeks.push({
    weekNumber,
    weekStart: finalWeekStart.toISOString(),
    totalAllowed: 0,
    cigarettesAllowed: 0,
    vapesAllowed: 0,
    waitTimeCigs: 0,
    waitTimeVapes: 0
  });
  
  plan.estimatedQuitDate = finalWeekStart.toISOString();
  plan.totalWeeks = weekNumber + 1;
  
  return plan;
}

// Test scenarios
const SCENARIOS = [
  {
    name: 'Heavy Smoker - Slow Pace',
    config: {
      cigarettesPerWeek: 140,
      vapesPerWeek: 0,
      planSpeed: 'slow',
      reductionFrequency: 'daily',
      reductionMethod: 'linear',
      adaptiveMode: true
    },
    expectations: {
      minWeeks: 15,
      maxWeeks: 25,
      firstWeekTotal: 140
    }
  },
  {
    name: 'Vape Only User - Quick Pace',
    config: {
      cigarettesPerWeek: 0,
      vapesPerWeek: 300,
      planSpeed: 'quick',
      reductionFrequency: 'daily',
      reductionMethod: 'linear',
      adaptiveMode: false
    },
    expectations: {
      minWeeks: 6,
      maxWeeks: 10,
      firstWeekTotal: 300
    }
  },
  {
    name: 'Mixed User - Medium Linear Daily',
    config: {
      cigarettesPerWeek: 20,
      vapesPerWeek: 250,
      planSpeed: 'medium',
      reductionFrequency: 'daily',
      reductionMethod: 'linear',
      adaptiveMode: true
    },
    expectations: {
      minWeeks: 8,
      maxWeeks: 12,
      firstWeekTotal: 270
    }
  },
  {
    name: 'Light Smoker - Compound Weekly',
    config: {
      cigarettesPerWeek: 14,
      vapesPerWeek: 0,
      planSpeed: 'medium',
      reductionFrequency: 'weekly',
      reductionMethod: 'compound',
      adaptiveMode: false
    },
    expectations: {
      minWeeks: 20,
      maxWeeks: 30,
      firstWeekTotal: 14
    }
  },
  {
    name: 'High Vape User - Slow Linear Daily',
    config: {
      cigarettesPerWeek: 20,
      vapesPerWeek: 250,
      planSpeed: 'slow',
      reductionFrequency: 'daily',
      reductionMethod: 'linear',
      adaptiveMode: true
    },
    expectations: {
      minWeeks: 18,
      maxWeeks: 23,
      firstWeekTotal: 270
    }
  },
  {
    name: 'Dual User - Quick Compound Daily',
    config: {
      cigarettesPerWeek: 35,
      vapesPerWeek: 140,
      planSpeed: 'quick',
      reductionFrequency: 'daily',
      reductionMethod: 'compound',
      adaptiveMode: true
    },
    expectations: {
      minWeeks: 5,
      maxWeeks: 8,
      firstWeekTotal: 175
    }
  }
];

function runScenarioTests() {
  console.log('='.repeat(80));
  console.log('SCENARIO-BASED QUIT PLAN TESTS');
  console.log('='.repeat(80));
  console.log();
  
  let passed = 0;
  let failed = 0;
  
  SCENARIOS.forEach((scenario, index) => {
    console.log(`\n📋 Scenario ${index + 1}: ${scenario.name}`);
    console.log('-'.repeat(80));
    console.log(`Config: ${scenario.config.cigarettesPerWeek} cigs/week, ${scenario.config.vapesPerWeek} vapes/week`);
    console.log(`        ${scenario.config.planSpeed} pace, ${scenario.config.reductionMethod} ${scenario.config.reductionFrequency}`);
    
    try {
      const plan = generateQuitPlan(scenario.config);
      const errors = [];
      
      // Check first week
      if (plan.weeks[0].totalAllowed !== scenario.expectations.firstWeekTotal) {
        errors.push(`First week total: expected ${scenario.expectations.firstWeekTotal}, got ${plan.weeks[0].totalAllowed}`);
      }
      
      // Check duration
      if (plan.totalWeeks < scenario.expectations.minWeeks || plan.totalWeeks > scenario.expectations.maxWeeks) {
        errors.push(`Duration: expected ${scenario.expectations.minWeeks}-${scenario.expectations.maxWeeks} weeks, got ${plan.totalWeeks}`);
      }
      
      // Check last week is 0
      if (plan.weeks[plan.weeks.length - 1].totalAllowed !== 0) {
        errors.push(`Last week should be 0, got ${plan.weeks[plan.weeks.length - 1].totalAllowed}`);
      }
      
      // Check internal consistency
      for (let i = 0; i < plan.weeks.length; i++) {
        const week = plan.weeks[i];
        const sum = week.cigarettesAllowed + week.vapesAllowed;
        if (sum !== week.totalAllowed && week.totalAllowed !== 0) {
          errors.push(`Week ${i}: Sum mismatch (${week.cigarettesAllowed} + ${week.vapesAllowed} = ${sum}, total = ${week.totalAllowed})`);
          break; // Only report first occurrence
        }
      }
      
      if (errors.length === 0) {
        console.log(`\n✅ PASS`);
        console.log(`   Duration: ${plan.totalWeeks} weeks`);
        console.log(`   Quit date: ${new Date(plan.estimatedQuitDate).toLocaleDateString()}`);
        console.log(`   Week 1: ${plan.weeks[0].cigarettesAllowed} cigs, ${plan.weeks[0].vapesAllowed} vapes`);
        console.log(`   Week ${Math.floor(plan.weeks.length / 2)}: ${plan.weeks[Math.floor(plan.weeks.length / 2)].cigarettesAllowed} cigs, ${plan.weeks[Math.floor(plan.weeks.length / 2)].vapesAllowed} vapes`);
        passed++;
      } else {
        console.log(`\n❌ FAIL`);
        errors.forEach(err => console.log(`   ⚠️  ${err}`));
        failed++;
      }
    } catch (error) {
      console.log(`\n❌ FAIL - Error: ${error.message}`);
      failed++;
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('SCENARIO TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Scenarios: ${SCENARIOS.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / SCENARIOS.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(80));
  
  return { passed, failed, total: SCENARIOS.length };
}

// Run tests
runScenarioTests();
