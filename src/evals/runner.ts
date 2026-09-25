import { runAgentTurn } from "../agent/agent.js";
import { matchesExpected, publicCases } from "./cases.js";

let passed = 0;

console.log("Agent context evaluation\n");

for (const testCase of publicCases) {
  const { decision } = runAgentTurn(testCase.userMessage, structuredClone(testCase.state));
  const success = matchesExpected(decision, testCase.expected);
  if (success) passed += 1;
  const actual = decision.kind === "select_frame" ? decision.frameId : "ASK_USER";
  const expected = "frameId" in testCase.expected ? testCase.expected.frameId : "ASK_USER";
  console.log(`${success ? "✓" : "✗"} ${testCase.name}`);
  if (!success) console.log(`  expected ${expected}; received ${actual}`);
}

console.log(`\nScore: ${passed} / ${publicCases.length}`);
