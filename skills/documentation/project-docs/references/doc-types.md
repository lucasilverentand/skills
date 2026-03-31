# Doc Type Templates

Structure templates for each documentation type. These define what sections to include and what each section should cover. Skip sections that don't apply to the project.

---

## Project Overview (`docs/overview.md`)

```markdown
# {Project Name}

## What this is
One paragraph: what the project does, who it's for, and why it exists.

## Goals
Bulleted list of what the project aims to achieve.

## Non-goals
What this project explicitly does NOT try to do. Prevents scope creep and sets expectations.

## Key concepts
Domain-specific terms and their definitions. Only include terms that aren't obvious to the target audience.

## Status
Current state: prototype / active development / production / maintenance mode. What's being worked on now.

## Links
- Repository: ...
- Production: ...
- Staging: ...
- Issue tracker: ...
- Design files: ...
```

**Guidance:**
- The "What this is" paragraph should be understandable by someone with zero context
- Goals should be concrete and verifiable, not aspirational fluff
- Non-goals are just as important as goals — they prevent "why doesn't it do X?" questions
- Key concepts should only include domain terms, not technology explanations

---

## Architecture (`docs/architecture.md`)

```markdown
# Architecture

## System overview
High-level description of the system and a diagram showing major components and how they connect.

## Components
For each major component:
- **Name** — what it is and what it's responsible for
- **Technology** — runtime, framework, language
- **Communicates with** — which other components and how (HTTP, events, shared DB, etc.)
- **Deployed as** — container, serverless function, static site, etc.

## Data flow
How data moves through the system for the most important operations. Use diagrams (Mermaid) where possible.

## Infrastructure
Where things run: cloud provider, regions, key services (database, cache, queue, CDN).

## Key design decisions
Brief notes on non-obvious architectural choices and why they were made. Link to decision records in `docs/decisions/` for longer explanations.

## Boundaries and constraints
- External dependencies and SLAs
- Rate limits, quotas, or capacity constraints
- Security boundaries (what trusts what)
```

**Guidance:**
- Start with a Mermaid diagram — it's worth more than paragraphs of prose
- Components should map to actual deployable units or packages, not abstract layers
- Data flow should cover the 2-3 most common paths, not every edge case
- Link to decision records for "why" — architecture doc covers "what" and "how"

---

## Getting Started (`docs/getting-started.md`)

```markdown
# Getting Started

## Prerequisites
Specific tools and versions needed. Include install commands where possible.

## Setup
Step-by-step commands to go from fresh clone to running locally. Number every step.

## Verify it works
A smoke test the developer can run to confirm everything is set up correctly.

## Common tasks
| Task | Command |
|---|---|
| Run dev server | `...` |
| Run tests | `...` |
| Run linter | `...` |
| Build for production | `...` |
| Run database migrations | `...` |

## Troubleshooting
Common setup issues and their fixes. Add to this section as issues are discovered.
```

**Guidance:**
- Test the setup steps on a clean environment if possible
- Prerequisites must include exact version requirements, not just "Node.js"
- The "Verify it works" step is crucial — without it, devs won't know if setup succeeded
- Troubleshooting grows organically — seed it with known gotchas

---

## Contributing (`docs/contributing.md`)

```markdown
# Contributing

## Development workflow
How to pick up work, create branches, and submit changes.

## Branch naming
Convention used: `feat/description`, `fix/description`, etc.

## Commit conventions
Commit message format and any enforced standards (conventional commits, etc.).

## Pull request process
What a PR should include, who reviews, how to get it merged.

## Code style
Linting and formatting tools in use. How to run them. Whether they're enforced in CI.

## Testing expectations
What level of test coverage is expected for changes. What types of tests to write.

## Project structure
Brief guide to where things live in the codebase so contributors know where to make changes.
```

**Guidance:**
- Be prescriptive, not aspirational — document what the team actually does
- Include real examples of good commit messages and PR descriptions
- If there's a CI pipeline that enforces standards, mention it — contributors will hit it anyway

---

## Deployment (`docs/deployment.md`)

```markdown
# Deployment

## Environments
| Environment | URL | Branch | Auto-deploy? |
|---|---|---|---|
| Production | ... | main | ... |
| Staging | ... | develop | ... |
| Preview | ... | PR branches | ... |

## How to deploy
Step-by-step for each environment. Include manual steps if any exist.

## Configuration per environment
What differs between environments: env vars, feature flags, resource limits.

## Rollback
How to revert a bad deployment. Include the exact commands.

## Database migrations
How migrations are run during deployment. What happens if a migration fails.

## Monitoring after deploy
What to check after a deployment to confirm it succeeded. Key dashboards, logs, health endpoints.
```

