import { calculateTax, FILING_STATUSES, getFilingDeadline, } from "./taxUtils.js";
console.log("=== IRS Tax Filing Buddy - Interactive Demo ===\n");
// Demo 1: Show filing statuses
console.log("📋 Available Filing Statuses:");
Object.entries(FILING_STATUSES).forEach(([, status]) => {
    console.log(`  • ${status.description}: $${status.standardDeduction.toLocaleString()} standard deduction`);
});
console.log();
// Demo 2: Tax calculation examples
console.log("💰 Tax Calculation Examples:\n");
const examples = [
    { income: 30000, status: "single", description: "Entry-level professional" },
    { income: 75000, status: "single", description: "Mid-career professional" },
    { income: 120000, status: "married", description: "Dual-income couple" },
    { income: 250000, status: "single", description: "High-income professional" },
    { income: 500000, status: "married", description: "High-income couple" },
];
examples.forEach((example, index) => {
    const result = calculateTax(example.income, example.status);
    const status = FILING_STATUSES[example.status];
    console.log(`Example ${index + 1}: ${example.description}`);
    console.log(`  Income: $${example.income.toLocaleString()}`);
    console.log(`  Filing Status: ${status.description}`);
    console.log(`  Standard Deduction: $${status.standardDeduction.toLocaleString()}`);
    console.log(`  Taxable Income: $${result.taxableIncome.toLocaleString()}`);
    console.log(`  Tax Amount: $${result.taxAmount.toLocaleString()}`);
    console.log(`  Effective Tax Rate: ${result.effectiveRate.toFixed(2)}%`);
    console.log(`  Tax Bracket: ${result.bracket.description}`);
    console.log();
});
// Demo 3: Filing deadlines
console.log("📅 Filing Deadlines:");
const currentYear = new Date().getFullYear();
for (let year = currentYear - 1; year <= currentYear + 2; year++) {
    const deadline = getFilingDeadline(year);
    const isCurrent = year === currentYear;
    console.log(`  ${year}${isCurrent ? " (current)" : ""}: ${deadline}`);
}
console.log();
// Demo 4: Tax bracket comparison
console.log("📊 Tax Bracket Comparison (Single vs Married):");
console.log("Single Filer Brackets:");
const singleBrackets = calculateTax(100000, "single");
console.log(`  $100,000 income → ${singleBrackets.bracket.description} (${(singleBrackets.bracket.rate * 100).toFixed(0)}%)`);
const marriedBrackets = calculateTax(100000, "married");
console.log(`Married Filing Jointly:`);
console.log(`  $100,000 income → ${marriedBrackets.bracket.description} (${(marriedBrackets.bracket.rate * 100).toFixed(0)}%)`);
console.log();
// Demo 5: Tax savings example
console.log("💡 Tax Savings Example:");
const singleTax = calculateTax(80000, "single");
const marriedTax = calculateTax(80000, "married");
const savings = singleTax.taxAmount - marriedTax.taxAmount;
console.log(`Single filer with $80,000: $${singleTax.taxAmount.toLocaleString()} tax`);
console.log(`Married filing jointly with $80,000: $${marriedTax.taxAmount.toLocaleString()} tax`);
console.log(`Potential savings: $${savings.toLocaleString()}`);
console.log();
console.log("=== Demo Complete ===");
console.log("\n💡 Tips:");
console.log("• Standard deductions reduce your taxable income");
console.log("• Married filing jointly often results in lower taxes");
console.log("• Tax brackets are progressive (different rates for different income levels)");
console.log("• Consider itemizing if deductions exceed standard deduction");
console.log("• File extensions if you need more time (Form 4868)");
//# sourceMappingURL=demo.js.map