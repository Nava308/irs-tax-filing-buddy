# IRS Tax Filing Buddy

A personal assistant for IRS tax filing assistance developed by Navaneeth, built with TypeScript and the Model Context Protocol (MCP).

## Description

IRS Tax Filing Buddy is an MCP (Model Context Protocol) server that provides comprehensive assistance with IRS tax filing. It offers tools for tax calculations, filing status information, deadline tracking, and general tax guidance.

## Features

- **Tax Calculator**: Calculate federal income tax based on income and filing status
- **Filing Status Information**: Get details about different filing statuses and standard deductions
- **Tax Bracket Lookup**: View current tax brackets for different filing statuses
- **Filing Deadline Tracker**: Get tax filing deadlines for any year
- **General Tax Guidance**: Get assistance with common tax topics
- **IRS Tax Filing Buddy Info**: Get information about the service and developer

## Installation

1. Clone or download this repository
2. Install dependencies:
3. Set up environment variables (optional):
   ```bash
   # Create .env file
   CLAUDE_API_KEY=your_claude_api_key_here
   ```
   ```bash
   npm install
   ```

## Usage

### Build the project:

```bash
npm run build
```

### Start the server:

```bash
npm start
```

### Development mode (build and run):

```bash
npm run dev
```

### Run the interactive demos:

```bash
npm run demo                # Tax calculation demo
npm run demo:documents      # Document processing demo
```

### Run tests:

```bash
npm test                    # Run all tests
npm run test:tax           # Run only tax calculation tests
npm run test:docs          # Run only document processing tests
npm run test:enhanced      # Run only enhanced features tests
```

### Watch mode for development:

```bash
npm run watch
```

## Available Tools

### whoAreYou

Get information about who I am and my team.

**Parameters:**

- `query` (optional): The query string (defaults to "who are you")

**Response:**

```
I am IRS Tax Filing Buddy, developed by Navaneeth Kumar Buddi and assisted by tax specialist Navyasri Dukkipati. I'm here to help you with your IRS tax filing needs!

My capabilities include:
• Tax calculation
• Filing status information
• Tax bracket lookup
• Filing deadline information
• General tax guidance
```

### whatsIrsTaxFilingBuddy

Returns information about the IRS Tax Filing Buddy service.

**Parameters:**

- `query` (optional): The query string (defaults to "whats irs tax filing buddy")

**Response:**

```
I am IRS Tax Filing Buddy, developed by Navaneeth Kumar Buddi and assisted by tax specialist Navyasri Dukkipati. I'm here to help you with your IRS tax filing needs!

My capabilities include:
• Tax calculation
• Filing status information
• Tax bracket lookup
• Filing deadline information
• General tax guidance
```

### calculateTax

Calculate federal income tax based on income and filing status.

**Parameters:**

- `income` (required): Annual gross income in USD
- `filingStatus` (required): Filing status ('single', 'married', 'head_of_household', 'qualifying_widow')

**Response:**

```
Tax Calculation Results:

Filing Status: Single filer
Gross Income: $50,000
Standard Deduction: $14,600
Taxable Income: $35,400
Tax Amount: $4,048
Effective Tax Rate: 11.44%
Tax Bracket: 12% bracket (12%)
```

### getFilingStatusInfo

Get information about different filing statuses and their standard deductions.

**Parameters:**

- `status` (optional): Specific filing status to get info for

**Response:**

```
Available Filing Statuses and Standard Deductions (2024):

• Single filer: $14,600
• Married filing jointly: $29,200
• Head of household: $21,900
• Qualifying widow(er): $29,200

Use the 'status' parameter to get detailed information about a specific filing status.
```

### getFilingDeadline

Get the tax filing deadline for a specific year.

**Parameters:**

- `year` (optional): Tax year (defaults to current year)

**Response:**

```
Tax Filing Deadline for 2024:
Monday, April 15, 2024

You have 45 days until the deadline.
```

### getTaxAssistance

Get general assistance for tax-related questions.

**Parameters:**

- `question` (required): The tax-related question or topic you need help with

**Response:**

```
As your IRS Tax Filing Buddy, I'm here to help with: "What are common deductions?"

Common deductions include:
• Standard deduction (varies by filing status)
• State and local taxes (SALT)
• Mortgage interest
• Charitable contributions
• Medical expenses (if over 7.5% of AGI)
• Business expenses (if self-employed)
```

### uploadTaxDocument

Upload a tax document for processing (W2, 1099, etc.).

**Parameters:**

- `filename` (required): Name of the document file
- `content` (required): Content of the tax document
- `documentType` (required): Type of tax document ('w2', '1099', 'schedule_c', 'schedule_d', 'schedule_e', 'form_1040', 'other')

**Response:**

```
Document uploaded successfully!

Document ID: doc_1234567890_abc123
Filename: w2_2024.txt
Type: w2

You can now use this document ID with other tax processing tools.
```

### processTaxDocuments

Process uploaded tax documents with Claude and generate tax filing data.

**Parameters:**

- `documentIds` (required): Array of document IDs to process
- `filingStatus` (required): Filing status ('single', 'married', 'head_of_household', 'qualifying_widow')
- `taxYear` (required): Tax year (e.g., 2024)

**Response:**

```
Documents processed successfully!

Tax Filing Summary:
Name: John Doe
Filing Status: single
Tax Year: 2024
Total Income: $75,700
Wages: $75,000
Interest: $500
Dividends: $200

Use the generateTaxFiling tool to create complete tax forms.
```

