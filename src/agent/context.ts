import type { WorkspaceState } from "../types.js";

/**
 * This is the context currently made available to the decision layer.
 * It is intentionally small and human-readable, but may discard useful state.
 */
export function buildContext(state: WorkspaceState): string {
  const titles = state.frames.map((frame) => `- ${frame.title}`).join("\n");
  return `Available frames:\n\n${titles}`;
}
