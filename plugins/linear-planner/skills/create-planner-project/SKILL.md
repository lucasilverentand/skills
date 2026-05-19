---
name: create-planner-project
description: Creates fresh Linear planning projects from Luca's five-phase planner structure. Use when the user asks to "create a planner project", "set up planning in Linear", "turn this app idea into a Linear planning project", or replace a live Linear template project with a reusable skill-backed workflow. Use when a real project needs initiative, project, milestone, and issue records in Linear without keeping reusable template issues live.
---

# Create Planner Project
Use this skill to create a real Linear planning project from a reusable structure. The structure lives in `references/planner-project-structure.md`.

## Core rule
Never keep a reusable "Project Planning Template" project alive in Linear. Linear should contain real initiatives, real projects, and real work only. This skill creates fresh project records for a specific app or product area.

## Workflow
1. Confirm the project name, Linear team, and matching initiative. If the initiative does not exist, propose creating it first.
2. Read `references/planner-project-structure.md` before creating anything.
3. Create or select one real Linear project under the initiative. Use a name like `<Product> Planning` unless the user gives a better name.
4. Set the project to Planning, add the initiative, set a lead if known, and avoid adding a cycle unless the user explicitly asks for this planning work to be in the current cycle.
5. Create the five milestones exactly as listed in the reference.
6. Create the 23 issues from the reference. Replace the example product label with the actual product label. Keep the functional labels.
7. Leave issues in Todo for committed planning work. Use Suggestion only when the user asked for a speculative draft.
8. Add a short project status update explaining that the planner project was created and naming the first unblocked issue.

## Field rules
- Do not copy source Linear issue IDs or branch names from the reference.
- Do not assign a cycle by default.
- Do not create implementation issues during setup. This skill creates planning and foundation issues only.
- Keep Linear planning documents as the source of truth until a repository exists. Repo docs should link back to Linear instead of duplicating the whole plan.
- If the user wants to migrate an existing template project, move or recreate the issues under the real project, then recommend archiving the template project.

## Follow-up cleanup
After creating a planner project from a former live template, flag these cleanup actions:
- Archive the old template project once its issues are moved or recreated.
- Remove any accidental template issues from active cycles.
- Make sure the initiative itself has at least a summary, owner, and the new planning project attached.
