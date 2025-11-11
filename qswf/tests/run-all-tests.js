// Master test runner - executes all test suites
// Run with: node tests/run-all-tests.js

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEST_SUITES = [
  {
    name: 'Validation Tests',
    file: 'validate-user-data.js',
    description: 'Validates actual user quit plan data'
  },
  {
    name: 'Scenario Tests',
    file: 'scenario-tests.js',
    description: 'Tests common real-world scenarios'
  },
  {
    name: 'Edge Case Tests',
    file: 'edge-case-tests.js',
    description: 'Tests boundary conditions and unusual inputs'
  }
];

function runTest(testFile) {
  return new Promise((resolve, reject) => {
    const testPath = join(__dirname, testFile);
    const childProcess = spawn('node', [testPath], { shell: true });
    
    let output = '';
    let errorOutput = '';
    
    childProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    childProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output, error: null });
      } else {
        resolve({ success: false, output, error: errorOutput || `Exit code: ${code}` });
      }
    });
    
    childProcess.on('error', (error) => {
      reject({ success: false, output, error: error.message });
    });
  });
}

async function runAllTests() {
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(20) + 'QUIT PLAN TEST SUITE RUNNER' + ' '.repeat(31) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');
  console.log();
  
  const startTime = Date.now();
  const results = [];
  
  for (const suite of TEST_SUITES) {
    console.log(`\n${'━'.repeat(80)}`);
    console.log(`▶️  Running: ${suite.name}`);
    console.log(`   ${suite.description}`);
    console.log(`   File: ${suite.file}`);
    console.log('━'.repeat(80));
    
    try {
      const result = await runTest(suite.file);
      
      if (result.success) {
        console.log(result.output);
        
        // Try to extract summary from output
        const summaryMatch = result.output.match(/(\d+).*passed.*(\d+).*failed/i);
        if (summaryMatch) {
          results.push({
            suite: suite.name,
            success: true,
            passed: parseInt(summaryMatch[1]),
            failed: parseInt(summaryMatch[2])
          });
        } else {
          results.push({
            suite: suite.name,
            success: true,
            passed: null,
            failed: null
          });
        }
      } else {
        console.log(`❌ Test suite failed to run`);
        if (result.error) {
          console.log(`Error: ${result.error}`);
        }
        if (result.output) {
          console.log(result.output);
        }
        results.push({
          suite: suite.name,
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.log(`❌ Exception running test suite: ${error.message || error.error}`);
      results.push({
        suite: suite.name,
        success: false,
        error: error.message || error.error
      });
    }
  }
  
  // Overall summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n\n');
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(28) + 'OVERALL SUMMARY' + ' '.repeat(35) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');
  console.log();
  
  let totalPassed = 0;
  let totalFailed = 0;
  let successfulSuites = 0;
  let failedSuites = 0;
  
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.suite}`);
    
    if (result.success) {
      successfulSuites++;
      if (result.passed !== null) {
        console.log(`   Passed: ${result.passed}, Failed: ${result.failed}`);
        totalPassed += result.passed;
        totalFailed += result.failed;
      }
    } else {
      failedSuites++;
      console.log(`   Error: ${result.error || 'Unknown error'}`);
    }
    console.log();
  });
  
  console.log('─'.repeat(80));
  console.log(`Test Suites: ${successfulSuites} passed, ${failedSuites} failed, ${results.length} total`);
  
  if (totalPassed > 0 || totalFailed > 0) {
    console.log(`Total Tests: ${totalPassed} passed, ${totalFailed} failed, ${totalPassed + totalFailed} total`);
    const successRate = ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1);
    console.log(`Success Rate: ${successRate}%`);
  }
  
  console.log(`Duration: ${duration}s`);
  console.log('─'.repeat(80));
  
  if (failedSuites === 0 && totalFailed === 0) {
    console.log('\n🎉 All tests passed! 🎉\n');
  } else {
    console.log('\n⚠️  Some tests failed. Review the output above for details.\n');
  }
}

// Run all tests
runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
