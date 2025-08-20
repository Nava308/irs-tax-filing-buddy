import { spawn } from 'child_process';
import { McpClient } from '@modelcontextprotocol/sdk/client/mcp.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testTaxBuddy() {
    console.log('🧪 Testing IRS Tax Filing Buddy...\n');

    // Spawn the server process
    const serverProcess = spawn('node', ['server.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    // Create MCP client
    const transport = new StdioClientTransport(serverProcess.stdin, serverProcess.stdout);
    const client = new McpClient(transport);

    try {
        // Connect to the server
        await client.connect();

        console.log('✅ Connected to IRS Tax Filing Buddy server\n');

        // Test the "whoAmI" tool
        console.log('🔍 Testing "whoAmI" tool...');
        const whoAmIResult = await client.callTool('whoAmI', { query: 'who am i' });
        console.log('Response:', whoAmIResult.content[0].text);
        console.log('');

        // Test the "getTaxAssistance" tool
        console.log('🔍 Testing "getTaxAssistance" tool...');
        const taxAssistanceResult = await client.callTool('getTaxAssistance', { 
            question: 'How do I file my 1040 form?' 
        });
        console.log('Response:', taxAssistanceResult.content[0].text);
        console.log('');

        console.log('✅ All tests completed successfully!');

    } catch (error) {
        console.error('❌ Error during testing:', error.message);
    } finally {
        // Clean up
        serverProcess.kill();
        process.exit(0);
    }
}

// Run the test
testTaxBuddy().catch(console.error);
