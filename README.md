# Hedwig agent context exercise

Hedwig is an AI workspace where users interact with persistent objects called Frames. A Frame can represent a document, todo list, browser session, mail thread, calendar, or other working context.

We created a simplified agent that can operate on Frames. It has a recurring problem: it chooses the wrong context, or asks for clarification when the available workspace state should have been enough.

Your goal is to make the agent better at determining what the user means and selecting the appropriate context.

## Setup

Use Node.js 20 or newer.

```bash
npm install
npm run demo
npm test
npm run eval
```

The unit tests establish that the starter repository works. The evaluation measures agent behavior and is expected to have many failures at the start.

## The exercise

Start by reading the code and running the evaluation. Improve the system so it makes better context decisions.

For example, consider this request:

```text
Add "email Sam" to my actions list.
```

Two Frames have the title `Actions List`. One was modified two minutes ago and is part of the current work; the other was last touched four days ago. The starter may select the wrong one.

You may modify any part of the agent architecture, including context construction, retrieval, ranking, prompts, tools, state representation, memory, and evaluation. There is no required implementation or library. Prefer a clear, explainable improvement over production polish.

You may use any AI coding tools you normally use. Be prepared to explain the decisions you made and how you would know whether they improved the agent.

## The workspace

`WorkspaceState` (see `src/types.ts`) holds more than Frames:

- **Frames** can belong to a project, be archived, sit in the trash, link to other frames, and list participants (mail threads).
- **People** and **projects**. Two different people can share a first name.
- **Calendar events** with attendees and linked frames.
- **Memory**: aliases and preferences the user asked Hedwig to remember.
- **Selection**: text the user has highlighted, and which frame it is in.
- **Conversation** and **recent actions**, with the frames each one referenced.
- **`now`** and the user's **timezone**. Always use `state.now`, never the system clock. "Yesterday" means yesterday in the user's timezone.

## The evaluation

`npm run eval` runs 23 cases in three tiers: easy, medium, and hard. The cases are in `src/evals/cases.ts`.

Each case can grade more than the frame:

| Expected | What the agent must return |
|---|---|
| a frame | `select_frame` with that `frameId`, and the `action` and `sourceFrameId` when the case specifies them |
| several frames | `select_frames` with exactly that set |
| something new | `create_frame` with that `frameType` and, when specified, `projectId` |
| a question | `ask_user`, and when the case lists candidates, `candidateFrameIds` must be exactly that set |

Some cases have several turns. After each turn the harness applies the agent's decision to the workspace (`src/state/transitions.ts`), so an early mistake carries into later turns.

Every case also runs in robustness variants: frames in reversed and shuffled order, every ID renamed, and the clock shifted by a week. A case passes only if all variants pass. `~` in the report marks a case that passed as written but failed a variant.

Additional held-out cases in the same style are used when reviewing your submission, so aim for behavior that generalizes rather than for the visible cases.

### Contract

Keep these stable, because they are how your agent is graded:

- `runAgentTurn(userMessage, state)` in `src/agent/agent.ts` returns `{ decision, context }`.
- `decision` is an `AgentDecision` as defined in `src/types.ts`.
- The agent must be deterministic and run locally. It may not call a model or any network service.

## Repository map

```text
src/agent/       agent pipeline, context builder, and resolver
src/state/       workspace state, fixtures, and turn transitions
src/tools/       local fake tools; nothing calls external services
src/evals/       visible behavioral cases, harness, and runner
tests/           infrastructure and safety-net tests
scripts/demo.ts  example decisions and context output
```

All data is local and fake. No credentials, database, network access, or UI are required.
