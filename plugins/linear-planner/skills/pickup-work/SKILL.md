---
name: pickup-work
description: Picks up the next actionable Linear issue for the product represented by the current repository. Use when the user says "/pickup-work", "pickup work", "pick up an issue", "what should I work on next", or asks to start Linear work from a repo. Use when a local monorepo should be mapped to its Linear product initiative or project before assigning and starting an issue.
---

# Pickup Work
Use this skill to choose and reserve the next Linear issue for the product represented by the current working directory.

## Workflow
1. Run `bun plugins/linear-planner/skills/pickup-work/scripts/detect-linear-context.ts` from the skills repo, passing the user's current working directory as the first argument when needed.
2. Read the JSON evidence: git root, repo name, remote names, detected Linear URLs, issue IDs, project hints, and initiative/product terms.
3. Search Linear using the strongest product candidates first. Prefer initiative and project matches over loose issue-title matches.
4. Fetch the most likely project or initiative, then list candidate issues for that project. If only an initiative is found, search/list issues across its product terms and linked projects.
5. Prefer issues that are unassigned or assigned to `me`, not blocked, not archived, not completed, and in Todo/Backlog/Suggestion-ready states. Exclude planning-template work unless the repo itself is the planner plugin.
6. Rank candidates by priority first, then whether the issue is already in the current cycle, then clarity of acceptance criteria, then recency.
7. Before mutating Linear, confirm the candidate is not blocked by open issues. If the tool output is ambiguous, fetch the issue and its blockers.
8. Assign the selected issue to `me` and move it to the team's best in-progress state. Use `Started`, `In Progress`, or the closest available in-progress status from the team status list.
9. Report the issue identifier, title, project, status change, selection rationale, and first concrete implementation step.

## Fallbacks
- If no confident product match exists, summarize the local evidence and ask for the Linear project or initiative.
- If no actionable issue exists, say which project was searched and list the reason each close candidate was skipped.
- If Linear update fails, report the selected issue and the failed mutation separately so the user can retry or update it manually.

## Field rules
- Treat Linear as the source of truth for assignment and workflow state.
- Do not create new issues from this workflow.
- Do not pick completed, canceled, duplicate, archived, blocked, or dependency-only issues.
- Do not change labels, estimates, due dates, cycles, descriptions, projects, or milestones.
- Do not assign a different person unless the user explicitly asks.
