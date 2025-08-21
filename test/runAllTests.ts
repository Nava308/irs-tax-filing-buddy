import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("=== IRS Tax Filing Buddy - Test Suite Runner ===\n");

interface TestSuiteResult {
  name: string;
  passed: boolean;
  exitCode: number;
  output: string;
  error?: string;
}

const testSuites = [
  { name: "Tax Calculation Tests", file: "taxCalculation.test.js" },
  { name: "Document Processing Tests", file: "documentProcessing.test.js" },
  { name: "Enhanced Features Tests", file: "enhancedFeatures.test.js" },
];

async function runTestSuite(testFile: string): Promise<TestSuiteResult> {
  return new Promise((resolve) => {
    const testPath = join(__dirname, testFile);
    const child = spawn("node", [testPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let output = "";
    let errorOutput = "";

    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    child.on("close", (code) => {
      resolve({
        name: testFile,
        passed: code === 0,
        exitCode: code || 0,
        output,
        ...(errorOutput && { error: errorOutput }),
      });
    });
  });
}

async function runAllTests() {
  console.log("🚀 Starting test suite execution...\n");

  const results: TestSuiteResult[] = [];

  for (const suite of testSuites) {
    console.log(`📋 Running ${suite.name}...`);
    console.log("─".repeat(50));

    const result = await runTestSuite(suite.file);
    results.push(result);

    // Print the test output
    console.log(result.output);

    if (result.error) {
      console.log("Error output:", result.error);
    }

    console.log(
      `${result.passed ? "✅" : "❌"} ${suite.name} ${
        result.passed ? "PASSED" : "FAILED"
      }`
    );
    console.log("─".repeat(50));
    console.log();
  }

  // Overall summary
  console.log("=== OVERALL TEST SUMMARY ===");
  const passedSuites = results.filter((r) => r.passed).length;
  const totalSuites = results.length;

  console.log(`Test Suites: ${passedSuites}/${totalSuites} passed`);

  results.forEach((result) => {
    const status = result.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`  ${status} ${result.name}`);
  });

  if (passedSuites === totalSuites) {
    console.log("\n🎉 All test suites passed! 🎉");
    process.exit(0);
  } else {
    console.log(`\n❌ ${totalSuites - passedSuites} test suite(s) failed.`);
    process.exit(1);
  }
}

runAllTests().catch((error) => {
  console.error("Test runner error:", error);
  process.exit(1);
});
