## Project document
The project source of truth for this plugin is [documents/project-brief.md](documents/project-brief.md). Read it before changing planner behavior, Linear record creation rules, project type support, or the reusable planner structure.

The detailed operational structure lives in [skills/create-planner-project/references/planner-project-structure.md](skills/create-planner-project/references/planner-project-structure.md).

The shared issue workflow lives in [skills/issue-authoring/SKILL.md](skills/issue-authoring/SKILL.md). It owns platform-neutral issue writing, implementer-ready body shape, routing metadata, dependency semantics, and complexity scoring. Destination references are metadata adapters only.

The project intent workflow lives in [skills/project-intent/SKILL.md](skills/project-intent/SKILL.md). Use it before docs, projects, or issues when an idea needs structured interviews, A/B/C narrowing, portfolio triage, or an LLM alignment packet.

The compatibility entrypoints [skills/estimate-issue-complexity/SKILL.md](skills/estimate-issue-complexity/SKILL.md) and [skills/tidy-linear-project/SKILL.md](skills/tidy-linear-project/SKILL.md) route old triggers to `issue-authoring` and its references.

## Planning flow
Use `project-intent` when direction is still fuzzy, `requirements` for whole-system requirements, `task-spec` for bounded implementation briefs, `issue-authoring` for ticket-ready issue bodies and metadata, and `create-planner-project` when a real Linear initiative/project needs the full planning spine.

Filled product documents are created per real project, usually from `documentation:project-docs` templates, and stay with the Linear project or product repo that owns the work.
