export type FrameType = "document" | "todo" | "browser" | "mail" | "calendar";

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
  metadata?: Record<string, unknown>;
}

export interface Message {
  role: "user" | "agent";
  content: string;
  createdAt: number;
  referencedFrameIds?: string[];
}

export type ActionKind = "open" | "append" | "update" | "delete" | "send";

export interface AgentAction {
  kind: ActionKind;
  frameId?: string;
  createdAt: number;
  summary: string;
}

export interface WorkspaceState {
  frames: Frame[];
  activeFrameId?: string;
  sidePaneFrameId?: string;
  recentFrameIds: string[];
  conversation: Message[];
  recentActions: AgentAction[];
}

export type AgentDecision =
  | {
      kind: "select_frame";
      frameId: string;
      reason: string;
    }
  | {
      kind: "ask_user";
      reason: string;
    };
