import { describe, expect, it } from "vitest";
import { runAgentTurn } from "../src/agent/agent.js";
import { makeWorkspace } from "../src/state/fixtures.js";
import { appendToFrame, getFrame } from "../src/tools/frames.js";
import { sendMail } from "../src/tools/mail.js";

describe("starter infrastructure", () => {
  it("preserves distinct stable IDs when titles collide", () => {
    const state = makeWorkspace();
    const actionsLists = state.frames.filter((frame) => frame.title === "Actions List");
    expect(actionsLists).toHaveLength(2);
    expect(new Set(actionsLists.map((frame) => frame.id)).size).toBe(2);
  });

  it("returns a structured decision and inspectable context", () => {
    const turn = runAgentTurn("Open Recruiting Notes.", makeWorkspace());
    expect(turn.context).toContain("Available frames:");
    expect(turn.decision).toEqual(
      expect.objectContaining({ kind: "select_frame", frameId: "doc_81" }),
    );
  });

  it("mutates only the addressed frame", () => {
    const state = makeWorkspace();
    const oldList = getFrame(state, "todo_991")?.content;
    appendToFrame(state, "todo_182", "Schedule debrief");
    expect(getFrame(state, "todo_182")?.content).toContain("Schedule debrief");
    expect(getFrame(state, "todo_991")?.content).toBe(oldList);
  });

  it("does not allow the fake mail tool to send externally", () => {
    expect(() => sendMail()).toThrow(/confirmation policy/i);
  });
});
