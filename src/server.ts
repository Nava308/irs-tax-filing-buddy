import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import { z } from "zod";
import {
  calculateTax,
  FILING_STATUSES,
  getFilingDeadline,
  TAX_BRACKETS,
} from "./taxUtils.js";

dotenv.config();

// Create the MCP server
const server = new McpServer({
  name: "IRS Tax Filing Buddy",
  version: "1.0.0",
});

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

// Set transport and initialize
async function init() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("IRS Tax Filing Buddy MCP server is running...");
}

// Call the initialization
init().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
