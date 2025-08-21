// Tax document types and interfaces
export interface TaxDocument {
  id: string;
  type: TaxDocumentType;
  filename: string;
  content: string;
  uploadedAt: Date;
  processedData?: ProcessedTaxData;
}

export type TaxDocumentType =
  | "w2"
  | "1099"
  | "1095"
  | "schedule_c"
  | "schedule_d"
  | "schedule_e"
  | "form_1040"
  | "other";

export interface ProcessedTaxData {
  documentId: string;
  documentType: TaxDocumentType;
  extractedFields: Record<string, any>;
  confidence: number;
  processingDate: Date;
}

export interface TaxFilingData {
  personalInfo: PersonalInfo;
  income: IncomeData;
  deductions: DeductionData;
  credits: CreditData;
  filingStatus: FilingStatus;
  taxYear: number;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  ssn: string;
  address: Address;
  dateOfBirth: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface IncomeData {
  wages: number;
  selfEmployment: number;
  interest: number;
  dividends: number;
  capitalGains: number;
  rentalIncome: number;
  otherIncome: number;
  totalIncome: number;
}

export interface DeductionData {
  standardDeduction: number;
  itemizedDeductions: number;
  businessExpenses: number;
  retirementContributions: number;
  healthSavingsAccount: number;
  totalDeductions: number;
}

export interface CreditData {
  childTaxCredit: number;
  earnedIncomeCredit: number;
  educationCredits: number;
  otherCredits: number;
  totalCredits: number;
}

export interface TaxFilingResult {
  filingData: TaxFilingData;
  calculatedTax: CalculatedTax;
  forms: GeneratedForm[];
  summary: FilingSummary;
}

export interface CalculatedTax {
  grossIncome: number;
  adjustedGrossIncome: number;
  taxableIncome: number;
  federalTax: number;
  credits: number;
  finalTax: number;
  effectiveRate: number;
}

export interface GeneratedForm {
  formType: string;
  formNumber: string;
  content: string;
  instructions: string;
}

export interface FilingSummary {
  totalIncome: number;
  totalDeductions: number;
  totalCredits: number;
  taxOwed: number;
  refundAmount: number;
  filingDeadline: string;
  estimatedProcessingTime: string;
}

export type FilingStatus =
  | "single"
  | "married"
  | "head_of_household"
  | "qualifying_widow";

export interface DocumentProcessingRequest {
  documents: TaxDocument[];
  filingStatus: FilingStatus;
  taxYear: number;
  outputFormat: OutputFormat;
}

export type OutputFormat =
  | "json"
  | "pdf"
  | "xml"
  | "irs_efile"
  | "mail_ready"
  | "text";
