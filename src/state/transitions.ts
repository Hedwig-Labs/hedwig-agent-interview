import type { AgentDecision, Frame, WorkspaceState } from "../types.js";
import { MINUTE } from "./fixtures.js";
import { getFrameById } from "./workspace.js";

function targetIds(decision: AgentDecision): string[] {
  switch (decision.kind) {
    case "select_frame":
      return decision.sourceFrameId
        ? [decision.frameId, decision.sourceFrameId]
        : [decision.frameId];
    case "select_frames":
      return decision.frameIds;
    default:
      return [];
  }
}

function touch(state: WorkspaceState, id: string): void {
  state.recentFrameIds = [id, ...state.recentFrameIds.filter((other) => other !== id)];
}

function applyToFrame(state: WorkspaceState, target: Frame, decision: AgentDecision): void {
  const action = "action" in decision ? decision.action : undefined;
  switch (action) {
    case "open":
    case "read":
      target.isOpen = true;
      target.lastViewedAt = state.now;
      if (target.id !== state.sidePaneFrameId) state.activeFrameId = target.id;
      break;
    case "append":
    case "update":
    case "rename":
      target.updatedAt = state.now;
      target.lastModifiedBy = "agent";
      break;
    case "close":
      target.isOpen = false;
      if (state.activeFrameId === target.id) state.activeFrameId = undefined;
      break;
    case "archive":
      target.archivedAt = state.now;
      target.isOpen = false;
      break;
    case "delete":
      target.deletedAt = state.now;
      target.isOpen = false;
      if (state.activeFrameId === target.id) state.activeFrameId = undefined;
      break;
    case "restore":
      delete target.deletedAt;
      break;
    default:
      break;
  }
  if (action) {
    state.recentActions.push({
      kind: action,
      frameId: target.id,
      createdAt: state.now,
      summary: `${action} ${target.title}`,
    });
  }
  touch(state, target.id);
}

/**
 * Advances the workspace by one turn as if the agent's decision had been carried out.
 * Used by multi-turn evaluation cases so that earlier decisions shape later context.
 */
export function applyTurn(
  state: WorkspaceState,
  userMessage: string,
  decision: AgentDecision,
): WorkspaceState {
  state.now += MINUTE;
  const referencedFrameIds = targetIds(decision);
  state.conversation.push({
    role: "user",
    content: userMessage,
    createdAt: state.now,
    referencedFrameIds,
  });

  if (decision.kind === "select_frame") {
    const target = getFrameById(state, decision.frameId);
    if (target) applyToFrame(state, target, decision);
  } else if (decision.kind === "select_frames") {
    for (const id of decision.frameIds) {
      const target = getFrameById(state, id);
      if (target) applyToFrame(state, target, decision);
    }
  } else if (decision.kind === "create_frame") {
    const created: Frame = {
      id: `new_${state.frames.length + 1}`,
      type: decision.frameType,
      title: decision.title ?? "Untitled",
      content: "",
      createdAt: state.now,
      updatedAt: state.now,
      isOpen: true,
      isPinned: false,
      lastViewedAt: state.now,
      lastModifiedBy: "agent",
      ...(decision.projectId ? { projectId: decision.projectId } : {}),
    };
    state.frames.push(created);
    state.activeFrameId = created.id;
    touch(state, created.id);
    referencedFrameIds.push(created.id);
  }

  state.now += MINUTE;
  state.conversation.push({
    role: "agent",
    content: decision.reason,
    createdAt: state.now,
    referencedFrameIds,
  });
  return state;
}
