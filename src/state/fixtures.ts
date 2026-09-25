import type { Frame, WorkspaceState } from "../types.js";

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const FIXTURE_NOW = Date.UTC(2026, 8, 25, 17, 0, 0);

function frame(
  id: string,
  type: Frame["type"],
  title: string,
  content: string,
  updatedAgo: number,
  options: Partial<Frame> = {},
): Frame {
  return {
    id,
    type,
    title,
    content,
    createdAt: FIXTURE_NOW - 30 * DAY,
    updatedAt: FIXTURE_NOW - updatedAgo,
    isOpen: false,
    isPinned: false,
    ...options,
  };
}

export function makeFrames(): Frame[] {
  // The old duplicate appears first on purpose. Array order is not relevance.
  return [
    frame("todo_991", "todo", "Actions List", "Buy printer ink\nRenew domain", 4 * DAY),
    frame("todo_182", "todo", "Actions List", "Interview Alex\nEmail Sam", 2 * MINUTE, {
      isOpen: true,
      lastViewedAt: FIXTURE_NOW - MINUTE,
      metadata: { project: "recruiting" },
    }),
    frame("doc_72", "document", "Hedwig Product Spec", "Agent context architecture", 20 * MINUTE, {
      isOpen: true,
      lastViewedAt: FIXTURE_NOW - 5 * MINUTE,
      metadata: { project: "product" },
    }),
    frame("doc_73", "document", "Product Spec", "Archived v1 product requirements", 11 * DAY),
    frame("browser_44", "browser", "Canvas", "https://canvas.example.test/design", HOUR, {
      isOpen: true,
    }),
    frame("mail_12", "mail", "Sam — Hiring", "Interview loop and candidate notes", DAY, {
      metadata: { contact: "sam.hiring@example.test" },
    }),
    frame("mail_27", "mail", "Sam — Product", "Product review follow-up", 2 * DAY, {
      metadata: { contact: "sam.product@example.test" },
    }),
    frame("doc_81", "document", "Recruiting Notes", "Candidates and interview loops", 3 * HOUR),
    frame("calendar_32", "calendar", "Engineering Interviews", "Alex — technical interview", 6 * HOUR),
    frame("doc_20", "document", "Meeting Notes", "Weekly product meeting", 5 * DAY),
    frame("doc_21", "document", "Ideas", "Possible workspace improvements", 9 * DAY),
    frame("doc_22", "document", "Product Notes", "Assorted research", 2 * DAY),
    frame("todo_300", "todo", "Action Items", "Follow up on design", 8 * HOUR),
    frame("todo_301", "todo", "Old Actions", "Completed launch tasks", 40 * DAY),
    frame("doc_23", "document", "Sam Notes", "Notes from a product conversation", 7 * DAY),
    frame("doc_24", "document", "Design Spec", "Frame interaction design", 4 * HOUR),
    frame("doc_25", "document", "Agent Architecture", "Retrieval and tool routing", 6 * HOUR),
    frame("doc_26", "document", "Research", "Context system papers", 12 * HOUR),
    frame("doc_27", "document", "Interview Notes", "Intern interview plan", 90 * MINUTE),
  ];
}

export function makeWorkspace(overrides: Partial<WorkspaceState> = {}): WorkspaceState {
  return {
    frames: makeFrames(),
    activeFrameId: "todo_182",
    sidePaneFrameId: "browser_44",
    recentFrameIds: ["todo_182", "doc_72", "doc_81"],
    conversation: [
      {
        role: "user",
        content: "Let's use the newer actions list for recruiting stuff.",
        createdAt: FIXTURE_NOW - 12 * MINUTE,
        referencedFrameIds: ["todo_182"],
      },
      {
        role: "agent",
        content: "Okay.",
        createdAt: FIXTURE_NOW - 11 * MINUTE,
      },
      {
        role: "user",
        content: "Add interview Alex to it.",
        createdAt: FIXTURE_NOW - 10 * MINUTE,
        referencedFrameIds: ["todo_182"],
      },
      {
        role: "agent",
        content: "Added.",
        createdAt: FIXTURE_NOW - 9 * MINUTE,
        referencedFrameIds: ["todo_182"],
      },
      {
        role: "user",
        content: "Open the product spec.",
        createdAt: FIXTURE_NOW - 7 * MINUTE,
        referencedFrameIds: ["doc_72"],
      },
      {
        role: "agent",
        content: "Opened Hedwig Product Spec.",
        createdAt: FIXTURE_NOW - 6 * MINUTE,
        referencedFrameIds: ["doc_72"],
      },
      {
        role: "user",
        content: "Actually go back to the actions list.",
        createdAt: FIXTURE_NOW - 2 * MINUTE,
        referencedFrameIds: ["todo_182"],
      },
      {
        role: "agent",
        content: "Opened Actions List.",
        createdAt: FIXTURE_NOW - MINUTE,
        referencedFrameIds: ["todo_182"],
      },
    ],
    recentActions: [
      {
        kind: "append",
        frameId: "todo_182",
        createdAt: FIXTURE_NOW - 9 * MINUTE,
        summary: "Added Interview Alex",
      },
      {
        kind: "open",
        frameId: "doc_72",
        createdAt: FIXTURE_NOW - 6 * MINUTE,
        summary: "Opened Hedwig Product Spec",
      },
      {
        kind: "open",
        frameId: "todo_182",
        createdAt: FIXTURE_NOW - MINUTE,
        summary: "Opened Actions List",
      },
    ],
    ...overrides,
  };
}
