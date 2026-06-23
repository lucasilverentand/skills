---
name: task-spec
description: Interviews the user to turn rough intent into a written task spec before filing an issue, starting code, or doing substantial work. Use when the user asks to create an issue, start implementation, scope a task, capture specs, clarify intent, write acceptance criteria, says "grill me", or has a fuzzy request that needs a concrete brief before action.
allowed-tools: Read Grep Glob Bash Write Edit AskUserQuestion
---

# Task Spec
Turn a loose task idea into a concrete brief that can drive an issue, implementation, review, or delegated work. This skill is intentionally a little demanding: it should surface assumptions, force tradeoffs into the open, and write down what "done" means before work begins.

## Decision tree
- What is the user trying to start?
  - **Whole-system requirements or architecture intake** -> hand off to `requirements`; this skill is for bounded tasks, issues, and implementation briefs.
  - **Linear or GitHub issue creation** -> run "Spec intake", then write ticket-ready issue text. Hand off to `intent:issue-authoring` when available. Use the relevant issue-creation workflow only after the brief is coherent.
  - **Code implementation** -> inspect the repo, run "Spec intake" for missing intent, then use the brief as the implementation plan. If open questions are non-blocking, record assumptions and continue.
  - **General task, process, research, or delegation** -> run "Spec intake", then produce a task brief with owner-ready next actions.
  - **Tiny low-risk change** (typo, obvious config tweak, simple command) -> do the task directly; do not slow the user down with ceremony.
  - **User says to "just do it" but the scope is unclear or risky** -> run the lightweight intake first and explain which unknowns block useful work.

## Spec intake

### 1. Read available context
Before asking questions, inspect what is already available:

- Existing issue, PR, Linear ticket, chat history, README, `.context/`, product docs, or nearby code.
- Repo signals: current branch, dirty state, relevant modules, tests, conventions, and recent commits when they matter.
- Prior decisions or user preferences already captured in skills, AGENTS.md, CLAUDE.md, or project context.

Do not ask the user to repeat facts that can be read from the workspace or linked context. Start by stating the knowns and the assumptions you are carrying forward.

### 2. Classify the task
Choose the smallest useful spec shape:

|Task shape|Use when|Output|
|---|---|---|
|Issue brief|The next action is filing or refining a ticket|Ticket-ready title, body, acceptance criteria, labels/metadata if known|
|Implementation brief|The next action is coding|Goal, constraints, implementation notes, acceptance criteria, verification plan|
|Decision brief|The next action is choosing between options|Decision to make, options, criteria, risks, recommendation request|
|Research brief|The next action is investigation|Question, sources/context, expected evidence, output format|
|Delegation brief|Another agent or person will do the work|Task, boundaries, handoff context, done state|

If the shape is uncertain, ask one routing question first instead of launching the full interview.

### 3. Interview hard, but keep it useful
Ask in batches of 3-5 questions. Use `AskUserQuestion` when available; otherwise ask directly in chat. Start with the unknowns most likely to change scope or invalidate the work.

Cover these areas, skipping anything already known:

1. **Outcome** -> What should be true when this is done? Who benefits? Why now?
2. **Scope** -> What is in, what is out, and what should stay untouched?
3. **Current context** -> What exists today? What prompted the task? What examples, screenshots, logs, links, or prior attempts matter?
4. **Constraints** -> Stack, product rules, compatibility, budget, timing, legal/compliance, team/process, or dependency limits.
5. **Acceptance criteria** -> Observable checks, user-visible behavior, edge cases, and failure cases.
6. **Verification** -> Tests, manual checks, review steps, telemetry, rollout, or "good enough" evidence.
7. **Traceability** -> Where should the spec live: chat, `.context/tasks/`, Linear, GitHub, PR body, or a handoff note?

Use `references/question-bank.md` when the task spans several areas or the first interview pass feels thin.

### 4. Push on vague language
When the user uses words like "simple", "fast", "clean", "better", "proper", "flexible", or "production-ready", ask what that means in this case. Convert adjectives into examples, thresholds, or explicit tradeoffs.

Good pressure:
- "What is the first unacceptable outcome?"
- "Which part is allowed to be ugly for v1?"
- "What would make you reject the PR even if it technically works?"
- "What should this definitely not turn into?"

Do not argue for its own sake. If the user does not know, record an assumption and label it as such.

### 5. Write the brief
Use `references/task-brief-template.md` as the default structure. Trim sections that do not apply.

The brief should be specific enough that another competent agent could pick it up without re-interviewing the user. Keep it plain:

- Concrete verbs instead of abstract goals.
- Numbered acceptance criteria.
- Explicit non-goals.
- Assumptions and open questions separated from settled decisions.
- Verification steps that match the project, not generic "run tests".

### 6. Continue or hand off
After the brief:

- **If the user asked for an issue** -> create or update the issue using the relevant Linear/GitHub workflow, preserving the brief structure. Use `intent:issue-authoring` when available.
- **If the user asked for code** -> implement from the brief unless a blocking question remains.
- **If the user asked for planning only** -> stop at the brief and call out the next concrete action.
- **If the task belongs to another skill** -> pass the brief forward so the next skill has the user's intent without another intake loop.

## Output rules
- Prefer a useful brief over a long questionnaire. Ask only questions whose answers would change the result.
- Separate "blocked" from "can assume". A missing nice-to-have detail should not stall the task.
- Keep the user's voice where it clarifies intent, but write the final brief in operational language.
- For issues, do not include private/internal context unless the destination is private or the user approved it.
- For code work, include the validation plan before editing so the implementation has a finish line.

## Key references
|File|When to read|
|---|---|
|`references/question-bank.md`|Need sharper interview prompts for a specific task type|
|`references/task-brief-template.md`|Need the default output structure for briefs, issues, or implementation plans|
