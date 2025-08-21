import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import { z } from "zod";
import { DocumentProcessor } from "./services/documentProcessor.js";
import {
  calculateTax,
  FILING_STATUSES,
  getFilingDeadline,
  TAX_BRACKETS,
} from "./taxUtils.js";
import { TaxDocumentType } from "./types/taxDocuments.js";

dotenv.config();

// Create the MCP server
const server = new McpServer(
  {
    name: "IRS Tax Filing Buddy",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize document processor
const documentProcessor = new DocumentProcessor();

// Tool function for IRS Tax Filing Buddy info
async function getTaxBuddyInfo() {
  return {
    name: "IRS Tax Filing Buddy",
    developer: "Navaneeth Kumar Buddi",
    taxSpecialist: "Navyasri Dukkipati",
    description: "Your personal assistant for IRS tax filing assistance",
    capabilities: [
      "Tax calculation",
      "Filing status information",
      "Tax bracket lookup",
      "Filing deadline information",
      "General tax guidance",
    ],
  };
}

// Register tools
// "Who are you" tool with higher precedence
server.registerTool(
  "whoAreYou",
  {
    title: "Who Are You",
    description: "Get information about who I am and my team",
    inputSchema: {
      query: z.string().optional().default("who are you"),
    },
  },
  async ({ query: _query }) => {
    const info = await getTaxBuddyInfo();
    return {
      content: [
        {
          type: "text",
          text: `I am ${info.name}, developed by ${
            info.developer
          } and assisted by tax specialist ${
            info.taxSpecialist
          }. I'm here to help you with your IRS tax filing needs!\n\nMy capabilities include:\n${info.capabilities
            .map((cap) => `• ${cap}`)
            .join("\n")}`,
        },
      ],
    };
  }
);

server.registerTool(
  "whatsIrsTaxFilingBuddy",
  {
    title: "IRS Tax Filing Buddy Information",
    description: "Get information about the IRS Tax Filing Buddy service",
    inputSchema: {
      query: z.string().optional().default("whats irs tax filing buddy"),
    },
  },
  async ({ query: _query }) => {
    const info = await getTaxBuddyInfo();
    return {
      content: [
        {
          type: "text",
          text: `I am ${info.name}, developed by ${
            info.developer
          } and assisted by tax specialist ${
            info.taxSpecialist
          }. I'm here to help you with your IRS tax filing needs!\n\nMy capabilities include:\n${info.capabilities
            .map((cap) => `• ${cap}`)
            .join("\n")}`,
        },
      ],
    };
  }
);

// Tax calculation tool
server.registerTool(
  "calculateTax",
  {
    title: "Tax Calculator",
    description:
      "Calculate federal income tax based on income and filing status",
    inputSchema: {
      income: z.number().describe("Annual gross income in USD"),
      filingStatus: z
        .enum(["single", "married", "head_of_household", "qualifying_widow"])
        .describe("Filing status"),
    },
  },
  async ({ income, filingStatus }) => {
    const result = calculateTax(income, filingStatus);
    const status = FILING_STATUSES[filingStatus];

    return {
      content: [
        {
          type: "text",
          text:
            `Tax Calculation Results:\n\n` +
            `Filing Status: ${status.description}\n` +
            `Gross Income: $${income.toLocaleString()}\n` +
            `Standard Deduction: $${status.standardDeduction.toLocaleString()}\n` +
            `Taxable Income: $${result.taxableIncome.toLocaleString()}\n` +
            `Tax Amount: $${result.taxAmount.toLocaleString()}\n` +
            `Effective Tax Rate: ${result.effectiveRate.toFixed(2)}%\n` +
            `Tax Bracket: ${result.bracket.description} (${(
              result.bracket.rate * 100
            ).toFixed(0)}%)`,
        },
      ],
    };
  }
);

// Filing status information tool
server.registerTool(
  "getFilingStatusInfo",
  {
    title: "Filing Status Information",
    description:
      "Get information about different filing statuses and their standard deductions",
    inputSchema: {
      status: z
        .enum(["single", "married", "head_of_household", "qualifying_widow"])
        .optional()
        .describe("Specific filing status to get info for (optional)"),
    },
  },
  async ({ status }) => {
    if (status) {
      const filingStatus = FILING_STATUSES[status];
      return {
        content: [
          {
            type: "text",
            text:
              `Filing Status: ${filingStatus.description}\n` +
              `Standard Deduction (2024): $${filingStatus.standardDeduction.toLocaleString()}\n\n` +
              `Tax Brackets:\n${TAX_BRACKETS[status]
                .map(
                  (bracket) =>
                    `• $${bracket.minIncome.toLocaleString()} - ${
                      bracket.maxIncome
                        ? `$${bracket.maxIncome.toLocaleString()}`
                        : "unlimited"
                    }: ${(bracket.rate * 100).toFixed(0)}%`
                )
                .join("\n")}`,
          },
        ],
      };
    } else {
      const allStatuses = Object.entries(FILING_STATUSES)
        .map(
          ([, value]) =>
            `• ${
              value.description
            }: $${value.standardDeduction.toLocaleString()}`
        )
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `Available Filing Statuses and Standard Deductions (2024):\n\n${allStatuses}\n\nUse the 'status' parameter to get detailed information about a specific filing status.`,
          },
        ],
      };
    }
  }
);

