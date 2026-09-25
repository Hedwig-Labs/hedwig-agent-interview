import { runAgentTurn } from "../src/agent/agent.js";
import { makeWorkspace } from "../src/state/fixtures.js";

const state = makeWorkspace();
const messages = [
  'Add "email Sam" to my actions list.',
  "Open Recruiting Notes.",
  "Add a section about browser frames.",
];

console.log("Context supplied to the starter agent:\n");
console.log(runAgentTurn(messages[0]!, state).context);
console.log("\nDecisions:\n");

for (const message of messages) {
  const { decision } = runAgentTurn(message, state);
  console.log(`User: ${message}`);
  console.log(`Agent decision: ${JSON.stringify(decision)}\n`);
}
