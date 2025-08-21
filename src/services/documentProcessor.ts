import { calculateTax } from "../taxUtils.js";
import {
  CalculatedTax,
  DocumentProcessingRequest,
  FilingSummary,
  GeneratedForm,
  TaxDocument,
  TaxDocumentType,
  TaxFilingData,
  TaxFilingResult,
} from "../types/taxDocuments.js";

export class DocumentProcessor {
  private documents: Map<string, TaxDocument> = new Map();

  /**
   * Upload and store a tax document
   */
  async uploadDocument(
    filename: string,
    content: string,
    documentType: TaxDocumentType
  ): Promise<string> {
    const documentId = this.generateDocumentId();
    const document: TaxDocument = {
      id: documentId,
      type: documentType,
      filename,
      content,
      uploadedAt: new Date(),
    };

    this.documents.set(documentId, document);
    return documentId;
  }

  /**
   * Process documents with Claude and extract tax information
   */
  async processDocumentsWithClaude(
    documentIds: string[],
    filingStatus: string,
    taxYear: number
  ): Promise<TaxFilingData> {
    const documents = documentIds
      .map((id) => this.documents.get(id))
      .filter(Boolean) as TaxDocument[];

    if (documents.length === 0) {
      throw new Error("No documents found for processing");
    }

    // Create a comprehensive prompt for Claude to process all documents
    const processingPrompt = this.createProcessingPrompt(
      documents,
      filingStatus,
      taxYear
    );

    // This would be sent to Claude for processing
    // For now, we'll simulate the response
    const processedData = await this.simulateClaudeProcessing(
      processingPrompt,
      documents
    );

    // Convert processed data to TaxFilingData
    return this.convertToTaxFilingData(processedData, filingStatus, taxYear);
  }

  /**
   * Generate complete tax filing with all forms and calculations
   */
  async generateTaxFiling(
    request: DocumentProcessingRequest
  ): Promise<TaxFilingResult> {
    // Process documents with Claude
    const filingData = await this.processDocumentsWithClaude(
      request.documents.map((d) => d.id),
      request.filingStatus,
      request.taxYear
    );

    // Calculate taxes
    const calculatedTax = this.calculateCompleteTax(filingData);

    // Generate forms
    const forms = this.generateForms(
      filingData,
      calculatedTax,
      request.outputFormat
    );

    // Create summary
    const summary = this.createFilingSummary(
      filingData,
      calculatedTax,
      request.taxYear
    );

    return {
      filingData,
      calculatedTax,
      forms,
      summary,
    };
  }

  /**
   * Create processing prompt for Claude
   */
  private createProcessingPrompt(
    documents: TaxDocument[],
    filingStatus: string,
    taxYear: number
  ): string {
    const documentContents = documents
      .map(
        (doc) =>
          `Document: ${doc.filename} (${doc.type})\nContent:\n${doc.content}`
      )
      .join("\n\n");

    return `
Please process the following tax documents for ${taxYear} tax filing as ${filingStatus}:

${documentContents}

Extract the following information in JSON format:
{
  "personalInfo": {
    "firstName": "string",
    "lastName": "string", 
    "ssn": "string (masked)",
    "address": {
      "street": "string",
      "city": "string", 
      "state": "string",
      "zipCode": "string"
    },
    "dateOfBirth": "YYYY-MM-DD"
  },
  "income": {
    "wages": number,
    "selfEmployment": number,
    "interest": number,
    "dividends": number,
    "capitalGains": number,
    "rentalIncome": number,
    "otherIncome": number
  },
  "deductions": {
    "itemizedDeductions": number,
    "businessExpenses": number,
    "retirementContributions": number,
    "healthSavingsAccount": number
  },
  "credits": {
    "childTaxCredit": number,
    "earnedIncomeCredit": number,
    "educationCredits": number,
    "otherCredits": number
  }
}

Please be accurate and only include information that is clearly stated in the documents.
    `;
  }

    /**
   * Simulate Claude processing (replace with actual Claude API call)
   */
  private async simulateClaudeProcessing(
    prompt: string, 
    _documents: TaxDocument[]
  ): Promise<any> {
    // This is a simulation - in real implementation, this would call Claude API
    console.log("Processing documents with Claude...");
    console.log("Prompt:", prompt);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return mock processed data
    return {
      personalInfo: {
        firstName: "John",
        lastName: "Doe",
        ssn: "***-**-1234",
        address: {
          street: "123 Main St",
          city: "Anytown",
          state: "CA",
          zipCode: "12345",
        },
        dateOfBirth: "1985-06-15",
      },
      income: {
        wages: 75000,
        selfEmployment: 0,
        interest: 500,
        dividends: 200,
        capitalGains: 0,
        rentalIncome: 0,
        otherIncome: 0,
      },
      deductions: {
        itemizedDeductions: 0,
        businessExpenses: 0,
        retirementContributions: 6000,
        healthSavingsAccount: 0,
      },
      credits: {
        childTaxCredit: 0,
        earnedIncomeCredit: 0,
        educationCredits: 0,
        otherCredits: 0,
      },
    };
  }

