---
name: create-planner-project
description: Creates fresh Linear planning projects from Luca's five-phase planner structure. Use when the user asks to "create a planner project", "set up planning in Linear", "turn this app idea into a Linear planning project", or replace a live Linear template project with a reusable skill-backed workflow. Use when a real web, native, backend, automation, data, AI, or mixed-surface project needs initiative, project, milestone, and issue records in Linear without keeping reusable template issues live.
---

# Create Planner Project
Use this skill to create a real Linear planning project from a reusable structure. The structure lives in `references/planner-project-structure.md`.

## Core rule
Never keep a reusable "Project Planning Template" project alive in Linear. Linear should contain real initiatives, real projects, and real work only. This skill creates fresh project records for a specific app or product area.

## Maintenance rule
When changing what this plugin does, how it uses Linear, or how the reusable planner structure works, read `../../documents/project-brief.md` first and keep it aligned with the skill and reference changes.

## Workflow
1. Confirm the project name, Linear team, matching initiative, project type, and intended surfaces. If the initiative does not exist, propose creating it first.
2. Read `references/planner-project-structure.md` before creating anything.
3. Choose the closest project type profile from the reference. For mixed products, choose a primary profile and list secondary surfaces in the relevant issue descriptions.
4. Create or select one real Linear project under the initiative. Use a name like `<Product> Planning` unless the user gives a better name.
5. Set the project to Planning, add the initiative, set a lead if known, and avoid adding a cycle unless the user explicitly asks for this planning work to be in the current cycle.
6. Create the five milestones exactly as listed in the reference.
7. Create the 23 issues from the reference. Replace the example product label with the actual product label, keep the functional labels, and adapt the issue text with the chosen project type profile.
8. Leave issues in Todo for committed planning work. Use Suggestion only when the user asked for a speculative draft.
9. Add a short project status update explaining that the planner project was created and naming the first unblocked issue.

## Field rules
- Do not copy source Linear issue IDs or branch names from the reference.
- Do not assign a cycle by default.
- Do not create implementation issues during setup. This skill creates planning and foundation issues only.
- Do not force a web stack onto non-web projects. Use the project type profile to decide which stack, distribution, testing, privacy, and observability criteria apply.
- Keep Linear planning documents as the source of truth until a repository exists. Repo docs should link back to Linear instead of duplicating the whole plan.
- If the user wants to migrate an existing template project, move or recreate the issues under the real project, then recommend archiving the template project.

## Follow-up cleanup
After creating a planner project from a former live template, flag these cleanup actions:
- Archive the old template project once its issues are moved or recreated.
- Remove any accidental template issues from active cycles.
- Make sure the initiative itself has at least a summary, owner, and the new planning project attached.
