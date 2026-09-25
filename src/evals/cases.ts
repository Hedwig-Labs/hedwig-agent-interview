import type { WorkspaceState } from "../types.js";
import { DAY, FIXTURE_NOW, MINUTE, makeWorkspace } from "../state/fixtures.js";
import { type EvalCase, singleTurn } from "./harness.js";

export { matchesExpected } from "./harness.js";
export type { EvalCase, ExpectedDecision } from "./harness.js";

/** The M4 workspace: two recently viewed product specs and no active frame. */
function twoRecentSpecs(): WorkspaceState {
  return makeWorkspace({
    activeFrameId: undefined,
    recentFrameIds: ["doc_72", "doc_73"],
    frames: makeWorkspace().frames.map((frame) =>
      frame.id === "doc_73"
        ? { ...frame, updatedAt: FIXTURE_NOW - DAY, lastViewedAt: FIXTURE_NOW - 4 * MINUTE }
        : frame.id === "doc_72"
          ? { ...frame, lastViewedAt: FIXTURE_NOW - 3 * MINUTE }
          : frame,
    ),
  });
}

const easy: EvalCase[] = [
  singleTurn("easy", "Explicit unique frame name", "Open Recruiting Notes.", makeWorkspace(), {
    frameId: "doc_81",
    action: "open",
  }),
  singleTurn(
    "easy",
    "Current active frame",
    "Add a section about browser frames.",
    makeWorkspace({ activeFrameId: "doc_72" }),
    { frameId: "doc_72", action: "append" },
  ),
  singleTurn(
    "easy",
    "Deictic reference to the active frame",
    "Rename this to Q4 Spec.",
    makeWorkspace({ activeFrameId: "doc_72" }),
    { frameId: "doc_72", action: "rename" },
  ),
  singleTurn(
    "easy",
    "Side pane reference",
    "Summarize the page open in the side pane.",
    makeWorkspace(),
    { frameId: "browser_44", action: "read" },
  ),
  singleTurn("easy", "Title among similar titles", "Open the design spec.", makeWorkspace(), {
    frameId: "doc_24",
    action: "open",
  }),
  singleTurn("easy", "Frame named by type", "Open my calendar.", makeWorkspace(), {
    frameId: "calendar_32",
    action: "open",
  }),
];

const medium: EvalCase[] = [
  singleTurn("medium", "Duplicate frame title", 'Add "email Sam" to my actions list.', makeWorkspace(), {
    frameId: "todo_182",
    action: "append",
  }),
  singleTurn(
    "medium",
    "Recent conversation reference",
    "Add Alex to that.",
    makeWorkspace({
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
    { frameId: "doc_81", action: "append" },
  ),
  singleTurn(
    "medium",
    "Temporal conversation reference",
    "Go back to the spec we were using.",
    makeWorkspace({
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
    { frameId: "doc_72", action: "open" },
  ),
  singleTurn("medium", "Ambiguous destructive action", "Delete the product spec.", twoRecentSpecs(), {
    kind: "ask_user",
  }),
  singleTurn(
    "medium",
    "Archived duplicate",
    "Add a pricing section to the launch plan.",
    makeWorkspace(),
    { frameId: "doc_40", action: "append" },
  ),
  singleTurn("medium", "Remembered alias", "Add Priya to the tracker.", makeWorkspace(), {
    frameId: "sheet_70",
    action: "append",
  }),
  singleTurn(
    "medium",
    "Person resolved by topic",
    "Reply to Sam about the interview loop.",
    makeWorkspace(),
    { frameId: "mail_12", action: "reply" },
  ),
  singleTurn("medium", "Restore from trash", "Bring back the doc I deleted.", makeWorkspace(), {
    frameId: "doc_90",
    action: "restore",
  }),
];

const hard: EvalCase[] = [
  singleTurn(
    "hard",
    "Destructive action with a literal-title rival",
    "Delete the old actions list.",
    makeWorkspace(),
    { kind: "ask_user", candidates: ["todo_991", "todo_301"] },
  ),
  singleTurn("hard", "Unambiguous destructive action", "Trash the offer letter.", makeWorkspace(), {
    frameId: "doc_60",
    action: "delete",
  }),
  singleTurn(
    "hard",
    "Contrastive reference",
    'Add "call the recruiter" to the other actions list.',
    makeWorkspace(),
    { frameId: "todo_991", action: "append" },
  ),
  singleTurn(
    "hard",
    "Project qualifier on a duplicate title",
    'Put "renew passport" on my personal actions list.',
    makeWorkspace(),
    { frameId: "todo_991", action: "append" },
  ),
  singleTurn(
    "hard",
    "Calendar-linked frame",
    "Open the notes for my next meeting.",
    makeWorkspace(),
    { frameId: "doc_95", action: "open" },
  ),
  singleTurn(
    "hard",
    "Bulk action with an exception",
    "Close everything except the spec.",
    makeWorkspace(),
    { frameIds: ["todo_182", "browser_44"], action: "close" },
  ),
  singleTurn(
    "hard",
    "Create instead of select",
    "Start a new doc for the Q4 launch retro.",
    makeWorkspace(),
    { kind: "create_frame", frameType: "document", projectId: "proj_launch" },
  ),
  singleTurn(
    "hard",
    "Selection as the source",
    "Add this to my actions list.",
    makeWorkspace({
      activeFrameId: "doc_81",
      selection: { frameId: "doc_81", text: "Schedule Alex's onsite" },
    }),
    { frameId: "todo_182", action: "append", sourceFrameId: "doc_81" },
  ),
  singleTurn(
    "hard",
    "External send to an ambiguous person",
    "Email Sam.",
    makeWorkspace({ activeFrameId: "doc_20", conversation: [], recentActions: [] }),
    { kind: "ask_user", candidates: ["mail_12", "mail_27"] },
  ),
];

export const publicCases: EvalCase[] = [...easy, ...medium, ...hard];
