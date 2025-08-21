import Anthropic from "@anthropic-ai/sdk";
import { TaxDocument } from "../types/taxDocuments.js";

export interface ClaudeProcessingResult {
  personalInfo: {
    firstName: string;
    lastName: string;
    ssn: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    dateOfBirth: string;
  };
  income: {
    wages: number;
    selfEmployment: number;
    interest: number;
    dividends: number;
    capitalGains: number;
    rentalIncome: number;
    otherIncome: number;
  };
  deductions: {
    itemizedDeductions: number;
    businessExpenses: number;
    retirementContributions: number;
    healthSavingsAccount: number;
  };
  credits: {
    childTaxCredit: number;
    earnedIncomeCredit: number;
    educationCredits: number;
    otherCredits: number;
  };
}

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error("CLAUDE_API_KEY environment variable is required");
    }
    this.client = new Anthropic({
      apiKey,
    });
  }

  async processTaxDocuments(
    documents: TaxDocument[],
    filingStatus: string,
    taxYear: number
  ): Promise<ClaudeProcessingResult> {
    try {
      const prompt = this.createProcessingPrompt(
        documents,
        filingStatus,
        taxYear
      );

      const message = await this.client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        temperature: 0.1, // Low temperature for consistent, accurate results
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const responseContent = message.content[0];
      if (responseContent.type !== "text") {
        throw new Error("Unexpected response type from Claude");
      }

      const jsonMatch = responseContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in Claude response");
      }

      const parsedResult = JSON.parse(jsonMatch[0]) as ClaudeProcessingResult;

      // Validate the parsed result
      this.validateClaudeResult(parsedResult);

      return parsedResult;
    } catch (error) {
      console.error("Claude API error:", error);
      throw new Error(
        `Failed to process documents with Claude: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private createProcessingPrompt(
    documents: TaxDocument[],
    filingStatus: string,
    taxYear: number
  ): string {
    const documentTexts = documents
      .map(
        (doc) =>
          `Document: ${doc.filename} (${doc.type})\nContent:\n${doc.content}`
      )
      .join("\n\n");

    return `Please process the following tax documents for ${taxYear} tax filing as ${filingStatus}:

${documentTexts}

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

Please be accurate and only include information that is clearly stated in the documents. If information is not available, use 0 for numeric fields and empty strings for text fields.`;
  }

  private validateClaudeResult(result: any): void {
    const requiredFields = [
      "personalInfo.firstName",
      "personalInfo.lastName",
      "personalInfo.ssn",
      "personalInfo.address.street",
      "personalInfo.address.city",
      "personalInfo.address.state",
      "personalInfo.address.zipCode",
      "personalInfo.dateOfBirth",
      "income.wages",
      "income.selfEmployment",
      "income.interest",
      "income.dividends",
      "income.capitalGains",
      "income.rentalIncome",
      "income.otherIncome",
      "deductions.itemizedDeductions",
      "deductions.businessExpenses",
      "deductions.retirementContributions",
      "deductions.healthSavingsAccount",
      "credits.childTaxCredit",
      "credits.earnedIncomeCredit",
      "credits.educationCredits",
      "credits.otherCredits",
    ];

    for (const field of requiredFields) {
      const value = this.getNestedValue(result, field);
      if (value === undefined) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }
}
