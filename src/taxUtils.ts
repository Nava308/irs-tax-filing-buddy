// Tax-related types and interfaces
export interface TaxBracket {
  minIncome: number;
  maxIncome: number | null;
  rate: number;
  description: string;
}

export interface TaxCalculationResult {
  taxableIncome: number;
  taxAmount: number;
  effectiveRate: number;
  bracket: TaxBracket;
}

export interface FilingStatus {
  status: 'single' | 'married' | 'head_of_household' | 'qualifying_widow';
  description: string;
  standardDeduction: number;
}

// Tax brackets for 2024 (simplified)
export const TAX_BRACKETS: Record<string, TaxBracket[]> = {
  single: [
    { minIncome: 0, maxIncome: 11600, rate: 0.10, description: "10% bracket" },
    { minIncome: 11600, maxIncome: 47150, rate: 0.12, description: "12% bracket" },
    { minIncome: 47150, maxIncome: 100525, rate: 0.22, description: "22% bracket" },
    { minIncome: 100525, maxIncome: 191950, rate: 0.24, description: "24% bracket" },
    { minIncome: 191950, maxIncome: 243725, rate: 0.32, description: "32% bracket" },
    { minIncome: 243725, maxIncome: 609350, rate: 0.35, description: "35% bracket" },
    { minIncome: 609350, maxIncome: null, rate: 0.37, description: "37% bracket" }
  ],
  married: [
    { minIncome: 0, maxIncome: 23200, rate: 0.10, description: "10% bracket" },
    { minIncome: 23200, maxIncome: 94300, rate: 0.12, description: "12% bracket" },
    { minIncome: 94300, maxIncome: 201050, rate: 0.22, description: "22% bracket" },
    { minIncome: 201050, maxIncome: 383900, rate: 0.24, description: "24% bracket" },
    { minIncome: 383900, maxIncome: 487450, rate: 0.32, description: "32% bracket" },
    { minIncome: 487450, maxIncome: 731200, rate: 0.35, description: "35% bracket" },
    { minIncome: 731200, maxIncome: null, rate: 0.37, description: "37% bracket" }
  ]
};

export const FILING_STATUSES: Record<string, FilingStatus> = {
  single: {
    status: 'single',
    description: 'Single filer',
    standardDeduction: 14600
  },
  married: {
    status: 'married',
    description: 'Married filing jointly',
    standardDeduction: 29200
  },
  head_of_household: {
    status: 'head_of_household',
    description: 'Head of household',
    standardDeduction: 21900
  },
  qualifying_widow: {
    status: 'qualifying_widow',
    description: 'Qualifying widow(er)',
    standardDeduction: 29200
  }
};

// Tax calculation functions
export function calculateTax(income: number, filingStatus: string): TaxCalculationResult {
  const brackets = TAX_BRACKETS[filingStatus] || TAX_BRACKETS.single;
  const standardDeduction = FILING_STATUSES[filingStatus]?.standardDeduction || FILING_STATUSES.single.standardDeduction;
  
  const taxableIncome = Math.max(0, income - standardDeduction);
  let taxAmount = 0;
  let currentBracket: TaxBracket | null = null;
  
  for (const bracket of brackets) {
    if (taxableIncome > bracket.minIncome) {
      const bracketIncome = bracket.maxIncome 
        ? Math.min(taxableIncome, bracket.maxIncome) - bracket.minIncome
        : taxableIncome - bracket.minIncome;
      
      taxAmount += bracketIncome * bracket.rate;
      currentBracket = bracket;
    }
  }
  
  const effectiveRate = taxableIncome > 0 ? (taxAmount / taxableIncome) * 100 : 0;
  
  return {
    taxableIncome,
    taxAmount,
    effectiveRate,
    bracket: currentBracket || brackets[0]
  };
}

export function getFilingDeadline(year: number): string {
  const deadline = new Date(year, 3, 15); // April 15th (month is 0-indexed)
  
  // Adjust for weekends
  while (deadline.getDay() === 0 || deadline.getDay() === 6) {
    deadline.setDate(deadline.getDate() + 1);
  }
  
  return deadline.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
