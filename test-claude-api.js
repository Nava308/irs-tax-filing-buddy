import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

async function testClaudeAPI() {
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    console.log("❌ CLAUDE_API_KEY not found in environment variables");
    console.log("Please add CLAUDE_API_KEY=your_key_here to your .env file");
    return;
  }

  console.log("✅ CLAUDE_API_KEY found in environment variables");

  const client = new Anthropic({
    apiKey,
  });

  try {
    console.log("🔄 Testing Claude API connection...");

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 100,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content:
            'Hello! Please respond with "API connection successful" if you can read this.',
        },
      ],
    });

    const response = message.content[0];
    if (response.type === "text") {
      console.log("✅ Claude API connection successful!");
      console.log("Response:", response.text);
    } else {
      console.log("❌ Unexpected response type from Claude");
    }
  } catch (error) {
    console.log("❌ Claude API connection failed:");
    console.log("Error:", error.message);

    if (error.message.includes("authentication")) {
      console.log(
        "💡 This might be an invalid API key. Please check your CLAUDE_API_KEY."
      );
    } else if (error.message.includes("rate limit")) {
      console.log("💡 Rate limit exceeded. Please try again later.");
    } else if (error.message.includes("not_found_error")) {
      console.log("💡 Model not found. Let me try with claude-3-sonnet...");
      await testWithDifferentModel(client);
    }
  }
}

async function testWithDifferentModel(client) {
  try {
    console.log("🔄 Trying with claude-3-sonnet...");

    const message = await client.messages.create({
      model: "claude-3-sonnet",
      max_tokens: 100,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content:
            'Hello! Please respond with "API connection successful" if you can read this.',
        },
      ],
    });

    const response = message.content[0];
    if (response.type === "text") {
      console.log("✅ Claude API connection successful with claude-3-sonnet!");
      console.log("Response:", response.text);
    }
  } catch (error) {
    console.log("❌ Still failed with claude-3-sonnet:");
    console.log("Error:", error.message);

    // Try one more model
    try {
      console.log("🔄 Trying with claude-3-haiku...");

      const message = await client.messages.create({
        model: "claude-3-haiku",
        max_tokens: 100,
        temperature: 0.1,
        messages: [
          {
            role: "user",
            content:
              'Hello! Please respond with "API connection successful" if you can read this.',
          },
        ],
      });

      const response = message.content[0];
      if (response.type === "text") {
        console.log("✅ Claude API connection successful with claude-3-haiku!");
        console.log("Response:", response.text);
      }
    } catch (finalError) {
      console.log(
        "❌ All model attempts failed. Please check available models."
      );
      console.log("Final error:", finalError.message);
    }
  }
}

testClaudeAPI();
