import type { ActionKind, AgentDecision, FrameType, WorkspaceState } from "../types.js";
import { DAY } from "../state/fixtures.js";
import { applyTurn } from "../state/transitions.js";

export type Tier = "easy" | "medium" | "hard" | "expert";
export const TIERS: Tier[] = ["easy", "medium", "hard", "expert"];

/**
 * What a correct decision looks like. Fields that are left out are not graded:
 * a case that omits `action` accepts any action on the right frame.
 */
export type ExpectedDecision =
  | { frameId: string; action?: ActionKind; sourceFrameId?: string }
  | { frameIds: string[]; action?: ActionKind }
  | { kind: "create_frame"; frameType: FrameType; projectId?: string }
  | { kind: "ask_user"; candidates?: string[] };

export interface EvalTurn {
  userMessage: string;
  expected: ExpectedDecision;
}

export interface EvalCase {
  name: string;
  tier: Tier;
  state: WorkspaceState;
  /** Turns run in order. Each decision is applied to the state before the next turn. */
  turns: EvalTurn[];
}

export type Agent = (userMessage: string, state: WorkspaceState) => AgentDecision;

export function singleTurn(
  tier: Tier,
  name: string,
  userMessage: string,
  state: WorkspaceState,
  expected: ExpectedDecision,
): EvalCase {
  return { name, tier, state, turns: [{ userMessage, expected }] };
}

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().join("\n") === [...b].sort().join("\n");

export function matchesExpected(decision: AgentDecision, expected: ExpectedDecision): boolean {
  if ("frameId" in expected) {
    return (
      decision.kind === "select_frame" &&
      decision.frameId === expected.frameId &&
      (expected.action === undefined || decision.action === expected.action) &&
      (expected.sourceFrameId === undefined || decision.sourceFrameId === expected.sourceFrameId)
    );
  }
  if ("frameIds" in expected) {
    return (
      decision.kind === "select_frames" &&
      sameSet(decision.frameIds, expected.frameIds) &&
      (expected.action === undefined || decision.action === expected.action)
    );
  }
  if (expected.kind === "create_frame") {
    return (
      decision.kind === "create_frame" &&
      decision.frameType === expected.frameType &&
      (expected.projectId === undefined || decision.projectId === expected.projectId)
    );
  }
  return (
    decision.kind === "ask_user" &&
    (expected.candidates === undefined ||
      sameSet(decision.candidateFrameIds ?? [], expected.candidates))
  );
}

export function describeDecision(decision: AgentDecision): string {
  switch (decision.kind) {
    case "select_frame":
      return [
        decision.frameId,
        decision.action && `action=${decision.action}`,
        decision.sourceFrameId && `source=${decision.sourceFrameId}`,
      ]
        .filter(Boolean)
        .join(" ");
    case "select_frames":
      return `[${decision.frameIds.join(", ")}]${decision.action ? ` action=${decision.action}` : ""}`;
    case "create_frame":
      return `CREATE ${decision.frameType}${decision.projectId ? ` project=${decision.projectId}` : ""}`;
    case "ask_user":
      return `ASK_USER${decision.candidateFrameIds ? ` [${decision.candidateFrameIds.join(", ")}]` : ""}`;
  }
}

export function describeExpected(expected: ExpectedDecision): string {
  if ("frameId" in expected) {
    return [
      expected.frameId,
      expected.action && `action=${expected.action}`,
      expected.sourceFrameId && `source=${expected.sourceFrameId}`,
    ]
      .filter(Boolean)
      .join(" ");
  }
  if ("frameIds" in expected) {
    return `[${expected.frameIds.join(", ")}]${expected.action ? ` action=${expected.action}` : ""}`;
  }
  if (expected.kind === "create_frame") {
    return `CREATE ${expected.frameType}${expected.projectId ? ` project=${expected.projectId}` : ""}`;
  }
  return `ASK_USER${expected.candidates ? ` [${expected.candidates.join(", ")}]` : ""}`;
}

// ---------------------------------------------------------------------------
// Robustness variants. A case only passes if every variant passes, so an agent
// cannot depend on array order, literal IDs, or the literal fixture clock.
// ---------------------------------------------------------------------------

type Variant = { name: string; transform: (testCase: EvalCase) => EvalCase };

function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 2 ** 32;
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function mapDeep(value: unknown, visit: (key: string, value: unknown) => unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => mapDeep(item, visit));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) => [key, visit(key, mapDeep(inner, visit))]),
    );
  }
  return value;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const shuffled: Variant = {
  name: "shuffled order",
  transform: (testCase) => {
    const random = seededRandom(testCase.name.length * 7919);
    const state = structuredClone(testCase.state);
    return {
      ...testCase,
      state: {
        ...state,
        frames: shuffle(state.frames, random),
        people: shuffle(state.people, random),
        projects: shuffle(state.projects, random),
        events: shuffle(state.events, random),
        memory: shuffle(state.memory, random),
      },
    };
  },
};

const reversed: Variant = {
  name: "reversed order",
  transform: (testCase) => {
    const state = structuredClone(testCase.state);
    return {
      ...testCase,
      state: {
        ...state,
        frames: [...state.frames].reverse(),
        people: [...state.people].reverse(),
        projects: [...state.projects].reverse(),
        events: [...state.events].reverse(),
        memory: [...state.memory].reverse(),
      },
    };
  },
};

