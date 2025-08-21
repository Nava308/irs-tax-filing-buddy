import PDFDocument from 'pdfkit';
import { TaxFilingData, CalculatedTax } from '../types/taxDocuments.js';

export class PDFGenerator {
  generateForm1040PDF(filingData: TaxFilingData, calculatedTax: CalculatedTax): Promise<Buffer> {
    return new Promise<Buffer>((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .text('FORM 1040 - U.S. INDIVIDUAL INCOME TAX RETURN', { align: 'center' });
      
      doc.moveDown(0.5);
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Tax Year: ${filingData.taxYear}`, { align: 'center' });
      
      doc.moveDown(1);

      // Personal Information Section
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('PERSONAL INFORMATION');
      
      doc.moveDown(0.5);
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Name: ${filingData.personalInfo.firstName} ${filingData.personalInfo.lastName}`)
         .text(`SSN: ${filingData.personalInfo.ssn}`)
         .text(`Address: ${filingData.personalInfo.address.street}`)
         .text(`         ${filingData.personalInfo.address.city}, ${filingData.personalInfo.address.state} ${filingData.personalInfo.address.zipCode}`)
         .text(`Date of Birth: ${filingData.personalInfo.dateOfBirth}`)
         .text(`Filing Status: ${filingData.filingStatus}`);

      doc.moveDown(1);

      // Income Section
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('INCOME');
      
      doc.moveDown(0.5);
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Wages: $${filingData.income.wages.toLocaleString()}`)
         .text(`Self-Employment: $${filingData.income.selfEmployment.toLocaleString()}`)
         .text(`Interest: $${filingData.income.interest.toLocaleString()}`)
         .text(`Dividends: $${filingData.income.dividends.toLocaleString()}`)
         .text(`Capital Gains: $${filingData.income.capitalGains.toLocaleString()}`)
         .text(`Rental Income: $${filingData.income.rentalIncome.toLocaleString()}`)
         .text(`Other Income: $${filingData.income.otherIncome.toLocaleString()}`);

      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(`Total Income: $${filingData.income.totalIncome.toLocaleString()}`);

      doc.moveDown(1);

      // Deductions Section
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('DEDUCTIONS');
      
      doc.moveDown(0.5);
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Itemized Deductions: $${filingData.deductions.itemizedDeductions.toLocaleString()}`)
         .text(`Business Expenses: $${filingData.deductions.businessExpenses.toLocaleString()}`)
         .text(`Retirement Contributions: $${filingData.deductions.retirementContributions.toLocaleString()}`)
         .text(`Health Savings Account: $${filingData.deductions.healthSavingsAccount.toLocaleString()}`);

      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(`Total Deductions: $${filingData.deductions.totalDeductions.toLocaleString()}`);

      doc.moveDown(1);

      // Credits Section
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('CREDITS');
      
      doc.moveDown(0.5);
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Child Tax Credit: $${filingData.credits.childTaxCredit.toLocaleString()}`)
         .text(`Earned Income Credit: $${filingData.credits.earnedIncomeCredit.toLocaleString()}`)
         .text(`Education Credits: $${filingData.credits.educationCredits.toLocaleString()}`)
         .text(`Other Credits: $${filingData.credits.otherCredits.toLocaleString()}`);

      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(`Total Credits: $${filingData.credits.totalCredits.toLocaleString()}`);

      doc.moveDown(1);

      // Tax Calculation Section
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('TAX CALCULATION');
      
      doc.moveDown(0.5);
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Taxable Income: $${calculatedTax.taxableIncome.toLocaleString()}`)
         .text(`Tax Amount: $${calculatedTax.finalTax.toLocaleString()}`)
         .text(`Effective Tax Rate: ${calculatedTax.effectiveRate.toFixed(2)}%`)
         .text(`Tax Bracket: ${calculatedTax.federalTax > 0 ? 'Progressive' : 'None'}`);

      doc.moveDown(1);

      // Summary Section
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('SUMMARY');
      
      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(`Tax Owed: $${calculatedTax.finalTax.toLocaleString()}`)
         .text(`Refund Amount: $${Math.max(0, calculatedTax.credits - calculatedTax.finalTax).toLocaleString()}`);

      doc.moveDown(1);

      // Footer
      doc.fontSize(8)
         .font('Helvetica')
         .text('This document was generated by IRS Tax Filing Buddy', { align: 'center' })
         .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });

      doc.end();
    });
  }

  generateScheduleCPDF(filingData: TaxFilingData): Promise<Buffer> {
    return new Promise<Buffer>((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .text('SCHEDULE C - PROFIT OR LOSS FROM BUSINESS', { align: 'center' });
      
      doc.moveDown(0.5);
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Tax Year: ${filingData.taxYear}`, { align: 'center' });
      
      doc.moveDown(1);

      // Business Information
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('BUSINESS INFORMATION');
      
      doc.moveDown(0.5);
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Business Name: ${filingData.personalInfo.firstName} ${filingData.personalInfo.lastName} Business`)
         .text(`Business Type: Sole Proprietorship`)
         .text(`Business Code: 541511 (Computer Programming Services)`);

      doc.moveDown(1);

      // Income
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('INCOME');
      
      doc.moveDown(0.5);
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Gross Receipts: $${filingData.income.selfEmployment.toLocaleString()}`)
         .text(`Returns and Allowances: $0`)
         .text(`Other Income: $0`);

      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(`Gross Income: $${filingData.income.selfEmployment.toLocaleString()}`);

      doc.moveDown(1);

      // Expenses
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('EXPENSES');
      
      doc.moveDown(0.5);
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Business Expenses: $${filingData.deductions.businessExpenses.toLocaleString()}`);

      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(`Total Expenses: $${filingData.deductions.businessExpenses.toLocaleString()}`);

      doc.moveDown(1);

      // Net Profit/Loss
      const netProfit = filingData.income.selfEmployment - filingData.deductions.businessExpenses;
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('NET PROFIT OR LOSS');
      
      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(`Net Profit: $${Math.max(0, netProfit).toLocaleString()}`);

      doc.moveDown(1);

      // Footer
      doc.fontSize(8)
         .font('Helvetica')
         .text('This document was generated by IRS Tax Filing Buddy', { align: 'center' })
         .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });

      doc.end();
    });
  }

  generateScheduleDPDF(filingData: TaxFilingData): Promise<Buffer> {
    return new Promise<Buffer>((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .text('SCHEDULE D - CAPITAL GAINS AND LOSSES', { align: 'center' });
      
      doc.moveDown(0.5);
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Tax Year: ${filingData.taxYear}`, { align: 'center' });
      
      doc.moveDown(1);

      // Summary
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('CAPITAL GAINS SUMMARY');
      
      doc.moveDown(0.5);
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Short-term Capital Gains: $${filingData.income.capitalGains.toLocaleString()}`)
         .text(`Long-term Capital Gains: $0`)
         .text(`Total Capital Gains: $${filingData.income.capitalGains.toLocaleString()}`);

      doc.moveDown(1);

      // Footer
      doc.fontSize(8)
         .font('Helvetica')
         .text('This document was generated by IRS Tax Filing Buddy', { align: 'center' })
         .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });

      doc.end();
    });
  }
}
