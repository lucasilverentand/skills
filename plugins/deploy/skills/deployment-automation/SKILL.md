---
name: deployment-automation
description: Designs and implements deployment automation for codebases, including CI/CD pipelines, release workflows, preview deployments, promotion gates, rollback, migrations, post-deploy checks, and monitoring. Use when the user asks to automate deploys, set up CI/CD, create release pipelines, wire preview environments, or make deployments repeatable and verifiable.
---

# Deployment Automation
Use this skill after the deployable units and environment model are understood. Pair with `deploy:deployment-environments` when topology, secrets, or environment boundaries are unclear.

## Safety boundary
- Plan and configure automation by default.
- Run live deploys, production migrations, secret writes, DNS changes, or destructive infrastructure actions only after explicit user intent.
- Prefer dry runs, previews, generated diffs, and validation commands before applying changes.

## Workflow
1. **Inventory**
   - Read existing CI workflows, deploy scripts, package scripts, infra config, release docs, and hosting provider files.
   - Identify build, test, migration, publish, deploy, rollback, and smoke-test commands.
2. **Pipeline shape**
   - Choose triggers: pull request, merge to main, tag, manual dispatch, schedule, or environment promotion.
   - Define gates: tests, lint/typecheck, generated artifact checks, security scans, approvals, migration checks, and preview verification.
3. **Automation**
   - Add or update CI/CD configuration using the repo's existing provider and style.
   - Keep secrets referenced by name; do not commit secret values.
   - Make deployment steps idempotent where possible.
4. **Verification**
   - Add post-deploy health checks, smoke tests, release markers, and rollback instructions.
   - Document what a successful deployment proves and what remains manual.

## Output
State the pipeline triggers, environments affected, required secrets, validation gates, rollback path, and post-deploy checks.
