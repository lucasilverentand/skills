---
name: closed-source-docs
description: Creates, audits, and updates private or closed-source project documentation, including internal README hubs, codebase navigation guides, ownership links, Linear initiative links, onboarding notes, runbooks, and contribution guidance for teams. Use when maintaining docs for private repositories, internal apps, services, infrastructure, or company projects, especially when the user says "make this README an internal hub", "document how to navigate this repo", "add Linear links to the docs", or "write private project documentation".
---

# Closed Source Docs
Use this skill to make a private repository easy for teammates and agents to understand, operate, and change without turning the README into public marketing copy.

## First pass
1. Confirm the repo is private, internal, or otherwise not intended as a public open-source project. If unsure, inspect remotes, license, package metadata, GitHub visibility hints, and existing docs before assuming.
2. Read existing docs and project context: `README*`, `CONTRIBUTING*`, `AGENTS.md`, `CLAUDE.md`, `.github/`, `docs/`, package manifests, deployment config, CI workflows, and local tooling files.
3. Identify the real operating surface: app, service, package, infrastructure repo, automation, data pipeline, plugin, or monorepo.
4. Find authoritative links where possible: Linear initiative or project, GitHub project, deployment dashboard, observability, runbooks, design docs, ADRs, incidents, and support channel.
5. Preserve sensitive details carefully. Internal docs can link to private systems, but avoid copying secrets, credentials, customer data, private tokens, or unnecessary personal information.

## README as hub
Closed-source READMEs should help maintainers move fast. Prefer this structure:

1. **Project identity**: name, one-sentence purpose, owner/team, and current status.
2. **Primary links**: Linear initiative, GitHub repo or project, production/staging URLs, dashboards, runbooks, design docs, and support channel.
3. **What lives here**: short explanation of the codebase boundaries and what belongs elsewhere.
4. **Quick local start**: prerequisites, install command, environment setup, run command, and test command.
5. **Codebase map**: important directories, packages, services, entrypoints, generated files, and ownership notes.
6. **Common workflows**: develop, test, typecheck, lint, generate, migrate, deploy, release, and rollback.
7. **Operational notes**: environments, scheduled jobs, queues, data stores, observability, alerts, and known failure modes.
8. **How to change it**: branch or issue conventions, PR expectations, validation gates, code owners, and documentation update rules.
9. **Open questions or known gaps**: only if the repo already tracks them here; otherwise file issues instead of turning the README into a backlog.

## Contribution guidance
- Use `CONTRIBUTING.md` for recurring team workflow: local setup, branch naming, commit and PR expectations, review policy, generated artifacts, validation commands, release steps, and rollback notes.
- Keep repo-specific agent instructions in `AGENTS.md`, `CLAUDE.md`, or equivalent files when the project already uses them.
- Link to Linear rather than duplicating planning detail. Prefer the initiative for long-lived context and issues for specific implementation tasks.
- If docs reveal follow-up work, file it in the project tracker instead of expanding the current documentation change.

## Writing rules
- Write for the next teammate or agent who has repository access but no meeting context.
- Make authoritative links visible near the top. A private README is often a control panel, not a sales page.
- State ownership and boundaries plainly. Readers should know who owns the system and what this repo should not be used for.
- Prefer exact commands over prose. Match package scripts, task runners, Makefiles, and CI names.
- Mark access requirements: required accounts, secrets source, VPN, local services, cloud permissions, hardware, or staging data.
- Keep sensitive values out of docs. Say where to obtain them, not what they are.
- Avoid public-open-source boilerplate unless the repo is actually meant to accept outside users or contributors.

## Update workflow
1. Inventory the docs and remove conflicts between README, CONTRIBUTING, runbooks, and agent instructions.
2. Verify commands against the repo's real scripts before documenting them.
3. Check whether links are durable enough for a README. Prefer stable Linear initiative, dashboard, and runbook links over one-off comments.
4. Keep planning, implementation detail, operations, and contribution policy in their owning files; cross-link instead of copying.
5. Add missing docs only when they have a clear owner and recurring reader.
6. Run available Markdown, formatting, and repo validation checks.

## Done checklist
- [ ] The README is a practical internal hub with owner, status, links, setup, and codebase map.
- [ ] Linear or project-tracker links point to durable initiative or project context when available.
- [ ] Local setup and validation commands match the repo.
- [ ] Contribution guidance lives in `CONTRIBUTING.md` or an existing equivalent.
- [ ] Sensitive data is referenced by source or process, not copied into docs.
- [ ] Follow-up work is tracked outside the README.