  /**
   * Convert processed data to TaxFilingData
   */
  private convertToTaxFilingData(
    processedData: any,
    filingStatus: string,
    taxYear: number
  ): TaxFilingData {
    const totalIncome = Object.values(processedData.income).reduce(
      (sum: number, val: any) => sum + (val || 0),
      0
    );
    const totalDeductions = Object.values(processedData.deductions).reduce(
      (sum: number, val: any) => sum + (val || 0),
      0
    );
    const totalCredits = Object.values(processedData.credits).reduce(
      (sum: number, val: any) => sum + (val || 0),
      0
    );

    return {
      personalInfo: processedData.personalInfo,
      income: {
        ...processedData.income,
        totalIncome,
      },
      deductions: {
        standardDeduction: 0, // Will be calculated based on filing status
        itemizedDeductions: processedData.deductions.itemizedDeductions || 0,
        businessExpenses: processedData.deductions.businessExpenses || 0,
        retirementContributions:
          processedData.deductions.retirementContributions || 0,
        healthSavingsAccount:
          processedData.deductions.healthSavingsAccount || 0,
        totalDeductions,
      },
      credits: {
        ...processedData.credits,
        totalCredits,
      },
      filingStatus: filingStatus as any,
      taxYear,
    };
  }

  /**
   * Calculate complete tax including all deductions and credits
   */
  private calculateCompleteTax(filingData: TaxFilingData): CalculatedTax {
    const { income, deductions, credits, filingStatus } = filingData;

    // Calculate AGI (Adjusted Gross Income)
    const agi =
      income.totalIncome -
      deductions.retirementContributions -
      deductions.healthSavingsAccount;

    // Determine standard vs itemized deduction
    const standardDeductionAmount = this.getStandardDeduction(filingStatus);
    const totalDeductions = Math.max(
      standardDeductionAmount,
      deductions.itemizedDeductions
    );

    // Calculate taxable income
    const taxableIncome = Math.max(0, agi - totalDeductions);

    // Calculate federal tax
    const taxCalculation = calculateTax(agi, filingStatus);

    // Apply credits
    const totalCredits = credits.totalCredits;
    const finalTax = Math.max(0, taxCalculation.taxAmount - totalCredits);

    return {
      grossIncome: income.totalIncome,
      adjustedGrossIncome: agi,
      taxableIncome,
      federalTax: taxCalculation.taxAmount,
      credits: totalCredits,
      finalTax,
      effectiveRate: taxableIncome > 0 ? (finalTax / taxableIncome) * 100 : 0,
    };
  }

  /**
   * Generate tax forms based on output format
   */
  private generateForms(
    filingData: TaxFilingData,
    calculatedTax: CalculatedTax,
    outputFormat: string
  ): GeneratedForm[] {
    const forms: GeneratedForm[] = [];

    // Generate Form 1040
    const form1040 = this.generateForm1040(
      filingData,
      calculatedTax,
      outputFormat
    );
    forms.push(form1040);

    // Add additional forms based on income types
    if (filingData.income.selfEmployment > 0) {
      forms.push(this.generateScheduleC(filingData, outputFormat));
    }

    if (filingData.income.capitalGains > 0) {
      forms.push(this.generateScheduleD(filingData, outputFormat));
    }

    return forms;
  }

  /**
   * Generate Form 1040
   */
  private generateForm1040(
    filingData: TaxFilingData,
    calculatedTax: CalculatedTax,
    outputFormat: string
  ): GeneratedForm {
    const content = this.formatForm1040(
      filingData,
      calculatedTax,
      outputFormat
    );

    return {
      formType: "Individual Income Tax Return",
      formNumber: "1040",
      content,
      instructions:
        "File this form with the IRS by April 15th of the following year.",
    };
  }

  /**
   * Format Form 1040 based on output format
   */
  private formatForm1040(
    filingData: TaxFilingData,
    calculatedTax: CalculatedTax,
    outputFormat: string
  ): string {
    switch (outputFormat) {
      case "json":
        return JSON.stringify(
          {
            form: "1040",
            personalInfo: filingData.personalInfo,
            income: filingData.income,
            deductions: filingData.deductions,
            credits: filingData.credits,
            calculatedTax,
          },
          null,
          2
        );

      case "xml":
        return this.generateXML1040(filingData, calculatedTax);

      case "irs_efile":
        return this.generateIRSEfile1040(filingData, calculatedTax);

      case "mail_ready":
        return this.generateMailReady1040(filingData, calculatedTax);

      default:
        return this.generateText1040(filingData, calculatedTax);
    }
  }

