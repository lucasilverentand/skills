---
name: project-intent
description: Facilitates structured project-intent interviews and A/B/C option narrowing before planning work. Use when the user asks to refine an app, product, repo, automation, or project idea, feels lost across many projects, wants Codex to interview them, wants A/B/C choices, needs an LLM alignment packet, wants to decide whether to build, pause, merge, or kill a project, or wants to prepare a Linear planning project before creating docs, issues, or implementation work.
---

# Project Intent
Use this skill before `project-docs`, `create-planner-project`, or `linear-issues` when the project direction is still fuzzy. It turns scattered ideas into a concise intent packet that future agents can ingest.

## Core posture
- Interview first. Do not jump to implementation, Linear project creation, or issue creation while purpose, audience, scope, and current lane are unclear.
- Keep Linear and GitHub as execution sources of truth. This skill owns intent shaping and LLM alignment, not backlog management.
- Prefer one short round at a time. When the user is lost, offer A/B/C options with trade-offs instead of asking broad open-ended questions.
- Keep decisions, assumptions, open questions, and evidence separate.
- Treat `build`, `pause`, `merge into another project`, and `kill` as equally valid outcomes.

## Workflow
1. Scope the session: one new idea, one existing project, or a portfolio triage across many projects.
2. For an existing project, inspect available repo, Linear, GitHub, and prior-context evidence before interviewing. Do not rely only on the user's memory if live state is cheap to check.
3. Read `references/interview-playbook.md` for the matching interview mode.
4. Run one interview round at a time. Ask at most three questions, or present one A/B/C choice set.
5. After each answer, reflect the working interpretation in two to five bullets and name the uncertainty that remains.
6. Use A/B/C option narrowing whenever the user hesitates, gives multiple directions, or asks what you would do.
7. Stop interviewing when the packet can state: why this should exist, who it serves, current lane, next proof, non-goals, and agent behavior rules.
8. Draft the project intent packet using `references/project-intent-packet-template.md`.
9. Ask the user to approve, correct, or choose between remaining options before creating durable Linear docs, Linear issues, repo files, or implementation tasks.

## A/B/C option rules
- Default to exactly three options: a focused/small path, a balanced/practical path, and an ambitious/high-variance path.
- Give every option a concrete consequence, not just a label.
- Mark one option as recommended only when evidence supports it. Otherwise say what evidence would decide.
- Let the user pick, mix, reject all three, or answer freeform. Do not trap them in the options.
- When the user rejects the options, extract the hidden criterion and make a better option set.

## Output contract
The final packet should include:
- One-line intent
- Project type and current status
- Audience or user
- Problem, job, or desire
- Chosen strategy and rejected alternatives
- Scope, non-goals, and taste/principles
- Linear/GitHub/repo source-of-truth links when known
- Next proof or decision gate
- Agent alignment packet: what future LLM sessions should do, avoid, verify, and ask before changing direction
- Open questions and follow-up handoffs

## Handoffs
- Use `project-docs` to turn an approved intent packet into a project brief, customer profile, research brief, decision record, or testing strategy.
- Use `create-planner-project` only after the intent is committed enough to justify a real Linear planning project.
- Use `linear-issues` only after the work can be phrased as executable issues.
- Use repository docs skills when a repo exists and the intent packet needs to become public README flow or private repo hub documentation.
