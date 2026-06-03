---
name: open-source-docs
description: Creates, audits, and updates public open-source repository documentation, including README files, CONTRIBUTING guides, SECURITY and SUPPORT docs, project badges, quickstarts, usage guidance, community links, and contributor onboarding. Use when maintaining docs for public GitHub projects, libraries, CLIs, apps, or reusable packages, especially when the user says "update this README", "write CONTRIBUTING.md", "make these docs open-source ready", or "improve the public project docs".
---

# Open Source Docs
Use this skill to make public repository documentation useful to first-time users, evaluators, contributors, and maintainers.

## First pass
1. Inspect the repository before writing: `README*`, `CONTRIBUTING*`, `SECURITY*`, `SUPPORT*`, `CODE_OF_CONDUCT*`, `LICENSE*`, `.github/`, package manifests, examples, docs folders, CI workflows, and release files.
2. Determine the project type from the code, not just the current README: app, library, CLI, template, infrastructure repo, plugin, or mixed workspace.
3. Identify the public audience:
   - **Evaluator**: deciding whether the project is active, trustworthy, and a fit.
   - **User**: installing, configuring, and using it.
   - **Contributor**: filing issues, running checks, and submitting changes.
   - **Maintainer**: reviewing releases, support, and security process.
4. Preserve accurate existing content. Remove stale claims, vague hype, and instructions that no longer match the repo.

## README shape
Prefer this flow unless the repo already has a stronger public convention:

1. **Header**: project name, one-sentence purpose, compact status signals, and useful badges. Use a logo or banner only when the repo already has one or the user provides one.
2. **Why it exists**: what problem it solves, who it is for, and what makes it different in concrete terms.
3. **Install or setup**: shortest successful path from clean machine to usable project.
4. **Quickstart**: one runnable example or workflow that proves the project works.
5. **Usage**: common commands, configuration, API examples, screenshots, or integration notes as appropriate.
6. **Project layout**: only include this when the repo is large enough that readers need orientation.
7. **Development**: local prerequisites, install command, test/lint/typecheck commands, and any generated-file workflow.
8. **Contributing**: link to `CONTRIBUTING.md`; keep detailed contribution rules there.
9. **Support and security**: link to issue templates, discussions, `SUPPORT.md`, and `SECURITY.md` when present.
10. **License**: state the license and link to `LICENSE`.

## Supporting docs
- Put contributor workflow, coding standards, branch naming, commit conventions, PR expectations, and local validation in `CONTRIBUTING.md`.
- Put vulnerability reporting, supported versions, and disclosure expectations in `SECURITY.md`.
- Put help channels, issue triage expectations, and commercial/community support boundaries in `SUPPORT.md`.
- Put long examples in `docs/`, `examples/`, or package-specific files and link them from the README.
- Keep `.github/ISSUE_TEMPLATE/*` and `.github/PULL_REQUEST_TEMPLATE*` aligned with the README and CONTRIBUTING guide.

## Writing rules
- Be concrete. Use actual commands, package names, paths, environment variables, ports, and artifact names.
- Make the first successful path obvious. A new user should know exactly what to run.
- Separate user docs from contributor docs. The README can point to contribution details, but it should not become a maintainer handbook.
- Prefer public links and public context. Do not include private Linear links, internal Slack channels, private runner names, or company-only context unless the user explicitly asks and the repo is not public.
- Avoid fake completeness. If setup depends on missing secrets, services, hardware, or access, say so directly.
- Use GitHub Flavored Markdown tables only when comparison or scanning is better than prose.
- Keep badges useful: CI, package version, license, docs, coverage, or security. Do not add vanity badges.

## Update workflow
1. Build an inventory of docs and note conflicts between files.
2. Verify commands against package scripts or Makefiles before documenting them.
3. Update the smallest set of docs that fixes the reader journey.
4. Remove duplicated instructions when one canonical doc can own them.
5. If you change generated docs or generated examples, run the repo's generator and commit generated output with the source.
6. Validate Markdown formatting and links with available project checks.

## Done checklist
- [ ] The README tells a public reader what the project is, why it matters, and how to try it.
- [ ] Install, quickstart, and validation commands match the repo.
- [ ] CONTRIBUTING owns detailed contribution workflow.
- [ ] SECURITY and SUPPORT exist or the README clearly points to the current public process.
- [ ] Public docs do not leak private project-management, infrastructure, or company context.
- [ ] Links, badges, and file references are current.
