import { TaxDocument } from "../types/taxDocuments.js";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DocumentValidationRule {
  name: string;
  validate: (document: TaxDocument) => string[]; // Returns error messages
}

export class DocumentValidator {
  private rules: DocumentValidationRule[];

  constructor() {
    this.rules = [
      {
        name: "Required Fields",
        validate: this.validateRequiredFields.bind(this),
      },
      {
        name: "Content Length",
        validate: this.validateContentLength.bind(this),
      },
      {
        name: "Document Type Specific",
        validate: this.validateDocumentTypeSpecific.bind(this),
      },
      {
        name: "SSN Format",
        validate: this.validateSSNFormat.bind(this),
      },
      {
        name: "Date Formats",
        validate: this.validateDateFormats.bind(this),
      },
      {
        name: "Currency Values",
        validate: this.validateCurrencyValues.bind(this),
      },
    ];
  }

  validateDocument(document: TaxDocument): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of this.rules) {
      const ruleErrors = rule.validate(document);
      errors.push(...ruleErrors);
    }

    // Add warnings for potential issues
    warnings.push(...this.generateWarnings(document));

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  validateMultipleDocuments(documents: TaxDocument[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate each document individually
    for (const document of documents) {
      const result = this.validateDocument(document);
      errors.push(
        ...result.errors.map((err) => `${document.filename}: ${err}`)
      );
      warnings.push(
        ...result.warnings.map((warn) => `${document.filename}: ${warn}`)
      );
    }

    // Cross-document validation
    const crossDocErrors = this.validateCrossDocumentConsistency(documents);
    errors.push(...crossDocErrors);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateRequiredFields(document: TaxDocument): string[] {
    const errors: string[] = [];

    if (!document.filename || document.filename.trim() === "") {
      errors.push("Document filename is required");
    }

    if (!document.content || document.content.trim() === "") {
      errors.push("Document content is required");
    }

    if (!document.type) {
      errors.push("Document type is required");
    }

    return errors;
  }

  private validateContentLength(document: TaxDocument): string[] {
    const errors: string[] = [];

    if (document.content.length < 10) {
      errors.push("Document content is too short (minimum 10 characters)");
    }

    if (document.content.length > 50000) {
      errors.push("Document content is too long (maximum 50,000 characters)");
    }

    return errors;
  }

  private validateDocumentTypeSpecific(document: TaxDocument): string[] {
    const errors: string[] = [];

    switch (document.type) {
      case "w2":
        errors.push(...this.validateW2Content(document));
        break;
      case "1099":
        errors.push(...this.validate1099Content(document));
        break;
      case "1095":
        errors.push(...this.validate1095Content(document));
        break;
      case "schedule_c":
        errors.push(...this.validateScheduleCContent(document));
        break;
      case "schedule_d":
        errors.push(...this.validateScheduleDContent(document));
        break;
      case "schedule_e":
        errors.push(...this.validateScheduleEContent(document));
        break;
      case "form_1040":
        errors.push(...this.validateForm1040Content(document));
        break;
    }

    return errors;
  }

  private validateW2Content(document: TaxDocument): string[] {
    const errors: string[] = [];
    const content = document.content.toLowerCase();

    const requiredFields = ["w-2", "wage", "employer", "employee"];

    for (const field of requiredFields) {
      if (!content.includes(field)) {
        errors.push(`W-2 document should contain '${field}' information`);
      }
    }

    return errors;
  }

  private validate1099Content(document: TaxDocument): string[] {
    const errors: string[] = [];
    const content = document.content.toLowerCase();

    const requiredFields = ["1099", "payer", "recipient"];

    for (const field of requiredFields) {
      if (!content.includes(field)) {
        errors.push(`1099 document should contain '${field}' information`);
      }
    }

    return errors;
  }

  private validate1095Content(document: TaxDocument): string[] {
    const errors: string[] = [];
    const content = document.content.toLowerCase();

    const requiredFields = ["1095", "health", "coverage", "employer"];

    for (const field of requiredFields) {
      if (!content.includes(field)) {
        errors.push(`1095 document should contain '${field}' information`);
      }
    }

    return errors;
  }

  private validateScheduleCContent(document: TaxDocument): string[] {
    const errors: string[] = [];
    const content = document.content.toLowerCase();

    if (!content.includes("business") && !content.includes("self-employment")) {
      errors.push(
        "Schedule C should contain business or self-employment information"
      );
    }

    return errors;
  }

  private validateScheduleDContent(document: TaxDocument): string[] {
    const errors: string[] = [];
    const content = document.content.toLowerCase();

    if (
      !content.includes("capital") &&
      !content.includes("gain") &&
      !content.includes("loss")
    ) {
      errors.push("Schedule D should contain capital gains/losses information");
    }

    return errors;
  }

  private validateScheduleEContent(document: TaxDocument): string[] {
    const errors: string[] = [];
    const content = document.content.toLowerCase();

    if (!content.includes("rental") && !content.includes("royalty")) {
      errors.push(
        "Schedule E should contain rental or royalty income information"
      );
    }

    return errors;
  }

  private validateForm1040Content(document: TaxDocument): string[] {
    const errors: string[] = [];
    const content = document.content.toLowerCase();

    if (!content.includes("1040")) {
      errors.push("Form 1040 should contain 1040 form information");
    }

    return errors;
  }

  private validateSSNFormat(document: TaxDocument): string[] {
    const errors: string[] = [];
    const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/;
    const content = document.content;

    // Look for SSN patterns
    const ssnMatches = content.match(ssnPattern);
    if (ssnMatches) {
      // Check if SSNs are properly masked
      for (const match of ssnMatches) {
        if (!match.includes("***") && !match.includes("XXX")) {
          errors.push("SSN should be masked (e.g., ***-**-1234) for security");
        }
      }
    }

    return errors;
  }

  private validateDateFormats(document: TaxDocument): string[] {
    const errors: string[] = [];
    const content = document.content;

    // Look for various date formats
    const datePatterns = [
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/, // MM/DD/YYYY
      /\b\d{4}-\d{2}-\d{2}\b/, // YYYY-MM-DD
      /\b\d{1,2}-\d{1,2}-\d{4}\b/, // MM-DD-YYYY
    ];

    for (const pattern of datePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          if (!this.isValidDate(match)) {
            errors.push(`Invalid date format: ${match}`);
          }
        }
      }
    }

    return errors;
  }

  private validateCurrencyValues(document: TaxDocument): string[] {
    const errors: string[] = [];
    const content = document.content;

    // Look for currency amounts
    const currencyPattern = /\$\s*\d{1,3}(,\d{3})*(\.\d{2})?/g;
    const matches = content.match(currencyPattern);

    if (matches) {
      for (const match of matches) {
        const amount = parseFloat(match.replace(/[$,]/g, ""));
        if (isNaN(amount) || amount < 0) {
          errors.push(`Invalid currency amount: ${match}`);
        }
        if (amount > 999999999) {
          errors.push(`Suspiciously large amount: ${match}`);
        }
      }
    }

    return errors;
  }

  private generateWarnings(document: TaxDocument): string[] {
    const warnings: string[] = [];
    const content = document.content.toLowerCase();

    // Check for potential issues
    if (content.includes("test") || content.includes("sample")) {
      warnings.push("Document appears to contain test/sample data");
    }

    if (content.includes("placeholder") || content.includes("example")) {
      warnings.push("Document contains placeholder or example data");
    }

    if (content.length < 100) {
      warnings.push("Document content seems unusually short");
    }

    return warnings;
  }

  private validateCrossDocumentConsistency(documents: TaxDocument[]): string[] {
    const errors: string[] = [];

    // Check for duplicate document types
    const documentTypes = documents.map((d) => d.type);
    const uniqueTypes = new Set(documentTypes);

    if (documentTypes.length !== uniqueTypes.size) {
      errors.push("Duplicate document types detected");
    }

    // Check for consistent tax year references
    const taxYearPattern = /\b20\d{2}\b/g;
    const taxYears = new Set<number>();

    for (const document of documents) {
      const matches = document.content.match(taxYearPattern);
      if (matches) {
        matches.forEach((match) => taxYears.add(parseInt(match)));
      }
    }

    if (taxYears.size > 1) {
      errors.push("Multiple tax years detected across documents");
    }

    return errors;
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return (
      !isNaN(date.getTime()) &&
      date.getFullYear() > 1900 &&
      date.getFullYear() < 2100
    );
  }
}
