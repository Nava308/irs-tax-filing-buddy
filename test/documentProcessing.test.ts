import { DocumentProcessor } from '../src/services/documentProcessor.js';

console.log("=== IRS Tax Filing Buddy - Document Processing Tests ===\n");

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
}

const testResults: TestResult[] = [];

function runTest(testName: string, testFn: () => Promise<boolean> | boolean): void {
  const runAsync = async () => {
    try {
      const result = await testFn();
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
  };
  
  runAsync();
}

async function runAllTests() {
  const processor = new DocumentProcessor();
  
  // Test 1: Document upload
  await new Promise<void>((resolve) => {
    runTest("Document upload functionality", async () => {
      const w2Content = `
FORM W-2 Wage and Tax Statement
Employee: Jane Smith
SSN: ***-**-5678
Employer: Test Company
Wages: $60,000
Federal Income Tax Withheld: $7,200
      `;
      
      const documentId = await processor.uploadDocument("test_w2.txt", w2Content, "w2");
      console.log(`    Document uploaded with ID: ${documentId}`);
      
      return documentId.startsWith('doc_') && documentId.length > 10;
    });
    setTimeout(resolve, 100);
  });
  
  // Test 2: Multiple document upload
  await new Promise<void>((resolve) => {
    runTest("Multiple document upload", async () => {
      const documents = [
        { filename: "w2_2024.txt", content: "FORM W-2 Wage and Tax Statement Employee: John Doe SSN: ***-**-1234 Employer: Test Company Wages: $50,000", type: "w2" as const },
        { filename: "1099_int.txt", content: "FORM 1099-INT Interest Income Payer: Bank Recipient: John Doe", type: "1099" as const },
        { filename: "1099_div.txt", content: "FORM 1099-DIV Dividends Payer: Fund Recipient: John Doe", type: "1099" as const }
      ];
      
      const documentIds: string[] = [];
      for (const doc of documents) {
        const id = await processor.uploadDocument(doc.filename, doc.content, doc.type);
        documentIds.push(id);
      }
      
      console.log(`    Uploaded ${documentIds.length} documents`);
      return documentIds.length === 3 && documentIds.every(id => id.startsWith('doc_'));
    });
    setTimeout(resolve, 100);
  });
  
  // Test 3: Document processing with Claude
  await new Promise<void>((resolve) => {
    runTest("Document processing with Claude simulation", async () => {
      const w2Content = `
FORM W-2 Wage and Tax Statement
Employee: Test User
SSN: ***-**-9999
Address: 456 Test St, Test City, TX 54321
Employer: Test Corp
Wages: $85,000
Federal Income Tax Withheld: $10,200
      `;
      
      const documentId = await processor.uploadDocument("test_processing.txt", w2Content, "w2");
      const filingData = await processor.processDocumentsWithClaude([documentId], "single", 2024);
      
      console.log(`    Processed filing data for: ${filingData.personalInfo.firstName} ${filingData.personalInfo.lastName}`);
      console.log(`    Total income: $${filingData.income.totalIncome.toLocaleString()}`);
      
      return filingData.personalInfo.firstName === "John" && // Simulated data
             filingData.income.totalIncome > 0 &&
             filingData.filingStatus === "single" &&
             filingData.taxYear === 2024;
    });
    setTimeout(resolve, 100);
  });
  
  // Test 4: Tax filing generation - JSON format
  await new Promise<void>((resolve) => {
    runTest("Tax filing generation - JSON format", async () => {
      // Upload a document first
      const w2Content = "FORM W-2 Wage and Tax Statement Employee: John Doe SSN: ***-**-1234 Employer: Test Company Wages: $50,000";
      const docId = await processor.uploadDocument("test_w2.txt", w2Content, "w2");
      
      const documents = [
        { 
          id: docId, 
          type: "w2" as const, 
          filename: "w2.txt", 
          content: w2Content, 
          uploadedAt: new Date() 
        }
      ];
      
      const result = await processor.generateTaxFiling({
        documents,
        filingStatus: "single",
        taxYear: 2024,
        outputFormat: "json"
      });
      
      console.log(`    Generated ${result.forms.length} forms`);
      console.log(`    Tax owed: $${result.summary.taxOwed.toLocaleString()}`);
      console.log(`    Form 1040 content preview: ${result.forms[0].content.substring(0, 50)}...`);
      
      return result.forms.length > 0 &&
             result.forms[0].formNumber === "1040" &&
             result.forms[0].content.includes('"form": "1040"') &&
             result.summary.filingDeadline.includes("April");
    });
    setTimeout(resolve, 100);
  });
  
  // Test 5: Tax filing generation - XML format
  await new Promise<void>((resolve) => {
    runTest("Tax filing generation - XML format", async () => {
      // Upload a document first
      const w2Content = "FORM W-2 Wage and Tax Statement Employee: John Doe SSN: ***-**-1234 Employer: Test Company Wages: $50,000";
      const docId = await processor.uploadDocument("test_w2_xml.txt", w2Content, "w2");
      
      const documents = [
        { 
          id: docId, 
          type: "w2" as const, 
          filename: "w2.txt", 
          content: w2Content, 
          uploadedAt: new Date() 
        }
      ];
      
      const result = await processor.generateTaxFiling({
        documents,
        filingStatus: "married",
        taxYear: 2024,
        outputFormat: "xml"
      });
      
      console.log(`    Generated XML format with ${result.forms.length} forms`);
      
      return result.forms.length > 0 &&
             result.forms[0].content.includes("<Form1040>") &&
             result.forms[0].content.includes("</Form1040>");
    });
    setTimeout(resolve, 100);
  });
  
  // Test 6: Tax filing generation - Mail ready format
  await new Promise<void>((resolve) => {
    runTest("Tax filing generation - Mail ready format", async () => {
      // Upload a document first
      const w2Content = "FORM W-2 Wage and Tax Statement Employee: John Doe SSN: ***-**-1234 Employer: Test Company Wages: $50,000";
      const docId = await processor.uploadDocument("test_w2_mail.txt", w2Content, "w2");
      
      const documents = [
        { 
          id: docId, 
          type: "w2" as const, 
          filename: "w2.txt", 
          content: w2Content, 
          uploadedAt: new Date() 
        }
      ];
      
      const result = await processor.generateTaxFiling({
        documents,
        filingStatus: "head_of_household",
        taxYear: 2024,
        outputFormat: "mail_ready"
      });
      
      console.log(`    Generated mail-ready format`);
      
      return result.forms.length > 0 &&
             result.forms[0].content.includes("FORM 1040 - U.S. INDIVIDUAL INCOME TAX RETURN") &&
             result.forms[0].content.includes("SIGNATURE:");
    });
    setTimeout(resolve, 100);
  });
  
  // Test 7: Error handling - No documents
  await new Promise<void>((resolve) => {
    runTest("Error handling - No documents found", async () => {
      try {
        await processor.processDocumentsWithClaude(["nonexistent_id"], "single", 2024);
        return false; // Should have thrown an error
      } catch (error) {
        console.log(`    Correctly caught error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return error instanceof Error && error.message.includes("No documents found");
      }
    });
    setTimeout(resolve, 100);
  });
  
  // Wait for all async tests to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Summary
  console.log("\n=== Test Summary ===");
  const passedTests = testResults.filter(t => t.passed).length;
  const totalTests = testResults.length;
  console.log(`Passed: ${passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log("🎉 All document processing tests passed!");
  } else {
    console.log("❌ Some tests failed:");
    testResults.filter(t => !t.passed).forEach(test => {
      console.log(`  - ${test.testName}${test.error ? `: ${test.error}` : ''}`);
    });
  }
  
  // Exit with appropriate code
  process.exit(passedTests === totalTests ? 0 : 1);
}

runAllTests();
