import { calculateTax, getFilingDeadline } from './taxUtils.js';

// Test tax calculations
console.log("=== IRS Tax Filing Buddy - Test Suite ===\n");

// Test 1: Basic tax calculation for single filer
console.log("Test 1: Single filer with $50,000 income");
const result1 = calculateTax(50000, 'single');
console.log(`Taxable Income: $${result1.taxableIncome.toLocaleString()}`);
console.log(`Tax Amount: $${result1.taxAmount.toLocaleString()}`);
console.log(`Effective Rate: ${result1.effectiveRate.toFixed(2)}%`);
console.log(`Tax Bracket: ${result1.bracket.description}\n`);

// Test 2: Married couple with higher income
console.log("Test 2: Married couple with $150,000 income");
const result2 = calculateTax(150000, 'married');
console.log(`Taxable Income: $${result2.taxableIncome.toLocaleString()}`);
console.log(`Tax Amount: $${result2.taxAmount.toLocaleString()}`);
console.log(`Effective Rate: ${result2.effectiveRate.toFixed(2)}%`);
console.log(`Tax Bracket: ${result2.bracket.description}\n`);

// Test 3: High income earner
console.log("Test 3: High income earner with $500,000 income");
const result3 = calculateTax(500000, 'single');
console.log(`Taxable Income: $${result3.taxableIncome.toLocaleString()}`);
console.log(`Tax Amount: $${result3.taxAmount.toLocaleString()}`);
console.log(`Effective Rate: ${result3.effectiveRate.toFixed(2)}%`);
console.log(`Tax Bracket: ${result3.bracket.description}\n`);

// Test 4: Low income earner
console.log("Test 4: Low income earner with $20,000 income");
const result4 = calculateTax(20000, 'single');
console.log(`Taxable Income: $${result4.taxableIncome.toLocaleString()}`);
console.log(`Tax Amount: $${result4.taxAmount.toLocaleString()}`);
console.log(`Effective Rate: ${result4.effectiveRate.toFixed(2)}%`);
console.log(`Tax Bracket: ${result4.bracket.description}\n`);

// Test 5: Filing deadlines
console.log("Test 5: Filing deadlines");
const currentYear = new Date().getFullYear();
console.log(`Current year (${currentYear}) deadline: ${getFilingDeadline(currentYear)}`);
console.log(`Next year (${currentYear + 1}) deadline: ${getFilingDeadline(currentYear + 1)}`);
console.log(`Previous year (${currentYear - 1}) deadline: ${getFilingDeadline(currentYear - 1)}\n`);

// Test 6: Edge cases
console.log("Test 6: Edge cases");
console.log("Income below standard deduction:");
const result6 = calculateTax(10000, 'single');
console.log(`Taxable Income: $${result6.taxableIncome.toLocaleString()}`);
console.log(`Tax Amount: $${result6.taxAmount.toLocaleString()}\n`);

console.log("Zero income:");
const result7 = calculateTax(0, 'single');
console.log(`Taxable Income: $${result7.taxableIncome.toLocaleString()}`);
console.log(`Tax Amount: $${result7.taxAmount.toLocaleString()}\n`);

console.log("=== Test Suite Complete ===");
