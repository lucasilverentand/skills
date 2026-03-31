# Interview Guides

Question sets for each doc type. Use AskUserQuestion to walk through these during guided creation. Ask 3-5 questions at a time — don't dump the full list at once. Skip questions where the answer is already known from the discovery phase or prior interviews.

---

## Project Overview

### Round 1 — Core identity
1. In one sentence, what does this project do?
2. Who uses it? (developers on the team, end users, other services, open source community)
3. Why does it exist — what problem was it created to solve?

### Round 2 — Scope and boundaries
4. What are the 3-5 most important things this project should do well?
5. What does this project explicitly NOT do? (things people might expect but shouldn't)
6. Are there related projects or services it depends on or works alongside?

### Round 3 — Current state
7. What's the current status — prototype, active development, production, maintenance?
8. What's actively being worked on right now?
9. Where do issues and feature requests get tracked?

---

## Architecture

### Round 1 — High-level shape
1. How would you describe the system to a new team member in 2-3 sentences?
2. What are the major components or services? (Just names and one-liners for now)
3. Is this a monolith, monorepo with multiple services, microservices, or something else?

### Round 2 — Component deep-dive
For each component identified:
4. What technology does it use? (language, framework, runtime)
5. How does it communicate with other components? (HTTP, events, shared database, message queue)
6. Where does it run? (Cloudflare Workers, Railway, Kubernetes, Vercel, local only)

### Round 3 — Data and decisions
7. How does data flow through the system for the most common operation? Walk me through it.
8. What are the non-obvious design decisions — things that might surprise someone reading the code?
9. Are there any external dependencies or third-party services the system relies on?
10. What are the known constraints or bottlenecks?

---

## Getting Started

### Round 1 — Prerequisites
1. What tools need to be installed? (runtime, database, CLI tools, etc.)
2. Are there specific version requirements that matter?
3. Is there anything non-standard about the setup? (custom certs, VPN, specific OS)

### Round 2 — Setup steps
4. Walk me through clone-to-running — what does a developer do after `git clone`?
5. Are there environment variables or config files needed? Where do they come from?
6. Does the project need a database or other services running locally? How do you start them?

### Round 3 — Verification and gotchas
7. How does a developer know the setup worked? What should they see?
8. What are the most common setup problems people hit?
9. What are the day-to-day commands — dev server, tests, lint, build?

---

## Contributing

### Round 1 — Workflow
1. How does someone pick up a task? (issues board, assignments, self-serve)
2. What's the branching strategy? (feature branches off main, develop branch, etc.)
3. What's the commit message convention?

### Round 2 — Review and merge
4. What does a good PR look like here? (size, description, tests)
5. Who reviews PRs? Is there a required number of approvals?
6. Is there a CI pipeline? What does it check?

### Round 3 — Standards
7. What testing is expected for new code? (unit tests, integration tests, E2E)
8. Are there code style rules enforced by tooling?
9. Any areas of the codebase that are tricky or need extra care?

---

## Deployment

### Round 1 — Environments
1. What environments exist? (production, staging, preview, development)
2. How are deployments triggered? (git push, CI pipeline, manual, CLI command)
3. Is there auto-deploy on merge to main?

### Round 2 — Process
4. Walk me through deploying to production — what happens step by step?
5. Are there any manual steps, approvals, or gates?
6. How are database migrations handled during deployment?

### Round 3 — Recovery
7. How do you roll back a bad deployment?
8. What do you check after deploying to confirm it worked?
9. Has there been a deployment failure before? What happened and how was it resolved?

---

## Data Model

### Round 1 — Overview
1. What database(s) does the project use?
2. What are the main entities? (users, orders, posts — the core domain objects)
3. Is there an ORM or query builder? (Drizzle, Prisma, raw SQL, etc.)

### Round 2 — Entity details
For each major entity:
4. What does it represent and what are its key fields?
5. How does it relate to other entities?
6. Are there any non-obvious fields or constraints worth calling out?

### Round 3 — Operations
7. How are schema changes managed? (migration tool, manual SQL, ORM generate)
8. Is there seed data for local development?
9. Are there any data lifecycle rules? (soft deletes, archival, retention policies)

---

## API Reference

### Round 1 — Basics
1. What kind of API is it? (REST, GraphQL, RPC, WebSocket)
2. How is authentication handled? (API key, JWT, session, OAuth)
3. Is there an existing OpenAPI spec or API docs tool?

### Round 2 — Structure
4. What are the main resource groups? (users, products, billing — the top-level groupings)
5. What's the standard response format? (envelope with data/error, flat JSON, etc.)
6. How does pagination work?

### Round 3 — Details
7. What are the most important endpoints — the ones a new developer should understand first?
8. Are there any non-standard patterns or gotchas? (eventual consistency, async operations, etc.)
9. Are there webhooks, events, or callbacks the API sends?

---

## Configuration

### Round 1 — Environment variables
1. What are the required environment variables to run the project?
2. For each: what does it control, and where does the value come from?
3. Is there a `.env.example` file? Is it up to date?

### Round 2 — Config files
4. What config files does the project use? (wrangler.toml, biome.json, tsconfig, etc.)
5. Which are committed to the repo and which are gitignored?
6. Are there config differences between environments?

### Round 3 — Secrets and flags
7. How are secrets managed? (environment variables, vault, encrypted files)
8. Are there feature flags? How are they toggled?
9. For local development, who do you ask for credentials?

---

## Operations

### Round 1 — Observability
1. What monitoring is in place? Where do you look when something seems wrong?
2. Where do logs go? How do you access them?
3. Are there health check endpoints?

### Round 2 — Alerting
4. What alerts exist? What triggers them?
5. Who gets paged when something goes wrong?
6. What's the escalation path?

### Round 3 — Incident patterns
7. What are the most common operational issues? (things that have happened before)
8. For each: how did you diagnose it, and how did you fix it?
9. How does the service scale? Is there auto-scaling?

---

## Decision Records

Decision records are created one at a time as needed. The interview is per-decision, not per-project.

### Per decision
1. What decision needs to be recorded?
2. What problem or need prompted this decision?
3. What options were considered?
4. For each option: what were the pros and cons?
5. Why was the chosen option selected over the others?
6. What are the consequences — what changes as a result? Any downsides accepted?
7. Who was involved in making this decision?
