import { calculateTax, getFilingDeadline } from '../src/taxUtils.js';

// Test tax calculations
console.log("=== IRS Tax Filing Buddy - Tax Calculation Tests ===\n");

interface TestResult {
  testName: string;
  passed: boolean;
  expected?: any;
  actual?: any;
  error?: string;
}

const testResults: TestResult[] = [];

function runTest(testName: string, testFn: () => boolean | void): void {
  try {
    const result = testFn();
    const passed = result !== false;
    testResults.push({
      testName,
      passed,
    });
    console.log(`${passed ? '✅' : '❌'} ${testName}`);
  } catch (error) {
    testResults.push({
      testName,
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.log(`❌ ${testName} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function expectEqual(actual: any, expected: any, tolerance: number = 0.01): boolean {
  if (typeof actual === 'number' && typeof expected === 'number') {
    return Math.abs(actual - expected) <= tolerance;
  }
  return actual === expected;
}

// Test 1: Basic tax calculation for single filer
runTest("Single filer with $50,000 income", () => {
  const result = calculateTax(50000, 'single');
  console.log(`  Taxable Income: $${result.taxableIncome.toLocaleString()}`);
  console.log(`  Tax Amount: $${result.taxAmount.toLocaleString()}`);
  console.log(`  Effective Rate: ${result.effectiveRate.toFixed(2)}%`);
  console.log(`  Tax Bracket: ${result.bracket.description}\n`);
  
  // Validate results
  return expectEqual(result.taxableIncome, 35400) && 
         expectEqual(result.taxAmount, 4016, 10) &&
         result.effectiveRate > 10 && result.effectiveRate < 15;
});

// Test 2: Married couple with higher income
runTest("Married couple with $150,000 income", () => {
  const result = calculateTax(150000, 'married');
  console.log(`  Taxable Income: $${result.taxableIncome.toLocaleString()}`);
  console.log(`  Tax Amount: $${result.taxAmount.toLocaleString()}`);
  console.log(`  Effective Rate: ${result.effectiveRate.toFixed(2)}%`);
  console.log(`  Tax Bracket: ${result.bracket.description}\n`);
  
  return expectEqual(result.taxableIncome, 120800) &&
         result.taxAmount > 15000 && result.taxAmount < 20000;
});

// Test 3: High income earner
runTest("High income earner with $500,000 income", () => {
  const result = calculateTax(500000, 'single');
  console.log(`  Taxable Income: $${result.taxableIncome.toLocaleString()}`);
  console.log(`  Tax Amount: $${result.taxAmount.toLocaleString()}`);
  console.log(`  Effective Rate: ${result.effectiveRate.toFixed(2)}%`);
  console.log(`  Tax Bracket: ${result.bracket.description}\n`);
  
  return result.effectiveRate > 25 && result.effectiveRate < 35;
});

// Test 4: Low income earner
runTest("Low income earner with $20,000 income", () => {
  const result = calculateTax(20000, 'single');
  console.log(`  Taxable Income: $${result.taxableIncome.toLocaleString()}`);
  console.log(`  Tax Amount: $${result.taxAmount.toLocaleString()}`);
  console.log(`  Effective Rate: ${result.effectiveRate.toFixed(2)}%`);
  console.log(`  Tax Bracket: ${result.bracket.description}\n`);
  
  return expectEqual(result.taxableIncome, 5400) &&
         expectEqual(result.taxAmount, 540, 10);
});

// Test 5: Filing deadlines
runTest("Filing deadlines calculation", () => {
  const currentYear = new Date().getFullYear();
  const currentDeadline = getFilingDeadline(currentYear);
  const nextDeadline = getFilingDeadline(currentYear + 1);
  const prevDeadline = getFilingDeadline(currentYear - 1);
  
  console.log(`  Current year (${currentYear}) deadline: ${currentDeadline}`);
  console.log(`  Next year (${currentYear + 1}) deadline: ${nextDeadline}`);
  console.log(`  Previous year (${currentYear - 1}) deadline: ${prevDeadline}\n`);
  
  return currentDeadline.includes('April') && 
         nextDeadline.includes('April') && 
         prevDeadline.includes('April');
});

// Test 6: Edge cases
runTest("Income below standard deduction", () => {
  const result = calculateTax(10000, 'single');
  console.log(`  Taxable Income: $${result.taxableIncome.toLocaleString()}`);
  console.log(`  Tax Amount: $${result.taxAmount.toLocaleString()}\n`);
  
  return expectEqual(result.taxableIncome, 0) && 
         expectEqual(result.taxAmount, 0);
});

runTest("Zero income", () => {
  const result = calculateTax(0, 'single');
  console.log(`  Taxable Income: $${result.taxableIncome.toLocaleString()}`);
  console.log(`  Tax Amount: $${result.taxAmount.toLocaleString()}\n`);
  
  return expectEqual(result.taxableIncome, 0) && 
         expectEqual(result.taxAmount, 0);
});

// Test 7: Different filing statuses comparison
runTest("Filing status comparison", () => {
  const income = 80000;
  const singleResult = calculateTax(income, 'single');
  const marriedResult = calculateTax(income, 'married');
  const hohResult = calculateTax(income, 'head_of_household');
  
  console.log(`  Single filer tax: $${singleResult.taxAmount.toLocaleString()}`);
  console.log(`  Married filing jointly tax: $${marriedResult.taxAmount.toLocaleString()}`);
  console.log(`  Head of household tax: $${hohResult.taxAmount.toLocaleString()}\n`);
  
  // Married filing jointly should generally result in lower tax for same income
  return marriedResult.taxAmount < singleResult.taxAmount;
});

// Test 8: Tax bracket progression
runTest("Tax bracket progression", () => {
  const incomes = [30000, 60000, 120000, 250000];
  const results = incomes.map(income => ({
    income,
    result: calculateTax(income, 'single')
  }));
  
  console.log("  Tax bracket progression:");
  results.forEach(({ income, result }) => {
    console.log(`    $${income.toLocaleString()}: ${result.bracket.description} (${result.effectiveRate.toFixed(2)}%)`);
  });
  console.log();
  
  // Effective rate should increase with income
  for (let i = 1; i < results.length; i++) {
    if (results[i].result.effectiveRate <= results[i-1].result.effectiveRate) {
      return false;
    }
  }
  return true;
});

// Summary
console.log("=== Test Summary ===");
const passedTests = testResults.filter(t => t.passed).length;
const totalTests = testResults.length;
console.log(`Passed: ${passedTests}/${totalTests} tests`);

if (passedTests === totalTests) {
  console.log("🎉 All tests passed!");
} else {
  console.log("❌ Some tests failed:");
  testResults.filter(t => !t.passed).forEach(test => {
    console.log(`  - ${test.testName}${test.error ? `: ${test.error}` : ''}`);
  });
}

// Exit with appropriate code
process.exit(passedTests === totalTests ? 0 : 1);
