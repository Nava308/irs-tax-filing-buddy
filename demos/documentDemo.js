import { DocumentProcessor } from './services/documentProcessor.js';
console.log("=== IRS Tax Filing Buddy - Document Processing Demo ===\n");
const processor = new DocumentProcessor();
async function runDemo() {
    try {
        // Step 1: Upload sample tax documents
        console.log("📄 Step 1: Uploading sample tax documents...\n");
        const w2Content = `
FORM W-2 Wage and Tax Statement
Employee: John Doe
SSN: ***-**-1234
Address: 123 Main St, Anytown, CA 12345
Employer: ABC Company
Wages: $75,000
Federal Income Tax Withheld: $8,500
Social Security Tax Withheld: $4,650
Medicare Tax Withheld: $1,088
    `;
        const w2Id = await processor.uploadDocument("w2_2024.txt", w2Content, "w2");
        console.log(`✅ W2 uploaded with ID: ${w2Id}`);
        const interestContent = `
FORM 1099-INT Interest Income
Recipient: John Doe
SSN: ***-**-1234
Address: 123 Main St, Anytown, CA 12345
Payer: XYZ Bank
Interest Income: $500
Federal Income Tax Withheld: $0
    `;
        const interestId = await processor.uploadDocument("1099_int_2024.txt", interestContent, "1099");
        console.log(`✅ 1099-INT uploaded with ID: ${interestId}`);
        const dividendContent = `
FORM 1099-DIV Dividends and Distributions
Recipient: John Doe
SSN: ***-**-1234
Address: 123 Main St, Anytown, CA 12345
Payer: Investment Corp
Ordinary Dividends: $200
Qualified Dividends: $200
Federal Income Tax Withheld: $0
    `;
        const dividendId = await processor.uploadDocument("1099_div_2024.txt", dividendContent, "1099");
        console.log(`✅ 1099-DIV uploaded with ID: ${dividendId}\n`);
        // Step 2: Process documents with Claude
        console.log("🤖 Step 2: Processing documents with Claude...\n");
        const filingData = await processor.processDocumentsWithClaude([w2Id, interestId, dividendId], "single", 2024);
        console.log("✅ Documents processed successfully!");
        console.log(`Name: ${filingData.personalInfo.firstName} ${filingData.personalInfo.lastName}`);
        console.log(`Total Income: $${filingData.income.totalIncome.toLocaleString()}`);
        console.log(`Wages: $${filingData.income.wages.toLocaleString()}`);
        console.log(`Interest: $${filingData.income.interest.toLocaleString()}`);
        console.log(`Dividends: $${filingData.income.dividends.toLocaleString()}\n`);
        // Step 3: Generate tax filing in different formats
        console.log("📋 Step 3: Generating tax filings in different formats...\n");
        const formats = ['json', 'xml', 'mail_ready'];
        for (const format of formats) {
            console.log(`📄 Generating ${format.toUpperCase()} format...`);
            const result = await processor.generateTaxFiling({
                documents: [
                    { id: w2Id, type: 'w2', filename: 'w2.txt', content: '', uploadedAt: new Date() },
                    { id: interestId, type: '1099', filename: '1099_int.txt', content: '', uploadedAt: new Date() },
                    { id: dividendId, type: '1099', filename: '1099_div.txt', content: '', uploadedAt: new Date() }
                ],
                filingStatus: "single",
                taxYear: 2024,
                outputFormat: format
            });
            console.log(`✅ ${format.toUpperCase()} filing generated!`);
            console.log(`Summary: Tax Owed: $${result.summary.taxOwed.toLocaleString()}, Refund: $${result.summary.refundAmount.toLocaleString()}`);
            console.log(`Forms generated: ${result.forms.length}`);
            console.log(`First form content preview: ${result.forms[0].content.substring(0, 100)}...\n`);
        }
        console.log("=== Demo Complete ===");
        console.log("\n💡 What this demo shows:");
        console.log("• Document upload and storage");
        console.log("• Claude-powered document processing");
        console.log("• Automatic tax calculation");
        console.log("• Multiple output formats (JSON, XML, Mail-ready)");
        console.log("• Complete tax filing generation");
    }
    catch (error) {
        console.error("❌ Demo failed:", error);
    }
}
runDemo();
//# sourceMappingURL=documentDemo.js.map