// Filing deadline tool
server.registerTool(
  "getFilingDeadline",
  {
    title: "Tax Filing Deadline",
    description: "Get the tax filing deadline for a specific year",
    inputSchema: {
      year: z
        .number()
        .optional()
        .default(new Date().getFullYear())
        .describe("Tax year (defaults to current year)"),
    },
  },
  async ({ year }) => {
    const deadline = getFilingDeadline(year);
    const currentYear = new Date().getFullYear();
    const isCurrentYear = year === currentYear;

    let additionalInfo = "";
    if (isCurrentYear) {
      const today = new Date();
      const deadlineDate = new Date(year, 3, 15);
      const daysUntilDeadline = Math.ceil(
        (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilDeadline > 0) {
        additionalInfo = `\n\nYou have ${daysUntilDeadline} days until the deadline.`;
      } else if (daysUntilDeadline === 0) {
        additionalInfo = "\n\nToday is the deadline!";
      } else {
        additionalInfo =
          "\n\nThe deadline has passed. Consider filing for an extension if needed.";
      }
    }

    return {
      content: [
        {
          type: "text",
          text: `Tax Filing Deadline for ${year}:\n${deadline}${additionalInfo}`,
        },
      ],
    };
  }
);

// General tax assistance tool
server.registerTool(
  "getTaxAssistance",
  {
    title: "Tax Assistance",
    description: "Get general assistance for tax-related questions",
    inputSchema: {
      question: z
        .string()
        .describe("The tax-related question or topic you need help with"),
    },
  },
  async ({ question }) => {
    const commonTopics = [
      "deductions",
      "credits",
      "extensions",
      "refunds",
      "payment plans",
      "business expenses",
      "home office",
      "charitable donations",
      "retirement accounts",
    ];

    const lowerQuestion = question.toLowerCase();
    let response = `As your IRS Tax Filing Buddy, I'm here to help with: "${question}"\n\n`;

    // Provide specific guidance for common topics
    if (
      lowerQuestion.includes("deduction") ||
      lowerQuestion.includes("deduct")
    ) {
      response +=
        "Common deductions include:\n• Standard deduction (varies by filing status)\n• State and local taxes (SALT)\n• Mortgage interest\n• Charitable contributions\n• Medical expenses (if over 7.5% of AGI)\n• Business expenses (if self-employed)";
    } else if (
      lowerQuestion.includes("credit") ||
      lowerQuestion.includes("refund")
    ) {
      response +=
        "Common tax credits include:\n• Child Tax Credit\n• Earned Income Tax Credit (EITC)\n• American Opportunity Credit (education)\n• Lifetime Learning Credit\n• Child and Dependent Care Credit";
    } else if (
      lowerQuestion.includes("extension") ||
      lowerQuestion.includes("deadline")
    ) {
      response +=
        "If you need more time to file:\n• File Form 4868 for an automatic 6-month extension\n• Extension must be filed by the original deadline\n• Extension gives you time to file, not to pay\n• You may still owe penalties and interest on unpaid taxes";
    } else if (
      lowerQuestion.includes("payment") ||
      lowerQuestion.includes("owe")
    ) {
      response +=
        "Payment options if you owe taxes:\n• Installment Agreement (Form 9465)\n• Offer in Compromise\n• Currently Not Collectible status\n• Pay with credit card (fees apply)\n• Set up automatic payments";
    } else {
      response +=
        "Please provide more specific details about your tax situation so I can give you the best guidance possible. Common topics I can help with include: " +
        commonTopics.join(", ");
    }

    return {
      content: [
        {
          type: "text",
          text: response,
        },
      ],
    };
  }
);

// Document processing tools
server.registerTool(
  "uploadTaxDocument",
  {
    title: "Upload Tax Document",
    description: "Upload a tax document for processing (W2, 1099, etc.)",
    inputSchema: {
      filename: z.string().describe("Name of the document file"),
      content: z.string().describe("Content of the tax document"),
      documentType: z
        .enum([
          "w2",
          "1099",
          "1095",
          "schedule_c",
          "schedule_d",
          "schedule_e",
          "form_1040",
          "other",
        ])
        .describe("Type of tax document"),
    },
  },
  async ({ filename, content, documentType }) => {
    try {
      const documentId = await documentProcessor.uploadDocument(
        filename,
        content,
        documentType
      );
      return {
        content: [
          {
            type: "text",
            text: `Document uploaded successfully!\n\nDocument ID: ${documentId}\nFilename: ${filename}\nType: ${documentType}\n\nYou can now use this document ID with other tax processing tools.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error uploading document: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "processTaxDocuments",
  {
    title: "Process Tax Documents",
    description:
      "Process uploaded tax documents with Claude and generate tax filing data",
    inputSchema: {
      documentIds: z
        .array(z.string())
        .describe("Array of document IDs to process"),
      filingStatus: z
        .enum(["single", "married", "head_of_household", "qualifying_widow"])
        .describe("Filing status for tax calculation"),
      taxYear: z.number().describe("Tax year (e.g., 2024)"),
    },
  },
  async ({ documentIds, filingStatus, taxYear }) => {
    try {
      const filingData = await documentProcessor.processDocumentsWithClaude(
        documentIds,
        filingStatus,
        taxYear
      );

      return {
        content: [
          {
            type: "text",
            text:
              `Documents processed successfully!\n\nTax Filing Summary:\n` +
              `Name: ${filingData.personalInfo.firstName} ${filingData.personalInfo.lastName}\n` +
              `Filing Status: ${filingData.filingStatus}\n` +
              `Tax Year: ${filingData.taxYear}\n` +
              `Total Income: $${filingData.income.totalIncome.toLocaleString()}\n` +
              `Wages: $${filingData.income.wages.toLocaleString()}\n` +
              `Interest: $${filingData.income.interest.toLocaleString()}\n` +
              `Dividends: $${filingData.income.dividends.toLocaleString()}\n\n` +
              `Use the generateTaxFiling tool to create complete tax forms.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error processing documents: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "generateTaxFiling",
  {
    title: "Generate Complete Tax Filing",
    description: "Generate complete tax filing with forms in specified format",
    inputSchema: {
      documentIds: z
        .array(z.string())
        .describe("Array of document IDs to include"),
      filingStatus: z
        .enum(["single", "married", "head_of_household", "qualifying_widow"])
        .describe("Filing status"),
      taxYear: z.number().describe("Tax year"),
      outputFormat: z
        .enum(["json", "pdf", "xml", "irs_efile", "mail_ready"])
        .describe("Output format for tax forms"),
    },
  },
  async ({ documentIds, filingStatus, taxYear, outputFormat }) => {
    try {
      const documents = documentIds.map((id) => ({
        id,
        type: "other" as TaxDocumentType,
        filename: `document_${id}`,
        content: "",
        uploadedAt: new Date(),
      }));
      const result = await documentProcessor.generateTaxFiling({
        documents,
        filingStatus,
        taxYear,
        outputFormat,
      });

      const summary = result.summary;
      const forms = result.forms;

      return {
        content: [
          {
            type: "text",
            text:
              `Tax Filing Generated Successfully!\n\n` +
              `📊 SUMMARY:\n` +
              `Total Income: $${summary.totalIncome.toLocaleString()}\n` +
              `Total Deductions: $${summary.totalDeductions.toLocaleString()}\n` +
              `Total Credits: $${summary.totalCredits.toLocaleString()}\n` +
              `Tax Owed: $${summary.taxOwed.toLocaleString()}\n` +
              `Refund Amount: $${summary.refundAmount.toLocaleString()}\n` +
              `Filing Deadline: ${summary.filingDeadline}\n\n` +
              `📋 FORMS GENERATED (${outputFormat.toUpperCase()} format):\n` +
              forms
                .map((form) => `• ${form.formNumber}: ${form.formType}`)
                .join("\n") +
              `\n\n` +
              `📄 FORM CONTENTS:\n` +
              forms
                .map((form) => `\n--- ${form.formNumber} ---\n${form.content}`)
                .join("\n"),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error generating tax filing: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Set transport and initialize
async function init() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Remove console.log to avoid interfering with MCP protocol
}

// Call the initialization
init().catch((error) => {
  // Log to stderr instead of stdout to avoid MCP protocol interference
  process.stderr.write(`Server error: ${error}\n`);
  process.exit(1);
});
