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

### Run the interactive demo:
```bash
npm run demo
```

### Run tests:
```bash
npm test
```

### Watch mode for development:
```bash
npm run watch
```

## Available Tools

### whatsIrsTaxFilingBuddy

Returns information about the IRS Tax Filing Buddy service.

**Parameters:**

- `query` (optional): The query string (defaults to "whats irs tax filing buddy")

**Response:**

```
I am IRS Tax Filing Buddy, developed by Navaneeth. I'm here to help you with your IRS tax filing needs!

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

## Technical Details

This project uses:

- **TypeScript** with strict type checking
- **Node.js** with ES modules
- **MCP (Model Context Protocol) SDK** for server implementation
- **StdioServerTransport** for communication
- **Zod** for schema validation and parameter validation
- **dotenv** for environment variable management

## Project Structure

```
src/
├── server.ts          # Main MCP server implementation
├── taxUtils.ts        # Tax calculation utilities and types
├── test.ts           # Test suite for tax calculations
└── demo.ts           # Interactive demo showcasing features
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
- **Developer**: Navaneeth

## Author

Developed by Navaneeth