**Guidance:**
- Rollback procedures are critical — write them before you need them
- Include who has deploy access and any approval requirements
- Migration strategy should cover both forward and backward compatibility

---

## Data Model (`docs/data-model.md`)

```markdown
# Data Model

## Overview
What database(s) the project uses and the general approach (relational, document, etc.).

## Entity relationship diagram
Mermaid ER diagram showing tables/collections and their relationships.

## Entities
For each major entity:
- **Table/collection name**
- **Purpose** — what it represents
- **Key fields** — name, type, constraints, description (only non-obvious fields)
- **Relationships** — foreign keys, references
- **Indexes** — which ones exist and why

## Migrations
How schema changes are managed. What tool is used. How to create and run migrations.

## Seed data
Whether seed data exists, what it contains, how to load it.

## Data lifecycle
How data is created, updated, archived, and deleted. Any retention policies.
```

**Guidance:**
- The ER diagram is the most valuable part — start there
- Don't list every field — focus on the ones that aren't self-explanatory
- Document why indexes exist, not just that they do
- If using Drizzle/Prisma/etc., link to the schema file as the source of truth

---

## API Reference (`docs/api.md`)

```markdown
# API Reference

## Base URL
Production and development base URLs.

## Authentication
How to authenticate. Token format, header name, how to obtain credentials.

## Common patterns
- Request/response format (JSON, etc.)
- Pagination approach
- Error response structure
- Rate limiting

## Endpoints
Group by resource or domain. For each endpoint:
- **Method and path** — `GET /api/users/:id`
- **Description** — what it does
- **Parameters** — path params, query params, request body
- **Response** — status codes and response shape
- **Example** — curl or fetch example

## Webhooks
If the project sends webhooks: events, payload format, delivery guarantees, retry policy.

## SDKs and clients
If typed clients or SDKs exist, where to find them and how to use them.
```

**Guidance:**
- If an OpenAPI spec exists, reference it as the source of truth and only document patterns/auth here
- Group endpoints by the resource they operate on, not by HTTP method
- Examples should be copy-pasteable — use real-looking data, not `{id}`
- Error response examples are as important as success examples

---

## Configuration (`docs/configuration.md`)

```markdown
# Configuration

## Environment variables
| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| ... | ... | ... | ... |

## Config files
List of config files, what they control, and which are committed vs. gitignored.

## Feature flags
How feature flags are managed, where they're defined, how to toggle them.

## Secrets management
How secrets are stored and accessed in each environment. What's in `.env.example` vs. what's in a vault.

## Environment setup
How to get a working `.env` file for local development. Who to ask for credentials.
```

**Guidance:**
- The env var table is the core of this doc — be thorough
- `.env.example` should exist and be referenced — this doc supplements it, not replaces it
- Never document actual secret values, only where to find them

---

## Operations (`docs/operations.md`)

```markdown
# Operations

## Health checks
Endpoints or commands to verify the service is healthy.

## Monitoring
What's monitored, where dashboards live, key metrics to watch.

## Alerts
What alerts exist, what they mean, and what to do when they fire.

## Logging
Where logs go, how to access them, how to search for specific events.

## Runbooks
For each common operational scenario:
- **Symptom** — what you see
- **Diagnosis** — how to investigate
- **Resolution** — step-by-step fix
- **Prevention** — how to avoid it next time

## Incident response
Who to contact, escalation path, how to communicate status.

## Scaling
How to scale the service up/down. Auto-scaling policies if they exist.
```

**Guidance:**
- Runbooks should be written for someone woken up at 3am — clear, step-by-step, no ambiguity
- Link to actual dashboard URLs, not just "check the dashboard"
- Incident response should include contact methods, not just names

---

## Decision Records (`docs/decisions/NNNN-title.md`)

```markdown
# NNNN: {Decision Title}

- **Status:** proposed | accepted | deprecated | superseded by [NNNN](NNNN-title.md)
- **Date:** YYYY-MM-DD
- **Deciders:** who was involved

## Context
What prompted this decision. What problem needed solving.

## Decision
What was decided. Be specific and concrete.

## Alternatives considered
For each alternative:
- What it was
- Pros
- Cons
- Why it was rejected

## Consequences
What changes as a result of this decision. Include both positive and negative impacts.
```

**Guidance:**
- Decision records are immutable — if a decision is reversed, create a new record that supersedes the old one
- "Context" is the most important section — future readers need to understand the constraints that led to the decision
- Keep it short — one page per decision, not a thesis
- Number sequentially: 0001, 0002, etc.
