import type {
  CalendarEvent,
  Frame,
  MemoryEntry,
  Person,
  Project,
  WorkspaceState,
} from "../types.js";

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
/** Friday 2026-09-25, 17:00 UTC (10:00 in the user's America/Los_Angeles timezone). */
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
    frame("todo_991", "todo", "Actions List", "Buy printer ink\nRenew domain", 4 * DAY, {
      projectId: "proj_personal",
    }),
    frame("todo_182", "todo", "Actions List", "Interview Alex\nEmail Sam", 2 * MINUTE, {
      isOpen: true,
      lastViewedAt: FIXTURE_NOW - MINUTE,
      projectId: "proj_recruiting",
    }),
    frame("doc_72", "document", "Hedwig Product Spec", "Agent context architecture", 20 * MINUTE, {
      isOpen: true,
      lastViewedAt: FIXTURE_NOW - 5 * MINUTE,
      projectId: "proj_product",
    }),
    frame("doc_73", "document", "Product Spec", "Archived v1 product requirements", 11 * DAY, {
      projectId: "proj_product",
    }),
    frame("browser_44", "browser", "Canvas", "https://canvas.example.test/design", HOUR, {
      isOpen: true,
    }),
    frame("mail_12", "mail", "Sam — Hiring", "Interview loop and candidate notes", DAY, {
      participantIds: ["p_sam_h"],
      projectId: "proj_recruiting",
    }),
    frame("mail_27", "mail", "Sam — Product", "Product review follow-up", 2 * DAY, {
      participantIds: ["p_sam_p"],
      projectId: "proj_product",
    }),
    frame("doc_81", "document", "Recruiting Notes", "Candidates and interview loops", 3 * HOUR, {
      projectId: "proj_recruiting",
    }),
    frame("calendar_32", "calendar", "Work Calendar", "Meetings and interviews", 6 * HOUR),
    frame("doc_20", "document", "Meeting Notes", "Weekly product meeting", 5 * DAY),
    frame("doc_21", "document", "Ideas", "Possible workspace improvements", 9 * DAY),
    frame("doc_22", "document", "Product Notes", "Assorted research", 2 * DAY, {
      projectId: "proj_product",
    }),
    frame("todo_300", "todo", "Action Items", "Follow up on design", 8 * HOUR, {
      projectId: "proj_product",
    }),
    frame("todo_301", "todo", "Old Actions", "Completed launch tasks", 40 * DAY),
    frame("doc_23", "document", "Sam Notes", "Notes from a product conversation", 7 * DAY),
    frame("doc_24", "document", "Design Spec", "Frame interaction design", 4 * HOUR, {
      projectId: "proj_product",
    }),
    frame("doc_25", "document", "Agent Architecture", "Retrieval and tool routing", 6 * HOUR, {
      projectId: "proj_product",
    }),
    frame("doc_26", "document", "Research", "Context system papers", 12 * HOUR),
    frame("doc_27", "document", "Interview Notes", "Intern interview plan", 90 * MINUTE, {
      projectId: "proj_recruiting",
    }),
    frame("doc_40", "document", "Launch Plan", "Milestones, owners, and venue", 3 * HOUR, {
      projectId: "proj_launch",
    }),
    frame("doc_41", "document", "Launch Plan", "Superseded first draft", 25 * DAY, {
      projectId: "proj_launch",
      archivedAt: FIXTURE_NOW - 20 * DAY,
    }),
    frame("todo_50", "todo", "Groceries", "Oat milk\nCoffee", 2 * DAY, {
      projectId: "proj_personal",
    }),
    frame("doc_60", "document", "Offer Letter — Alex Kim", "Draft offer terms", 5 * HOUR, {
      projectId: "proj_recruiting",
      linkedFrameIds: ["doc_81"],
    }),
    frame("sheet_70", "datasheet", "Candidate Pipeline", "Name | Stage | Owner", DAY + 2 * HOUR, {
      projectId: "proj_recruiting",
    }),
    frame("doc_90", "document", "Launch Retro Draft", "What went well, what did not", HOUR, {
      projectId: "proj_launch",
      deletedAt: FIXTURE_NOW - HOUR,
    }),
    frame("doc_95", "document", "1:1 with Jordan", "Running agenda", DAY + 3 * HOUR),
    frame("browser_45", "browser", "LinkedIn — Alex Kim", "https://linkedin.example.test/alex", 2 * HOUR, {
      projectId: "proj_recruiting",
    }),
  ];
}

