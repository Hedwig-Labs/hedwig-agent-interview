import type { Frame, WorkspaceState } from "../types.js";

export function getFrameById(state: WorkspaceState, id: string): Frame | undefined {
  return state.frames.find((frame) => frame.id === id);
}

export function cloneWorkspace(state: WorkspaceState): WorkspaceState {
  return structuredClone(state);
}
