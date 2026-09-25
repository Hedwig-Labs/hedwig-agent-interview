import type { AgentDecision, WorkspaceState } from "../types.js";
import { DAY, FIXTURE_NOW, MINUTE, makeWorkspace } from "../state/fixtures.js";

export type ExpectedDecision = { frameId: string } | { kind: "ask_user" };

export interface EvalCase {
  name: string;
  userMessage: string;
  state: WorkspaceState;
  expected: ExpectedDecision;
}

export function matchesExpected(decision: AgentDecision, expected: ExpectedDecision): boolean {
  if ("frameId" in expected) {
    return decision.kind === "select_frame" && decision.frameId === expected.frameId;
  }
  return decision.kind === "ask_user";
}

export const publicCases: EvalCase[] = [
  {
    name: "Current active frame",
    userMessage: "Add a section about browser frames.",
    state: makeWorkspace({ activeFrameId: "doc_72" }),
    expected: { frameId: "doc_72" },
  },
  {
    name: "Duplicate frame title",
    userMessage: 'Add "email Sam" to my actions list.',
    state: makeWorkspace(),
    expected: { frameId: "todo_182" },
  },
  {
    name: "Recent conversation reference",
    userMessage: "Add Alex to that.",
    state: makeWorkspace({
      activeFrameId: "todo_182",
      conversation: [
        {
          role: "user",
          content: "Open Recruiting Notes.",
          createdAt: FIXTURE_NOW - 2 * MINUTE,
          referencedFrameIds: ["doc_81"],
        },
        {
          role: "agent",
          content: "Opened Recruiting Notes.",
          createdAt: FIXTURE_NOW - MINUTE,
          referencedFrameIds: ["doc_81"],
        },
      ],
    }),
    expected: { frameId: "doc_81" },
  },
  {
    name: "Temporal conversation reference",
    userMessage: "Go back to the spec we were using.",
    state: makeWorkspace({
      activeFrameId: "todo_182",
      conversation: [
        {
          role: "user",
          content: "Open the new product spec.",
          createdAt: FIXTURE_NOW - 30 * MINUTE,
          referencedFrameIds: ["doc_72"],
        },
        {
          role: "agent",
          content: "Opened Hedwig Product Spec.",
          createdAt: FIXTURE_NOW - 29 * MINUTE,
          referencedFrameIds: ["doc_72"],
        },
        {
          role: "user",
          content: "Let's work on recruiting for a bit.",
          createdAt: FIXTURE_NOW - 10 * MINUTE,
          referencedFrameIds: ["todo_182"],
        },
      ],
    }),
    expected: { frameId: "doc_72" },
  },
  {
    name: "Explicit unique frame name",
    userMessage: "Open Recruiting Notes.",
    state: makeWorkspace(),
    expected: { frameId: "doc_81" },
  },
  {
    name: "Ambiguous destructive action",
    userMessage: "Delete the product spec.",
    state: makeWorkspace({
      activeFrameId: undefined,
      recentFrameIds: ["doc_72", "doc_73"],
      frames: makeWorkspace().frames.map((frame) =>
        frame.id === "doc_73"
          ? { ...frame, updatedAt: FIXTURE_NOW - DAY, lastViewedAt: FIXTURE_NOW - 4 * MINUTE }
          : frame.id === "doc_72"
            ? { ...frame, lastViewedAt: FIXTURE_NOW - 3 * MINUTE }
            : frame,
      ),
    }),
    expected: { kind: "ask_user" },
  },
];