export function makePeople(): Person[] {
  return [
    { id: "p_me", name: "Riley Chen", emails: ["riley@hedwig.example.test"], projectIds: [] },
    {
      id: "p_sam_h",
      name: "Sam Patel",
      emails: ["sam.hiring@example.test"],
      role: "Recruiter",
      projectIds: ["proj_recruiting"],
    },
    {
      id: "p_sam_p",
      name: "Sam Okafor",
      emails: ["sam.product@example.test"],
      role: "Product manager",
      projectIds: ["proj_product"],
    },
    {
      id: "p_alex",
      name: "Alex Kim",
      emails: ["alex.kim@example.test"],
      role: "Candidate",
      projectIds: ["proj_recruiting"],
    },
    {
      id: "p_alexandra",
      name: "Alexandra Ruiz",
      emails: ["alexandra@hedwig.example.test"],
      aliases: ["Alex R"],
      role: "Designer",
      projectIds: ["proj_product"],
    },
    {
      id: "p_jordan",
      name: "Jordan Blake",
      emails: ["jordan@hedwig.example.test"],
      role: "Engineering manager",
      projectIds: ["proj_launch"],
    },
    {
      id: "p_priya",
      name: "Priya Nair",
      emails: ["priya@hedwig.example.test"],
      role: "Product lead",
      projectIds: ["proj_product", "proj_launch"],
    },
  ];
}

export function makeProjects(): Project[] {
  return [
    { id: "proj_recruiting", name: "Recruiting", aliases: ["hiring"] },
    { id: "proj_product", name: "Product" },
    { id: "proj_launch", name: "Q4 Launch", aliases: ["launch"] },
    { id: "proj_personal", name: "Personal" },
  ];
}

export function makeEvents(): CalendarEvent[] {
  return [
    {
      id: "ev_review",
      calendarFrameId: "calendar_32",
      title: "Product review",
      start: FIXTURE_NOW - 2 * HOUR,
      end: FIXTURE_NOW - HOUR,
      attendeeIds: ["p_me", "p_sam_p", "p_priya"],
      linkedFrameIds: ["doc_22"],
    },
    {
      id: "ev_1on1",
      calendarFrameId: "calendar_32",
      title: "1:1 with Jordan",
      start: FIXTURE_NOW + 30 * MINUTE,
      end: FIXTURE_NOW + HOUR,
      attendeeIds: ["p_me", "p_jordan"],
      linkedFrameIds: ["doc_95"],
    },
    {
      id: "ev_interview",
      calendarFrameId: "calendar_32",
      title: "Technical interview — Alex Kim",
      start: FIXTURE_NOW + 2 * HOUR,
      end: FIXTURE_NOW + 3 * HOUR,
      attendeeIds: ["p_me", "p_alex", "p_sam_h"],
      linkedFrameIds: ["doc_81"],
    },
  ];
}

export function makeMemory(): MemoryEntry[] {
  return [
    {
      id: "mem_tracker",
      createdAt: FIXTURE_NOW - 10 * DAY,
      phrase: "the tracker",
      frameId: "sheet_70",
      note: 'When I say "the tracker" I mean the Candidate Pipeline sheet.',
    },
    {
      id: "mem_personal",
      createdAt: FIXTURE_NOW - 20 * DAY,
      phrase: "personal to-dos",
      frameId: "todo_991",
      note: "Personal to-dos go on my older Actions List.",
    },
  ];
}

export function makeWorkspace(overrides: Partial<WorkspaceState> = {}): WorkspaceState {
  return {
    now: FIXTURE_NOW,
    user: { personId: "p_me", name: "Riley Chen", timezone: "America/Los_Angeles" },
    frames: makeFrames(),
    people: makePeople(),
    projects: makeProjects(),
    events: makeEvents(),
    memory: makeMemory(),
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
