import type { Frame, WorkspaceState } from "../types.js";

export function searchMail(state: WorkspaceState, query: string): Frame[] {
  const normalized = query.toLowerCase();
  return state.frames.filter(
    (frame) =>
      frame.type === "mail" &&
      `${frame.title}\n${frame.content}`.toLowerCase().includes(normalized),
  );
}

/**
 * External delivery is deliberately not implemented in this local exercise.
 * A caller must make confirmation and authorization policy explicit first.
 */
export function sendMail(): never {
  throw new Error("External send requires an explicit confirmation policy.");
}