const renamedIds: Variant = {
  name: "renamed IDs",
  transform: (testCase) => {
    const { state } = testCase;
    const ids = [
      ...state.frames.map((item) => item.id),
      ...state.people.map((item) => item.id),
      ...state.projects.map((item) => item.id),
      ...state.events.map((item) => item.id),
      ...state.memory.map((item) => item.id),
    ];
    const random = seededRandom(ids.length * 104729);
    const mapping = new Map(
      ids.map((id, index) => [id, `x${Math.floor(random() * 36 ** 4).toString(36)}${index.toString(36)}`]),
    );
    const rename = (value: unknown) =>
      typeof value === "string" && mapping.has(value) ? mapping.get(value) : value;
    const renameText = (text: string) =>
      [...mapping].reduce(
        (result, [from, to]) => result.replace(new RegExp(`\\b${escapeRegExp(from)}\\b`, "g"), to),
        text,
      );
    return {
      ...testCase,
      state: mapDeep(state, (_key, value) => rename(value)) as WorkspaceState,
      turns: testCase.turns.map((turn) => ({
        userMessage: renameText(turn.userMessage),
        expected: mapDeep(turn.expected, (_key, value) => rename(value)) as ExpectedDecision,
      })),
    };
  },
};

const TIME_KEYS = new Set([
  "now",
  "createdAt",
  "updatedAt",
  "lastViewedAt",
  "archivedAt",
  "deletedAt",
  "start",
  "end",
]);

const timeShifted: Variant = {
  name: "shifted clock",
  transform: (testCase) => ({
    ...testCase,
    // Whole weeks keep weekdays and local times stable in the user's timezone.
    state: mapDeep(testCase.state, (key, value) =>
      TIME_KEYS.has(key) && typeof value === "number" ? value + 7 * DAY : value,
    ) as WorkspaceState,
  }),
};

const VARIANTS: Variant[] = [
  { name: "original", transform: (testCase) => testCase },
  reversed,
  shuffled,
  renamedIds,
  timeShifted,
];

export interface TurnFailure {
  variant: string;
  turn: number;
  userMessage: string;
  expected: string;
  received: string;
  error?: string;
}

export interface CaseResult {
  testCase: EvalCase;
  passedOriginal: boolean;
  passed: boolean;
  failures: TurnFailure[];
}

function runVariant(testCase: EvalCase, agent: Agent, variant: string): TurnFailure | undefined {
  const state = structuredClone(testCase.state);
  for (const [index, turn] of testCase.turns.entries()) {
    let decision: AgentDecision;
    try {
      decision = agent(turn.userMessage, structuredClone(state));
    } catch (error) {
      return {
        variant,
        turn: index + 1,
        userMessage: turn.userMessage,
        expected: describeExpected(turn.expected),
        received: "THREW",
        error: error instanceof Error ? error.message : String(error),
      };
    }
    if (!matchesExpected(decision, turn.expected)) {
      return {
        variant,
        turn: index + 1,
        userMessage: turn.userMessage,
        expected: describeExpected(turn.expected),
        received: describeDecision(decision),
      };
    }
    applyTurn(state, turn.userMessage, decision);
  }
  return undefined;
}

export function runCase(testCase: EvalCase, agent: Agent): CaseResult {
  const failures: TurnFailure[] = [];
  for (const variant of VARIANTS) {
    const failure = runVariant(variant.transform(testCase), agent, variant.name);
    if (failure) failures.push(failure);
  }
  return {
    testCase,
    passedOriginal: !failures.some((failure) => failure.variant === "original"),
    passed: failures.length === 0,
    failures,
  };
}

export function runSuite(cases: EvalCase[], agent: Agent): CaseResult[] {
  return cases.map((testCase) => runCase(testCase, agent));
}

export function printReport(title: string, results: CaseResult[]): void {
  console.log(`${title}\n`);
  for (const tier of TIERS) {
    const inTier = results.filter((result) => result.testCase.tier === tier);
    if (inTier.length === 0) continue;
    console.log(`${tier.toUpperCase()}`);
    for (const result of inTier) {
      const mark = result.passed ? "✓" : result.passedOriginal ? "~" : "✗";
      const turns = result.testCase.turns.length > 1 ? ` (${result.testCase.turns.length} turns)` : "";
      console.log(`${mark} ${result.testCase.name}${turns}`);
      const shown = result.passedOriginal
        ? result.failures
        : result.failures.filter((failure) => failure.variant === "original");
      for (const failure of shown) {
        const where = result.testCase.turns.length > 1 ? `turn ${failure.turn} ` : "";
        const label = failure.variant === "original" ? "" : `[${failure.variant}] `;
        console.log(`    ${label}${where}"${failure.userMessage}"`);
        console.log(`      expected ${failure.expected}; received ${failure.received}`);
        if (failure.error) console.log(`      error: ${failure.error}`);
      }
    }
    const passed = inTier.filter((result) => result.passed).length;
    console.log(`  ${tier}: ${passed} / ${inTier.length}\n`);
  }
  const passed = results.filter((result) => result.passed).length;
  const fragile = results.filter((result) => result.passedOriginal && !result.passed).length;
  console.log(`Score: ${passed} / ${results.length}`);
  if (fragile > 0) {
    console.log(`(${fragile} passed as written but failed a robustness variant, marked ~)`);
  }
}
