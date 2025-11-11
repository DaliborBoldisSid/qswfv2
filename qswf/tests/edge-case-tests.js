// Edge case and boundary tests
// Tests unusual inputs and extreme scenarios

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

const EDGE_CASES = [
  {
    name: 'Very Light User (1 per week)',
    config: {
      cigarettesPerWeek: 1,
      vapesPerWeek: 0,
      planSpeed: 'slow',
      reductionFrequency: 'daily',
      reductionMethod: 'linear'
    },
    description: 'Tests behavior with minimal starting amount'
  },
  {
    name: 'Very Heavy User (500 per week)',
    config: {
      cigarettesPerWeek: 200,
      vapesPerWeek: 300,
      planSpeed: 'slow',
      reductionFrequency: 'daily',
      reductionMethod: 'linear'
    },
    description: 'Tests behavior with extreme starting amount'
  },
  {
    name: 'Cigarettes Only',
    config: {
      cigarettesPerWeek: 70,
      vapesPerWeek: 0,
      planSpeed: 'medium',
      reductionFrequency: 'daily',
      reductionMethod: 'linear'
    },
    description: 'Tests single substance type'
  },
  {
    name: 'Vapes Only',
    config: {
      cigarettesPerWeek: 0,
      vapesPerWeek: 200,
      planSpeed: 'medium',
      reductionFrequency: 'daily',
      reductionMethod: 'linear'
    },
    description: 'Tests single substance type'
  },
  {
    name: '99% Cigarettes, 1% Vapes',
    config: {
      cigarettesPerWeek: 99,
      vapesPerWeek: 1,
      planSpeed: 'medium',
      reductionFrequency: 'daily',
      reductionMethod: 'linear'
    },
    description: 'Tests extreme ratio'
  },
  {
    name: '1% Cigarettes, 99% Vapes',
    config: {
      cigarettesPerWeek: 1,
      vapesPerWeek: 99,
      planSpeed: 'medium',
      reductionFrequency: 'daily',
      reductionMethod: 'linear'
    },
    description: 'Tests extreme ratio'
  },
  {
    name: 'Very Quick Pace with High Volume',
    config: {
      cigarettesPerWeek: 70,
      vapesPerWeek: 210,
      planSpeed: 'quick',
      reductionFrequency: 'daily',
      reductionMethod: 'linear'
    },
    description: 'Tests aggressive reduction rate'
  },
  {
    name: 'Slow Pace with Low Volume',
    config: {
      cigarettesPerWeek: 3,
      vapesPerWeek: 7,
      planSpeed: 'slow',
      reductionFrequency: 'daily',
      reductionMethod: 'linear'
    },
    description: 'Tests gentle reduction with small numbers'
  },
  {
    name: 'Compound Reduction - Heavy User',
    config: {
      cigarettesPerWeek: 50,
      vapesPerWeek: 200,
      planSpeed: 'medium',
      reductionFrequency: 'daily',
      reductionMethod: 'compound'
    },
    description: 'Tests compound (exponential) reduction'
  },
  {
    name: 'Weekly Reduction - Mixed User',
    config: {
      cigarettesPerWeek: 30,
      vapesPerWeek: 90,
      planSpeed: 'medium',
      reductionFrequency: 'weekly',
      reductionMethod: 'compound'
    },
    description: 'Tests weekly reduction frequency'
  }
];

