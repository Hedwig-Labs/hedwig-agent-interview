import type { Frame, WorkspaceState } from "../types.js";

export function getDocuments(state: WorkspaceState): Frame[] {
  return state.frames.filter((frame) => frame.type === "document");
}
