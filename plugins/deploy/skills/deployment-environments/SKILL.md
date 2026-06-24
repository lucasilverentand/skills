---
name: deployment-environments
description: Designs and documents deployment environments for codebases, including local, preview, staging, production, secrets, configuration, infrastructure ownership, environment parity, promotion paths, and prerequisites. Use when the user asks how to set up environments, decide staging vs production topology, prepare deploy config, organize infra, or make a codebase ready to deploy.
---

# Deployment Environments
Use this skill to turn a codebase's runtime needs into clear deployment environments before automation is wired.

## First pass
1. Inspect the codebase for deployable units, package managers, build commands, runtime targets, infra files, CI workflows, secrets usage, migrations, queues, scheduled jobs, and health endpoints.
2. Identify environment classes: local development, ephemeral preview, staging, production, background workers, admin tools, and data stores.
3. Define the minimum viable environment set. Do not add staging, preview, or regional splits unless they reduce real risk.

## Design checklist
- **Topology**: deployable services, workers, storage, queues, domains, and external dependencies.
- **Configuration**: environment variables, secrets, public config, defaults, and ownership.
- **Parity**: which behaviors must match production and which can differ locally or in previews.
- **Data**: migrations, seed data, backups, restores, retention, and destructive-operation safeguards.
- **Access**: who can deploy, view logs, rotate secrets, run migrations, and access production data.
- **Observability**: health checks, logs, metrics, alerts, dashboards, and release markers.
- **Failure handling**: rollback constraints, maintenance windows, incident contacts, and manual recovery steps.

## Output
Produce an environment plan with:
- environment list and purpose
- deployable units and ownership
- required secrets/config
- provisioning checklist
- readiness gaps before automation

Do not perform live infrastructure changes unless the user explicitly asks for deployment execution.
