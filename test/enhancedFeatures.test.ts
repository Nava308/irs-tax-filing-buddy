import { DocumentProcessor } from '../src/services/documentProcessor.js';
import { DocumentValidator } from '../src/services/documentValidator.js';
import { PDFGenerator } from '../src/services/pdfGenerator.js';

console.log("=== IRS Tax Filing Buddy - Enhanced Features Tests ===\n");

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
  
  // Test 1: Document Validation
  await new Promise<void>((resolve) => {
    runTest("Document validation - Valid W2", async () => {
      const validator = new DocumentValidator();
      const validW2 = {
        id: "test_w2",
        type: "w2" as const,
        filename: "w2_2024.txt",
        content: `
FORM W-2 Wage and Tax Statement
Employee: John Doe
SSN: ***-**-1234
Employer: Test Company
Wages: $75,000
Federal Income Tax Withheld: $9,000
        `,
        uploadedAt: new Date()
      };
      
      const result = validator.validateDocument(validW2);
      console.log(`    Validation result: ${result.isValid ? 'Valid' : 'Invalid'}`);
      if (result.errors.length > 0) {
        console.log(`    Errors: ${result.errors.join(', ')}`);
      }
      if (result.warnings.length > 0) {
        console.log(`    Warnings: ${result.warnings.join(', ')}`);
      }
      
      return result.isValid;
    });
    setTimeout(resolve, 100);
  });

  // Test 2: Document Validation - Invalid document
  await new Promise<void>((resolve) => {
    runTest("Document validation - Invalid document", async () => {
      const validator = new DocumentValidator();
      const invalidDoc = {
        id: "test_invalid",
        type: "w2" as const,
        filename: "", // Empty filename
        content: "Short", // Too short content
        uploadedAt: new Date()
      };
      
      const result = validator.validateDocument(invalidDoc);
      console.log(`    Validation result: ${result.isValid ? 'Valid' : 'Invalid'}`);
      console.log(`    Errors: ${result.errors.join(', ')}`);
      
      return !result.isValid && result.errors.length > 0;
    });
    setTimeout(resolve, 100);
  });

  // Test 3: Document Validation - SSN security
  await new Promise<void>((resolve) => {
    runTest("Document validation - SSN security check", async () => {
      const validator = new DocumentValidator();
      const unsafeDoc = {
        id: "test_unsafe",
        type: "w2" as const,
        filename: "w2_unsafe.txt",
        content: `
FORM W-2 Wage and Tax Statement
Employee: John Doe
SSN: 123-45-6789
Employer: Test Company
        `,
        uploadedAt: new Date()
      };
      
      const result = validator.validateDocument(unsafeDoc);
      console.log(`    Validation result: ${result.isValid ? 'Valid' : 'Invalid'}`);
      console.log(`    Errors: ${result.errors.join(', ')}`);
      
      return !result.isValid && result.errors.some(err => err.includes('SSN'));
    });
    setTimeout(resolve, 100);
  });

  // Test 4: PDF Generation
  await new Promise<void>((resolve) => {
    runTest("PDF generation - Form 1040", async () => {
      const pdfGenerator = new PDFGenerator();
      const mockFilingData = {
        personalInfo: {
          firstName: "John",
          lastName: "Doe",
          ssn: "***-**-1234",
          address: {
            street: "123 Main St",
            city: "Anytown",
            state: "CA",
            zipCode: "12345"
          },
          dateOfBirth: new Date("1980-01-01")
        },
        income: {
          wages: 75000,
          selfEmployment: 0,
          interest: 500,
          dividends: 200,
          capitalGains: 0,
          rentalIncome: 0,
          otherIncome: 0,
          totalIncome: 75700
        },
        deductions: {
          itemizedDeductions: 0,
          businessExpenses: 0,
          retirementContributions: 0,
          healthSavingsAccount: 0,
          standardDeduction: 14600,
          totalDeductions: 14600
        },
        credits: {
          childTaxCredit: 0,
          earnedIncomeCredit: 0,
          educationCredits: 0,
          otherCredits: 0,
          totalCredits: 0
        },
        filingStatus: "single" as const,
        taxYear: 2024
      };
      
      const mockCalculatedTax = {
        grossIncome: 75700,
        adjustedGrossIncome: 75700,
        taxableIncome: 61100,
        federalTax: 7175,
        credits: 0,
        finalTax: 7175,
        effectiveRate: 9.48
      };
      
      const pdfBuffer = await pdfGenerator.generateForm1040PDF(mockFilingData, mockCalculatedTax);
      console.log(`    PDF generated: ${pdfBuffer.length} bytes`);
      
      return pdfBuffer.length > 1000; // PDF should be substantial
    });
    setTimeout(resolve, 100);
  });

  // Test 5: Enhanced Document Processing with Validation
  await new Promise<void>((resolve) => {
    runTest("Enhanced document processing with validation", async () => {
      const processor = new DocumentProcessor();
      
      // Upload a valid document
      const validW2Content = `
FORM W-2 Wage and Tax Statement
Employee: Jane Smith
SSN: ***-**-5678
Employer: Test Corp
Wages: $85,000
Federal Income Tax Withheld: $10,200
      `;
      
      const documentId = await processor.uploadDocument("valid_w2.txt", validW2Content, "w2");
      console.log(`    Document uploaded: ${documentId}`);
      
      // Process documents
      const filingData = await processor.processDocumentsWithClaude([documentId], "single", 2024);
      console.log(`    Processing completed for: ${filingData.personalInfo.firstName} ${filingData.personalInfo.lastName}`);
      
      return filingData.personalInfo.firstName === "John" && filingData.income.totalIncome > 0;
    });
    setTimeout(resolve, 100);
  });

  // Test 6: PDF Output Format
  await new Promise<void>((resolve) => {
    runTest("PDF output format generation", async () => {
      const processor = new DocumentProcessor();
      
      // Upload document
      const w2Content = `
FORM W-2 Wage and Tax Statement
Employee: John Doe
SSN: ***-**-1234
Employer: Test Company
Wages: $75,000
Federal Income Tax Withheld: $9,000
      `;
      const docId = await processor.uploadDocument("pdf_test.txt", w2Content, "w2");
      
      // Generate PDF format
      const result = await processor.generateTaxFiling({
        documents: [
          { 
            id: docId, 
            type: "w2" as const, 
            filename: "w2.txt", 
            content: w2Content, 
            uploadedAt: new Date() 
          }
        ],
        filingStatus: "single",
        taxYear: 2024,
        outputFormat: "pdf"
      });
      
      console.log(`    PDF format generated: ${result.forms.length} forms`);
      console.log(`    Form 1040 content length: ${result.forms[0].content.length} characters`);
      
      // PDF content should be substantial (base64 encoded or text fallback)
      return result.forms.length > 0 && 
             result.forms[0].content.length > 1000;
    });
    setTimeout(resolve, 100);
  });

  // Test 7: Multiple Document Validation
  await new Promise<void>((resolve) => {
    runTest("Multiple document validation", async () => {
      const validator = new DocumentValidator();
      const documents = [
        {
          id: "doc1",
          type: "w2" as const,
          filename: "w2_2024.txt",
          content: "FORM W-2 Wage and Tax Statement Employee: John Doe SSN: ***-**-1234 Employer: Test Company Wages: $50,000",
          uploadedAt: new Date()
        },
        {
          id: "doc2",
          type: "1099" as const,
          filename: "1099_int_2024.txt",
          content: "FORM 1099-INT Interest Income Payer: Bank Recipient: John Doe",
          uploadedAt: new Date()
        }
      ];
      
      const result = validator.validateMultipleDocuments(documents);
      console.log(`    Multiple validation result: ${result.isValid ? 'Valid' : 'Invalid'}`);
      if (result.errors.length > 0) {
        console.log(`    Errors: ${result.errors.join(', ')}`);
      }
      
      return result.isValid;
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
    console.log("🎉 All enhanced features tests passed!");
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
