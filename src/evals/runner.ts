import { runAgentTurn } from "../agent/agent.js";
import { publicCases } from "./cases.js";
import { printReport, runSuite } from "./harness.js";

const results = runSuite(publicCases, (message, state) => runAgentTurn(message, state).decision);
printReport("Agent context evaluation", results);
