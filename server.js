import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// create the MCP server
const server = new McpServer({
  name: "IRS Tax Filing Buddy",
  version: "1.0.0",
});

// tool function for IRS Tax Filing Buddy
async function getTaxBuddyInfo() {
  return {
    name: "IRS Tax Filing Buddy",
    developer: "Navaneeth",
    description: "Your personal assistant for IRS tax filing assistance",
    capabilities: ["TBD"],
  };
}

// register the tool to MCP
server.tool(
  "whatsIrsTaxFilingBuddy",
  {
    query: z.string().optional().default("whats irs tax filing buddy"),
  },
  async ({ query }) => {
    const info = await getTaxBuddyInfo();
    return {
      content: [
        {
          type: "text",
          text: `I am ${info.name}, developed by ${info.developer}. I'm here to help you with your IRS tax filing needs!`,
        },
      ],
    };
  }
);

// Additional tool for tax filing assistance
server.tool(
  "getTaxAssistance",
  {
    question: z
      .string()
      .describe("The tax-related question or topic you need help with"),
  },
  async ({ question }) => {
    return {
      content: [
        {
          type: "text",
          text: `As your IRS Tax Filing Buddy, I'm here to help with: "${question}". Please provide more specific details about your tax situation so I can give you the best guidance possible.`,
        },
      ],
    };
  }
);

// set transport
async function init() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// call the initialization
init();
