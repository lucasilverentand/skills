---
name: codebase-structure
description: Structures codebases and repositories by project type, runtime boundary, domain ownership, and maintenance workflow. Use when the user asks how to organize a codebase, scaffold a repo, split a monolith, design a monorepo, move files, choose folders, clean up LLM-generated project layout, or decide where app, package, service, test, config, docs, and deployment code should live. Covers Apple apps, web apps, websites, Expo/React Native, Cloudflare/full-stack services, CLIs, agent skills/plugins, Home Assistant integrations, and GitOps/homelab projects.
---

# Codebase Structure
Use this skill to choose a codebase shape that helps agents and humans find the right place for code, tests, configuration, deployment, and documentation. Treat existing repositories as evidence of constraints, not as examples to copy; many real layouts contain accidental LLM organization, stale experiments, or historical compromises.

## Decision Tree
- What is the user asking for?
  - **Greenfield structure or scaffold** -> classify the project type, read `references/project-type-playbooks.md`, and propose a clean tree with rationale.
  - **Existing repo cleanup or reorganization** -> inspect the current tree, read `references/migration-and-review.md`, and produce an incremental migration plan.
  - **"Where should this code live?"** -> identify the runtime, owner, lifecycle, and dependency direction, then apply `references/core-principles.md`.
  - **Monorepo or multi-app workspace** -> read `references/core-principles.md`, define deployable apps first, then shared packages only where reuse is real.
  - **LLM-generated messy project** -> read `references/migration-and-review.md`, preserve working behavior, reject generic buckets, and restructure around project type, runtime boundaries, and domain workflows.
  - **Architecture, API, data model, UI, dashboard, or website design rather than file layout** -> use the relevant design skill first, then return here for repository shape.

## Core Workflow
1. Identify project type or project-type mix. Use the user's named platform if given; otherwise infer from package files, build tools, source directories, deployment config, and tests.
2. Inventory hard constraints: runtime targets, deployment units, package manager, generated files, build system, test runner, native platform conventions, and existing public APIs.
3. Read `references/core-principles.md` before making structural recommendations.
4. Read only the relevant section of `references/project-type-playbooks.md` for the project type.
5. Choose top-level boundaries by deployable unit and lifecycle before choosing feature folders.
6. Place shared code only after proving it is used by more than one owner or must be centralized for correctness.
7. For existing repos, read `references/migration-and-review.md` and prefer small behavior-preserving moves with validation gates.
8. Return a proposed tree, reasoning, rejected alternatives, migration steps if needed, and validation commands.

## Rules
- Do not copy the organization of one of Luca's existing projects just because it exists. Use the project type, not the current project's accidental folder names.
- Keep framework conventions where they carry toolchain meaning. Override local clutter where it is merely historical or LLM-generated.
- Separate deployable apps from reusable packages, generated artifacts, infrastructure, and docs.
- Prefer domain or feature ownership inside an app; avoid broad buckets like `components`, `utils`, `helpers`, `services`, and `lib` when they become dumping grounds.
- Keep tests near the code when the ecosystem supports it; use separate integration or end-to-end roots when tests cross runtime or deployment boundaries.
- Make dependency direction obvious: app -> feature/domain -> shared primitives. Shared packages must not import apps.
- Keep generated files, build output, vendored assets, and local machine config out of authored source paths.

## Reference Routing
|Need|Read|
|---|---|
|Universal structure rules, boundary tests, naming, tests, docs, generated files|`references/core-principles.md`|
|Project-type playbooks for Apple, web, Expo, Cloudflare, CLI, skills/plugins, Home Assistant, GitOps/homelab|`references/project-type-playbooks.md`|
|Existing repo audits, migration plans, review checklist, LLM-layout cleanup|`references/migration-and-review.md`|

## Output Shape
For advisory work, include:

1. Project type classification and assumptions.
2. Proposed top-level tree and one representative deeper slice.
3. Boundary rationale: deployables, domains, shared packages, tests, infrastructure, docs.
4. Anti-patterns rejected from the current or likely LLM-generated layout.
5. Validation plan: build, test, lint, import checks, generated artifact checks.

For implementation work, make the moves, update imports/configs, run the validation plan, and summarize the resulting structure.
