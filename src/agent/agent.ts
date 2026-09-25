import type { AgentDecision, WorkspaceState } from "../types.js";
import { buildContext } from "./context.js";
import { resolveFrame } from "./resolver.js";

export interface AgentTurn {
  decision: AgentDecision;
  context: string;
}

export function runAgentTurn(userMessage: string, state: WorkspaceState): AgentTurn {
  return {
    context: buildContext(state),
    decision: resolveFrame(userMessage, state),
  };
}
