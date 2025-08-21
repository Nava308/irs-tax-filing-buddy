import dotenv from "dotenv";
import { DocumentProcessor } from "./dist/src/services/documentProcessor.js";

dotenv.config();

async function testRealClaudeIntegration() {
  console.log("=== Testing Real Claude Integration ===\n");

  const processor = new DocumentProcessor();

  try {
    console.log("🔄 Step 1: Uploading a W2 document...");

    const w2Content = `
FORM W-2 Wage and Tax Statement
Employee: John Doe
SSN: ***-**-1234
Employer: Test Company Inc.
Address: 123 Business St, City, State 12345
Wages: $75,000
Federal Income Tax Withheld: $9,000
Social Security Wages: $75,000
Social Security Tax Withheld: $4,650
Medicare Wages: $75,000
Medicare Tax Withheld: $1,088
    `;

    const documentId = await processor.uploadDocument(
      "w2_2024.txt",
      w2Content,
      "w2"
    );
    console.log(`✅ Document uploaded with ID: ${documentId}`);

    console.log("\n🤖 Step 2: Processing document with real Claude API...");

    const filingData = await processor.processDocumentsWithClaude(
      [documentId],
      "single",
      2024
    );

    console.log("✅ Document processed successfully!");
    console.log(
      `Name: ${filingData.personalInfo.firstName} ${filingData.personalInfo.lastName}`
    );
    console.log(
      `Total Income: $${filingData.income.totalIncome.toLocaleString()}`
    );
    console.log(`Wages: $${filingData.income.wages.toLocaleString()}`);
    console.log(`Filing Status: ${filingData.filingStatus}`);

    console.log("\n📄 Step 3: Generating PDF tax filing...");

    const result = await processor.generateTaxFiling({
      documents: [
        {
          id: documentId,
          type: "w2",
          filename: "w2_2024.txt",
          content: w2Content,
          uploadedAt: new Date(),
        },
      ],
      filingStatus: "single",
      taxYear: 2024,
      outputFormat: "pdf",
    });

    console.log("✅ Tax filing generated successfully!");
    console.log(`Forms generated: ${result.forms.length}`);
    console.log(`Tax owed: $${result.summary.taxOwed.toLocaleString()}`);
    console.log(
      `Refund amount: $${result.summary.refundAmount.toLocaleString()}`
    );
    console.log(
      `PDF content length: ${result.forms[0].content.length} characters`
    );

    console.log("\n🎉 Real Claude integration test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);

    if (error.message.includes("CLAUDE_API_KEY")) {
      console.log("💡 Make sure CLAUDE_API_KEY is set in your .env file");
    } else if (
      error.message.includes("Failed to process documents with Claude")
    ) {
      console.log(
        "💡 Claude API integration issue - check your API key and model access"
      );
    }
  }
}

testRealClaudeIntegration();
