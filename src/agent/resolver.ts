import type { ActionKind, AgentDecision, Frame, WorkspaceState } from "../types.js";

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function titleAppearsInQuery(query: string, frame: Frame): boolean {
  return normalize(query).includes(normalize(frame.title));
}

const VERBS: Record<string, ActionKind> = {
  open: "open",
  add: "append",
  put: "append",
  rename: "rename",
  delete: "delete",
  summarize: "read",
  close: "close",
  reply: "reply",
  send: "send",
  email: "send",
};

function guessAction(query: string): ActionKind | undefined {
  const firstWord = normalize(query).split(" ")[0] ?? "";
  return VERBS[firstWord];
}

/**
 * The starter resolver is plausible for simple commands but unreliable when
 * names collide or the user relies on shared context.
 */
export function resolveFrame(query: string, state: WorkspaceState): AgentDecision {
  const action = guessAction(query);
  const namedFrame = state.frames.find((frame) => titleAppearsInQuery(query, frame));
  if (namedFrame) {
    return {
      kind: "select_frame",
      action,
      frameId: namedFrame.id,
      reason: "The frame title appears in the request.",
    };
  }

  if (/\b(this|it|here|current)\b/i.test(query) && state.activeFrameId) {
    return {
      kind: "select_frame",
      action,
      frameId: state.activeFrameId,
      reason: "The request appears to refer to the active frame.",
    };
  }

  if (state.activeFrameId) {
    return {
      kind: "select_frame",
      action,
      frameId: state.activeFrameId,
      reason: "No title matched, so the active frame was selected.",
    };
  }

  const fallback = state.frames[0];
  if (fallback) {
    return {
      kind: "select_frame",
      action,
      frameId: fallback.id,
      reason: "No title matched, so the first available frame was selected.",
    };
  }

  return { kind: "ask_user", reason: "No frames are available." };
}
