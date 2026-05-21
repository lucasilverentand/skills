---
title: Linear planner project brief
status: Approved
owner: Luca Silverentand
last_updated: 2026-05-21
related:
  - ../skills/create-planner-project/SKILL.md
  - ../skills/create-planner-project/references/planner-project-structure.md
  - ../skills/create-planner-project/references/linear-issue-creation.md
---

# Linear planner project brief
This is the project source of truth for the `linear-planner` plugin. Use it when changing what the plugin does, how it uses Linear, or how the reusable planner structure is maintained.

## 1. Summary
The Linear planner plugin turns a reusable planning structure into real Linear initiatives, projects, milestones, issues, documents, and status updates for a specific product. It exists so Codex and Claude workflows can set up serious project planning from the same plugin-owned source without keeping fake template issues alive in Linear or copying stale checklists between projects.

---

## 2. Why it should exist

### 2.1. The problem
New app and product work needs a repeatable planning spine: framing, decisions, living docs, foundation work, and an explicit gate before execution. Linear is the working system for that planning, but a live "template project" creates non-real work and drifts from the source repo. Ad hoc setup has the opposite failure mode: inconsistent issues, missing milestones, or web-shaped assumptions that do not fit native, backend, automation, AI, or integration-heavy products.

### 2.2. The thesis
Keep reusable planning knowledge in the skills repo and create only real Linear records in Linear. The plugin reads a versioned planner structure, chooses a project type profile, then adapts the same five-phase model to the product being planned. Linear remains the coordination surface for real initiatives and projects; the repo remains the versioned source for reusable behavior.

---

## 3. Audience
The primary users are Luca and agent workflows setting up planning for real apps, services, tools, or product areas in Linear. They need consistent planning records with enough judgment to adapt the plan to the project type and current Linear workspace.

---

## 4. Principles and tradeoffs
- We choose real Linear records over live template projects because planning tools should show work that can be owned, sequenced, and closed.
- We choose one profile-aware planner structure over separate platform templates because mixed products need shared planning phases with platform-specific acceptance detail.
- We choose Linear documents as the planning source of truth until a repo exists because early scope needs visibility next to the initiative and project.
- We choose repo-versioned reusable behavior over Linear-hosted reusable templates because plugin changes need branch review, tests, and history.
- We choose explicit setup boundaries over automatic execution backlog creation because planning work should not silently become implementation commitment.

---

## 5. Core experience
A user asks for a planner project for a real product. The agent confirms the project name, Linear team, matching initiative, project type, and intended surfaces. It reads this brief and the reusable planner structure, picks the closest project type profile, then creates or selects the real Linear project. It creates the five milestones and 23 planner issues, leaves committed planning work in Todo unless the user asks for a speculative draft, and posts a short status update naming the first unblocked issue.

Codex and Claude must consume the same authored skill source under `plugins/linear-planner/skills/`; generated manifests and READMEs are packaging outputs, not separate behavior surfaces. When maintaining the plugin, update this brief if the change alters purpose, Linear behavior, scope boundaries, or maintenance rules.

---

## 6. Scope

### 6.1. In scope
1. **Reusable Linear planning structure**
   Five phases, milestones, and planning issue records for new project planning work.
2. **Project type adaptation**
   Web, native, backend, automation, AI, data, integration-heavy, and mixed products without forcing one default stack.
3. **Linear record creation rules**
   How to create or select initiatives, projects, milestones, issues, labels, relationships, documents, comments, and status updates.
4. **Planning document boundaries**
   When Linear documents stay canonical, when repo docs link back, and when durable findings move out of issue comments.
5. **Plugin maintenance guidance**
   Keep this brief, the skill workflow, and the planner structure aligned.

### 6.2. Out of scope
1. **Live reusable Linear template projects**
   The plugin must not depend on active template projects or reusable template issues.
2. **Implementation backlog generation**
   The planner creates planning and foundation work only. Feature build tickets belong after the planning gate.
3. **Generic Linear automation**
   Triage, sprint management, reporting, and issue cleanup outside planner setup belong elsewhere.
4. **Product-specific documents after setup**
   Each product owns its own brief, risk register, decisions, and launch material.
5. **Project-doc template ownership**
   The planner may reference project-docs templates but should not copy or fork them.

---

## 7. Success and done criteria
|Criterion|Target|
|---|---|
|Real Linear work only|Setup creates or selects real initiative/project records and never needs an active reusable template project.|
|Complete planning spine|Setup creates the five expected milestones and 23 planning issues.|
|Profile-aware output|Descriptions and acceptance criteria reflect the selected project type.|
|Linear field discipline|No cycle by default; committed work starts in Todo; speculative work can start in Suggestion.|
|Issue relationship discipline|Blockers, parent issues, related issues, labels, priorities, milestones, and status updates follow the shared issue-creation rules.|
|Document ownership|Linear planning docs stay canonical until a repo exists; repo docs link back instead of duplicating the plan.|
|Codex and Claude parity|Both surfaces use the same skill source, project document, and generated package metadata.|
|Maintenance traceability|Behavior changes update this brief and the planner structure in the same PR.|
|Repo validation|`bun run marketplace`, `bun run check`, and relevant formatting or type checks pass before PR.|

---

## 8. Risks and assumptions
|Risk or assumption|Mitigation|
|---|---|
|The planner structure reference is already large.|Track splitting it separately; keep this brief focused on project truth.|
|Linear statuses, labels, or workspace conventions can differ between teams.|Use names rather than copied IDs, confirm essential fields, and comment when a required field cannot be resolved.|
|Agents might create implementation issues during setup because the planner output looks like a backlog.|Keep implementation backlog creation out of scope and make the Phase 4 gate the handoff point into execution.|
|The project brief can drift from the skill and planner structure.|Treat this brief as required maintenance input for any behavior-changing planner PR.|
|The project-docs template library may evolve separately from the planner.|Reference project-docs conventions instead of copying their templates into the planner plugin.|

---

## 9. Implementation links
- Current document task: [ST-1109](https://linear.app/seventwo/issue/ST-1109/write-and-maintain-the-planning-plugin-project-document).
- Issue-creation rules task: [ST-1110](https://linear.app/seventwo/issue/ST-1110/review-and-merge-linear-issue-creation-instructions).
- Related follow-up: [GitHub #49](https://github.com/lucasilverentand/skills/issues/49) tracks splitting the large planner structure reference.

---

## 10. Open questions
- Should this repo-local brief also be mirrored into the matching Linear project for planning visibility, or should the repository stay canonical because plugin behavior is code-reviewed here?
- Which Linear initiative should permanently own the `linear-planner` plugin work?