### generateTaxFiling

Generate complete tax filing with forms in specified format.

**Parameters:**

- `documentIds` (required): Array of document IDs to include
- `filingStatus` (required): Filing status
- `taxYear` (required): Tax year
- `outputFormat` (required): Output format ('json', 'pdf', 'xml', 'irs_efile', 'mail_ready')

**Response:**

```
Tax Filing Generated Successfully!

📊 SUMMARY:
Total Income: $75,700
Total Deductions: $14,600
Total Credits: $0
Tax Owed: $7,175
Refund Amount: $0
Filing Deadline: April 15, 2025

📋 FORMS GENERATED (JSON format):
• 1040: Individual Income Tax Return

📄 FORM CONTENTS:
--- 1040 ---
{
  "form": "1040",
  "personalInfo": { ... },
  "income": { ... },
  "calculatedTax": { ... }
}
```

## Enhanced Features

### 🔍 **Document Validation**
- **Comprehensive validation rules** for all tax document types
- **Security checks** for SSN masking and data integrity
- **Cross-document consistency** validation
- **Real-time warnings** for potential issues

### 🤖 **Real Claude API Integration**
- **Production-ready Claude API** integration (with fallback to simulation)
- **Structured data extraction** from tax documents
- **Error handling** and graceful degradation
- **Configurable via environment variables**

### 📄 **PDF Generation**
- **Professional PDF forms** (Form 1040, Schedule C, Schedule D)
- **Multiple output formats**: JSON, XML, PDF, IRS E-file, Mail-ready
- **Complete tax filing packages** with all required forms
- **Base64 encoded output** for easy transmission

### 🛡️ **Security & Compliance**
- **SSN masking validation** to prevent data exposure
- **Document content validation** to ensure accuracy
- **Error handling** with detailed feedback
- **Graceful fallbacks** when services are unavailable

## Technical Details

This project uses:

- **TypeScript** with strict type checking
- **Node.js** with ES modules
- **MCP (Model Context Protocol) SDK** for server implementation
- **StdioServerTransport** for communication
- **Zod** for schema validation and parameter validation
- **dotenv** for environment variable management
- **@anthropic-ai/sdk** for Claude API integration
- **pdfkit** for PDF generation
- **TypeScript** for type safety and development experience

## Project Structure

```
src/
├── server.ts                    # Main MCP server implementation
├── taxUtils.ts                  # Tax calculation utilities and types
├── services/
│   ├── documentProcessor.ts     # Document processing service
│   ├── claudeService.ts         # Claude API integration
│   ├── documentValidator.ts     # Document validation service
│   └── pdfGenerator.ts          # PDF generation service
└── types/
    └── taxDocuments.ts          # TypeScript interfaces for tax documents

test/
├── taxCalculation.test.ts       # Tax calculation tests
├── documentProcessing.test.ts   # Document processing tests
├── enhancedFeatures.test.ts     # Enhanced features tests
└── runAllTests.ts              # Test suite runner

demos/
├── demo.ts                     # Interactive tax calculation demo
└── documentDemo.ts             # Document processing demo
```

## Tax Calculation Features

- **2024 Tax Brackets**: Up-to-date federal income tax brackets
- **Standard Deductions**: Current standard deduction amounts
- **Progressive Tax Calculation**: Accurate calculation across multiple brackets
- **Multiple Filing Statuses**: Support for single, married, head of household, and qualifying widow(er)
- **Effective Tax Rate**: Calculates overall effective tax rate
- **Weekend Deadline Adjustment**: Automatically adjusts filing deadlines for weekends

## Server Configuration

- **Name**: IRS Tax Filing Buddy
- **Version**: 1.0.0
- **Transport**: StdioServerTransport
- **Developer**: Navaneeth Kumar Buddi
- **Tax Specialist**: Navyasri Dukkipati

## Connecting to Claude

To connect your IRS Tax Filing Buddy to Claude Desktop:

### 1. Build the Project

```bash
npm run build
```

### 2. Add MCP Configuration to Claude Desktop

Open Claude Desktop settings and add this configuration to the MCP section:

```json
{
  "mcpServers": {
    "irs-tax-filing-buddy": {
      "command": "node",
      "args": [
        "/Users/navaneethkumarbuddi/Desktop/irs-tax-filing-buddy/dist/server.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**Note**: Update the path to match your actual project location.

### 3. Restart Claude Desktop

After adding the configuration, restart Claude Desktop for the changes to take effect.

### 4. Test the Connection

Once connected, you can ask Claude to use your tax tools:

- "Who are you?" (uses `whoAreYou` tool)
- "Calculate tax for $50,000 income as single filer" (uses `calculateTax` tool)
- "What are the filing deadlines for 2024?" (uses `getFilingDeadline` tool)
- "Tell me about filing statuses" (uses `getFilingStatusInfo` tool)
- "Help me with tax deductions" (uses `getTaxAssistance` tool)

### Troubleshooting

- **JSON parsing errors**: Make sure the server is built (`npm run build`)
- **Server disconnected**: Check that the file path in the configuration is correct
- **Tools not available**: Restart Claude Desktop after adding the configuration

## Team

- **Developer**: Navaneeth Kumar Buddi
- **Tax Specialist**: Navyasri Dukkipati
