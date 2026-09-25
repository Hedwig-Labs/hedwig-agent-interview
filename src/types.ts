export type FrameType = "document" | "todo" | "browser" | "mail" | "calendar" | "datasheet";

export interface Frame {
  id: string;
  type: FrameType;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  isOpen: boolean;
  isPinned: boolean;
  lastViewedAt?: number;
  lastModifiedBy?: "user" | "agent";
  /** Project the frame belongs to. See `WorkspaceState.projects`. */
  projectId?: string;
  /** Archived frames are kept but are out of everyday work. */
  archivedAt?: number;
  /** Frames in the trash. They can be restored. */
  deletedAt?: number;
  /** People on a mail thread or otherwise attached to the frame. */
  participantIds?: string[];
  linkedFrameIds?: string[];
  metadata?: Record<string, unknown>;
}

export interface Person {
  id: string;
  name: string;
  emails: string[];
  aliases?: string[];
  role?: string;
  projectIds: string[];
}

export interface Project {
  id: string;
  name: string;
  aliases?: string[];
}

export interface CalendarEvent {
  id: string;
  calendarFrameId: string;
  title: string;
  start: number;
  end: number;
  attendeeIds: string[];
  linkedFrameIds: string[];
}

/** Text the user currently has highlighted inside a frame. */
export interface Selection {
  frameId: string;
  text: string;
}

/** Something the user asked Hedwig to remember. */
export interface MemoryEntry {
  id: string;
  createdAt: number;
  phrase: string;
  frameId?: string;
  projectId?: string;
  note: string;
}

export interface UserProfile {
  personId: string;
  name: string;
  /** IANA timezone. "Yesterday" and "this morning" are relative to it. */
  timezone: string;
}

export interface Message {
  role: "user" | "agent";
  content: string;
  createdAt: number;
  referencedFrameIds?: string[];
}

export type ActionKind =
  | "open"
  | "read"
  | "append"
  | "update"
  | "rename"
  | "close"
  | "archive"
  | "delete"
  | "restore"
  | "send"
  | "reply";

export interface AgentAction {
  kind: ActionKind;
  frameId?: string;
  createdAt: number;
  summary: string;
}

export interface WorkspaceState {
  /** The current time. Never read the system clock. */
  now: number;
  user: UserProfile;
  frames: Frame[];
  people: Person[];
  projects: Project[];
  events: CalendarEvent[];
  memory: MemoryEntry[];
  activeFrameId?: string;
  sidePaneFrameId?: string;
  selection?: Selection;
  recentFrameIds: string[];
  conversation: Message[];
  recentActions: AgentAction[];
}

export type AgentDecision =
  | {
      kind: "select_frame";
      frameId: string;
      action?: ActionKind;
      /** Where content comes from when it moves between frames. */
      sourceFrameId?: string;
      reason: string;
    }
  | {
      kind: "select_frames";
      frameIds: string[];
      action?: ActionKind;
      reason: string;
    }
  | {
      kind: "create_frame";
      frameType: FrameType;
      title?: string;
      projectId?: string;
      reason: string;
    }
  | {
      kind: "ask_user";
      /** The frames the agent is choosing between, when it has narrowed them down. */
      candidateFrameIds?: string[];
      reason: string;
    };
