import type { Frame, WorkspaceState } from "../types.js";
import { getFrameById } from "../state/workspace.js";

export function getFrames(state: WorkspaceState): Frame[] {
  return state.frames;
}

export function getFrame(state: WorkspaceState, id: string): Frame | undefined {
  return getFrameById(state, id);
}

export function searchFrames(state: WorkspaceState, query: string): Frame[] {
  const normalized = query.toLowerCase();
  return state.frames.filter(
    (frame) =>
      frame.title.toLowerCase().includes(normalized) ||
      frame.content.toLowerCase().includes(normalized),
  );
}

export function appendToFrame(state: WorkspaceState, id: string, content: string): Frame {
  const target = getFrameById(state, id);
  if (!target) throw new Error(`Unknown frame: ${id}`);
  target.content = `${target.content}\n${content}`;
  target.lastModifiedBy = "agent";
  return target;
}

export function updateFrame(
  state: WorkspaceState,
  id: string,
  patch: Partial<Pick<Frame, "title" | "content" | "isOpen" | "isPinned">>,
): Frame {
  const target = getFrameById(state, id);
  if (!target) throw new Error(`Unknown frame: ${id}`);
  Object.assign(target, patch, { lastModifiedBy: "agent" as const });
  return target;
}