  /**
   * Create filing summary
   */
  private createFilingSummary(
    filingData: TaxFilingData,
    calculatedTax: CalculatedTax,
    taxYear: number
  ): FilingSummary {
    const refundAmount = Math.max(
      0,
      calculatedTax.credits - calculatedTax.finalTax
    );
    const taxOwed = Math.max(0, calculatedTax.finalTax - calculatedTax.credits);

    return {
      totalIncome: filingData.income.totalIncome,
      totalDeductions: filingData.deductions.totalDeductions,
      totalCredits: filingData.credits.totalCredits,
      taxOwed,
      refundAmount,
      filingDeadline: `April 15, ${taxYear + 1}`,
      estimatedProcessingTime: "3-6 weeks for refunds, 4-6 weeks for payments",
    };
  }

  /**
   * Get standard deduction amount
   */
  private getStandardDeduction(filingStatus: string): number {
    const deductions = {
      single: 14600,
      married: 29200,
      head_of_household: 21900,
      qualifying_widow: 29200,
    };
    return deductions[filingStatus as keyof typeof deductions] || 14600;
  }

  /**
   * Generate document ID
   */
  private generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Placeholder methods for form generation
  private generateScheduleC(
    _filingData: TaxFilingData,
    _outputFormat: string
  ): GeneratedForm {
    return {
      formType: "Profit or Loss From Business",
      formNumber: "Schedule C",
      content: "Schedule C content would be generated here",
      instructions: "Attach to Form 1040 if you have business income.",
    };
  }

  private generateScheduleD(
    _filingData: TaxFilingData,
    _outputFormat: string
  ): GeneratedForm {
    return {
      formType: "Capital Gains and Losses",
      formNumber: "Schedule D",
      content: "Schedule D content would be generated here",
      instructions: "Attach to Form 1040 if you have capital gains or losses.",
    };
  }

  private generateXML1040(
    filingData: TaxFilingData,
    calculatedTax: CalculatedTax
  ): string {
    return `<Form1040>
  <PersonalInfo>
    <FirstName>${filingData.personalInfo.firstName}</FirstName>
    <LastName>${filingData.personalInfo.lastName}</LastName>
    <SSN>${filingData.personalInfo.ssn}</SSN>
  </PersonalInfo>
  <Income>
    <Wages>${filingData.income.wages}</Wages>
    <TotalIncome>${filingData.income.totalIncome}</TotalIncome>
  </Income>
  <TaxCalculation>
    <TaxableIncome>${calculatedTax.taxableIncome}</TaxableIncome>
    <FederalTax>${calculatedTax.federalTax}</FederalTax>
    <FinalTax>${calculatedTax.finalTax}</FinalTax>
  </TaxCalculation>
</Form1040>`;
  }

  private generateIRSEfile1040(
    filingData: TaxFilingData,
    calculatedTax: CalculatedTax
  ): string {
    return `IRS_EFILE_FORMAT
1040
${filingData.personalInfo.firstName}
${filingData.personalInfo.lastName}
${filingData.personalInfo.ssn}
${filingData.income.totalIncome}
${calculatedTax.finalTax}
${filingData.filingStatus}
${filingData.taxYear}`;
  }

  private generateMailReady1040(
    filingData: TaxFilingData,
    calculatedTax: CalculatedTax
  ): string {
    return `FORM 1040 - U.S. INDIVIDUAL INCOME TAX RETURN
Tax Year: ${filingData.taxYear}

Name: ${filingData.personalInfo.firstName} ${filingData.personalInfo.lastName}
SSN: ${filingData.personalInfo.ssn}
Address: ${filingData.personalInfo.address.street}, ${
      filingData.personalInfo.address.city
    }, ${filingData.personalInfo.address.state} ${
      filingData.personalInfo.address.zipCode
    }

Filing Status: ${filingData.filingStatus}

INCOME:
Wages: $${filingData.income.wages.toLocaleString()}
Total Income: $${filingData.income.totalIncome.toLocaleString()}

DEDUCTIONS:
Standard Deduction: $${filingData.deductions.standardDeduction.toLocaleString()}

TAX CALCULATION:
Taxable Income: $${calculatedTax.taxableIncome.toLocaleString()}
Federal Tax: $${calculatedTax.finalTax.toLocaleString()}

SIGNATURE: _____________________________
DATE: _____________________________`;
  }

  private generateText1040(
    filingData: TaxFilingData,
    calculatedTax: CalculatedTax
  ): string {
    return `Form 1040 Summary:
- Name: ${filingData.personalInfo.firstName} ${filingData.personalInfo.lastName}
- Filing Status: ${filingData.filingStatus}
- Total Income: $${filingData.income.totalIncome.toLocaleString()}
- Taxable Income: $${calculatedTax.taxableIncome.toLocaleString()}
- Federal Tax: $${calculatedTax.finalTax.toLocaleString()}
- Effective Tax Rate: ${calculatedTax.effectiveRate.toFixed(2)}%`;
  }
}