function runEdgeCaseTests() {
  console.log('='.repeat(80));
  console.log('EDGE CASE & BOUNDARY TESTS');
  console.log('='.repeat(80));
  console.log();
  
  let passed = 0;
  let failed = 0;
  const issues = [];
  
  EDGE_CASES.forEach((testCase, index) => {
    console.log(`\n🔬 Test ${index + 1}: ${testCase.name}`);
    console.log('-'.repeat(80));
    console.log(`Description: ${testCase.description}`);
    console.log(`Config: ${testCase.config.cigarettesPerWeek} cigs, ${testCase.config.vapesPerWeek} vapes`);
    console.log(`        ${testCase.config.planSpeed} ${testCase.config.reductionMethod} ${testCase.config.reductionFrequency}`);
    
    try {
      const plan = generateQuitPlan(testCase.config);
      const errors = [];
      
      // Validate structure
      if (!plan.weeks || plan.weeks.length === 0) {
        errors.push('Plan has no weeks');
      }
      
      // Validate progression
      let previousTotal = Infinity;
      for (let i = 0; i < plan.weeks.length - 1; i++) {
        const week = plan.weeks[i];
        
        // Check monotonic decrease (except for floating point edge cases)
        if (week.totalAllowed > previousTotal) {
          errors.push(`Week ${i}: Total increased from ${previousTotal} to ${week.totalAllowed}`);
        }
        previousTotal = week.totalAllowed;
        
        // Check sum consistency
        const sum = week.cigarettesAllowed + week.vapesAllowed;
        if (sum !== week.totalAllowed && week.totalAllowed !== 0) {
          errors.push(`Week ${i}: Sum=${sum}, total=${week.totalAllowed}`);
        }
        
        // Check wait times are reasonable
        if (week.cigarettesAllowed > 0 && week.waitTimeCigs < 1) {
          errors.push(`Week ${i}: Cigarette wait time too low (${week.waitTimeCigs} min)`);
        }
        
        if (week.vapesAllowed > 0 && week.waitTimeVapes < 1) {
          errors.push(`Week ${i}: Vape wait time too low (${week.waitTimeVapes} min)`);
        }
        
        // Check no negative values
        if (week.totalAllowed < 0 || week.cigarettesAllowed < 0 || week.vapesAllowed < 0) {
          errors.push(`Week ${i}: Negative values detected`);
        }
      }
      
      // Check last week is 0
      const lastWeek = plan.weeks[plan.weeks.length - 1];
      if (lastWeek.totalAllowed !== 0 || lastWeek.cigarettesAllowed !== 0 || lastWeek.vapesAllowed !== 0) {
        errors.push(`Last week not zeroed: total=${lastWeek.totalAllowed}`);
      }
      
      // Check reasonable duration (< 100 weeks)
      if (plan.totalWeeks > 100) {
        errors.push(`Duration too long: ${plan.totalWeeks} weeks`);
      }
      
      if (plan.totalWeeks < 1) {
        errors.push(`Duration too short: ${plan.totalWeeks} weeks`);
      }
      
      if (errors.length === 0) {
        console.log(`\n✅ PASS`);
        console.log(`   Duration: ${plan.totalWeeks} weeks`);
        console.log(`   First week: ${plan.weeks[0].totalAllowed} total (${plan.weeks[0].cigarettesAllowed} cigs, ${plan.weeks[0].vapesAllowed} vapes)`);
        console.log(`   Mid week: ${plan.weeks[Math.floor(plan.weeks.length / 2)].totalAllowed} total`);
        passed++;
      } else {
        console.log(`\n❌ FAIL`);
        errors.forEach(err => console.log(`   ⚠️  ${err}`));
        issues.push({ test: testCase.name, errors });
        failed++;
      }
    } catch (error) {
      console.log(`\n❌ FAIL - Exception: ${error.message}`);
      console.log(`   Stack: ${error.stack.split('\n')[1]}`);
      issues.push({ test: testCase.name, errors: [error.message] });
      failed++;
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('EDGE CASE TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${EDGE_CASES.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / EDGE_CASES.length) * 100).toFixed(1)}%`);
  
  if (issues.length > 0) {
    console.log('\n⚠️  ISSUES FOUND:');
    issues.forEach(issue => {
      console.log(`\n  ${issue.test}:`);
      issue.errors.forEach(err => console.log(`    - ${err}`));
    });
  }
  
  console.log('='.repeat(80));
  
  return { passed, failed, total: EDGE_CASES.length };
}

// Run tests
runEdgeCaseTests();
