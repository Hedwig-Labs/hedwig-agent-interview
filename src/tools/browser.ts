import type { Frame, WorkspaceState } from "../types.js";
import { getFrameById } from "../state/workspace.js";

export function getBrowserState(state: WorkspaceState): Frame | undefined {
  const sidePane = state.sidePaneFrameId
    ? getFrameById(state, state.sidePaneFrameId)
    : undefined;
  return sidePane?.type === "browser" ? sidePane : undefined;
}
