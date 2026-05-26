---
title: Linear planner project brief
status: Approved
owner: Luca Silverentand
last_updated: 2026-05-21
related:
  - ../skills/create-planner-project/SKILL.md
  - ../skills/create-planner-project/references/planner-project-structure.md
---

# Linear planner project brief
This is the source of truth for the `linear-planner` plugin. Use it when changing plugin behavior, Linear usage, or the reusable planner structure.

## 1. Summary
The Linear planner plugin turns a reusable planning structure into real Linear initiatives, projects, milestones, issues, and status updates. It tells those issues which product documents need to be written and where the filled docs should live.

The plugin owns reusable planner structure and document requirements, not filled product documents. Filled docs are created per real project, usually from `project-docs` templates, and stay with the Linear project or product repo that owns the work.

## 2. Why it should exist

### 2.1. The problem
New product work needs a repeatable planning spine: framing, decisions, living docs, foundation work, and an explicit gate before execution. Linear is the working system, but a live "template project" creates non-real work and drifts from the source repo. Ad hoc setup creates inconsistent issues, missing milestones, missing document prompts, or web-shaped assumptions that do not fit native, backend, automation, AI, or integration-heavy products.

### 2.2. The thesis
Keep reusable planning knowledge in the skills repo and create only real Linear records in Linear. The plugin reads a versioned planner structure, chooses a project type profile, then adapts the same five-phase model to the product being planned. Linear owns real initiatives, projects, issues, and product document instances; the repo owns reusable behavior and templates.

## 3. Audience
The primary users are Luca and agent workflows setting up planning for real apps, services, tools, or product areas in Linear.

## 4. Principles and tradeoffs
- Real Linear records, not live template projects.
- One profile-aware planner structure, not separate platform templates.
- Linear documents are the default home for filled planning docs until a repo exists.
- Reusable behavior and templates stay repo-versioned because plugin changes need review, tests, and history.
- Planner setup should not silently become implementation commitment.

## 5. Core experience
A user asks for a planner project for a real product. The agent confirms the project name, Linear team, matching initiative, project type, and intended surfaces. It reads this brief and the reusable planner structure, picks the closest profile, then creates or selects the real Linear project. It creates the five milestones and 23 planner issues, leaves committed planning work in Todo unless the user asks for a speculative draft, and posts a short status update naming the first unblocked issue.

Planner issues ask for actual product documents where planning needs them: brief, platform decision, stack decision, risk register, open questions log, launch checklist, and similar records. They may point to `project-docs` templates, but completed documents belong to the product's Linear project or repo, not to the planner plugin.

Codex and Claude must consume the same authored skill source under `plugins/linear-planner/skills/`; generated manifests and READMEs are packaging outputs. Update this brief when a change alters purpose, Linear behavior, scope boundaries, or maintenance rules.

## 6. Scope

### 6.1. In scope
1. **Reusable Linear planning structure**
   Five phases, milestones, and planning issue records.
2. **Project type adaptation**
   Web, native, backend, automation, AI, data, integration-heavy, and mixed products.
3. **Linear record creation rules**
   How to create or select initiatives, projects, milestones, issues, labels, comments, and status updates.
4. **Planning document boundaries**
   Which issues require actual product docs, which templates guide them, when Linear docs stay canonical, and when repo docs link back.
5. **Plugin maintenance guidance**
   Keep this brief, the skill workflow, and the planner structure aligned.

### 6.2. Out of scope
1. **Live reusable Linear template projects**
   The plugin must not depend on active template projects or reusable template issues.
2. **Implementation backlog generation**
   The planner creates planning and foundation work only.
3. **Generic Linear automation**
   Triage, sprint management, reporting, and issue cleanup outside planner setup belong elsewhere.
4. **Product-specific documents after setup**
   Each product owns its own brief, risk register, decisions, and launch material.
5. **Project-doc template ownership**
   The planner may reference project-docs templates but should not copy or fork them.

## 7. Success and done criteria
|Criterion|Target|
|---|---|
|Real Linear work only|Setup creates or selects real initiative/project records and never needs a reusable template project.|
|Complete planning spine|Setup creates the five expected milestones and 23 planning issues.|
|Profile-aware output|Descriptions and acceptance criteria reflect the selected project type.|
|Linear field discipline|No cycle by default; committed work starts in Todo; speculative work can start in Suggestion.|
|Document ownership|Reusable templates stay in the skills repo; filled product docs stay with the product's Linear project or repo.|
|Codex and Claude parity|Both surfaces use the same skill source, project document, and generated package metadata.|
|Maintenance traceability|Behavior changes update this brief and the planner structure in the same PR.|
|Repo validation|`bun run marketplace`, `bun run check`, and relevant formatting or type checks pass before PR.|

## 8. Risks and assumptions
|Risk or assumption|Mitigation|
|---|---|
|The planner structure reference is already large.|Track splitting it separately; keep this brief focused.|
|Linear statuses, labels, or workspace conventions can differ between teams.|Use names rather than copied IDs and comment when a required field cannot be resolved.|
|Agents might create implementation issues during setup because the planner output looks like a backlog.|Keep implementation backlog creation out of scope and make the Phase 4 gate the handoff point into execution.|
|The project brief can drift from the skill and planner structure.|Treat this brief as required maintenance input for any behavior-changing planner PR.|
|Agents may confuse `project-docs` templates with filled planning documents.|State the distinction in this brief and in planner issue text: templates guide writing; product projects own the filled documents.|
|The project-docs template library may evolve separately from the planner.|Reference project-docs conventions instead of copying their templates into the planner plugin.|

## 9. Implementation links
- Current document task: [ST-1109](https://linear.app/seventwo/issue/ST-1109/write-and-maintain-the-planning-plugin-project-document).
- Related follow-up: [GitHub #49](https://github.com/lucasilverentand/skills/issues/49) tracks splitting the large planner structure reference.

## 10. Open questions
- Which Linear initiative should permanently own the `linear-planner` plugin work?
