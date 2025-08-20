# IRS Tax Filing Buddy

A personal assistant for IRS tax filing assistance developed by Navaneeth.

## Description

IRS Tax Filing Buddy is an MCP (Model Context Protocol) server that provides assistance with IRS tax filing. It offers tools to get information about the service and receive tax filing assistance.

## Features

- **IRS Tax Filing Buddy Info**: Get information about the service and developer
- **Tax Assistance**: Provides guidance for tax-related questions
- **Developer Info**: Clearly identifies Navaneeth as the developer

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Start the server:

```bash
node server.js
```

### Run the interactive demo:

```bash
npm run demo
```

### Run tests:

```bash
npm test
```

## Available Tools

### whatsIrsTaxFilingBuddy

Returns information about the IRS Tax Filing Buddy.

**Parameters:**

- `query` (optional): The query string (defaults to "whats irs tax filing buddy")

**Response:**

```
I am IRS Tax Filing Buddy, developed by Navaneeth. I'm here to help you with your IRS tax filing needs!
```

### getTaxAssistance

Provides assistance for tax-related questions.

**Parameters:**

- `question` (required): The tax-related question or topic you need help with

**Response:**

```
As your IRS Tax Filing Buddy, I'm here to help with: "[your question]". Please provide more specific details about your tax situation so I can give you the best guidance possible.
```

## Technical Details

This project uses:

- **Node.js** with ES modules
- **MCP (Model Context Protocol) SDK** for server implementation
- **StdioServerTransport** for communication
- **Zod** for schema validation and parameter validation
- **dotenv** for environment variable management

## Server Configuration

- **Name**: IRS Tax Filing Buddy
- **Version**: 1.0.0
- **Transport**: StdioServerTransport
- **Developer**: Navaneeth

## Author

Developed by Navaneeth
