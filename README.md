# IRS Tax Filing Buddy

A personal assistant for IRS tax filing assistance developed by Navaneeth.

## Description

IRS Tax Filing Buddy is an MCP (Model Context Protocol) server that provides assistance with IRS tax filing. When asked "who am i", it responds with information about being the IRS Tax Filing Buddy developed by Navaneeth.

## Features

- **Who Am I**: Responds with information about the IRS Tax Filing Buddy
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
npm start
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

### whoAmI
Returns information about the IRS Tax Filing Buddy.

**Parameters:**
- `query` (optional): The query string (defaults to "who am i")

**Response:**
```
I am IRS Tax Filing Buddy, developed by Navaneeth. I'm here to help you with your IRS tax filing needs!
```

### getTaxAssistance
Provides assistance for tax-related questions.

**Parameters:**
- `question`: The tax-related question or topic you need help with

## Development

This project uses:
- Node.js
- MCP (Model Context Protocol) SDK
- Zod for schema validation

## Author

Developed by Navaneeth
