---
name: technologies
description: Evaluates technologies and frameworks, assesses migration feasibility, audits dependency health, and checks license compliance. Use when the user needs to choose a library or framework, evaluate whether to migrate from one technology to another, check the health of dependencies, or audit licenses before shipping.
allowed-tools: Read Glob Grep Bash WebFetch WebSearch
context: fork
agent: Explore
---

# Technologies

## Decision Tree

- What is the research goal?
  - **Evaluate a new technology or framework for adoption** → follow "Technology Evaluation" below
  - **Assess whether migrating from one technology to another is feasible** → follow "Migration Assessment" below
  - **Check the health and maintenance status of dependencies** → follow "Dependency Health Audit" below
  - **Audit licenses for compliance** → follow "License Audit" below
  - **Track what's changed in a technology recently** → follow "Technology Update Tracking" below

## Technology Evaluation

1. Define the selection criteria before researching — for each requirement, note if it is a must-have or nice-to-have:
   - Functional fit (does it solve the problem?)
   - Performance characteristics
   - Bundle size or runtime overhead
   - TypeScript support quality
   - Integration with existing stack (Bun, Hono, Drizzle, Cloudflare Workers, etc.)
2. For npm packages: run `tools/npm-health.ts <package-name>` to check download trends, issues, last publish, and bus factor
3. Assess community health:
   - Stars and contributor count (bus factor risk if < 3 active maintainers)
   - Issue response time and PR merge cadence
   - Clear documentation and up-to-date examples
4. Check ecosystem maturity:
   - How long has it been around? (> 2 years = more stable)
   - Is it backed by a company or a solo maintainer?
   - Are there known production users?
5. Run `tools/license-audit.ts` to confirm license compatibility
6. Produce an evaluation scorecard: criteria × candidates matrix, recommendation with rationale

## Migration Assessment

1. Define the migration clearly:
   - Source technology (what is being replaced)
   - Target technology (what it is being replaced with)
   - Scope: full migration or coexistence period?
2. Run `tools/migration-estimator.ts <source-package> <target-package>` to scan usage in the codebase and estimate effort
3. Identify migration categories:
   - **Direct replacements** — same API, swap import (low effort)
   - **API mapping required** — different API, mechanical translation (medium effort)
   - **Conceptual mismatch** — different patterns entirely, requires rewrite (high effort)
4. Assess risk:
   - Are there tests covering the code being migrated?
   - Are there edge cases the source library handles that the target may not?
   - Are there runtime environment differences (e.g., browser vs. Node vs. Workers)?
5. Evaluate incremental migration viability — can source and target coexist during rollout?
6. Produce a migration plan: scope summary, effort estimate, risk classification, and phased approach

## Dependency Health Audit

1. Run `tools/npm-health.ts` for each dependency of concern (or all direct dependencies)
2. For each package, assess:
   - **Download trend** — declining downloads may signal ecosystem abandonment
   - **Last publish date** — no releases in > 1 year warrants investigation
   - **Open issues and PRs** — large backlogs with slow response = maintenance risk
   - **Bus factor** — single-maintainer packages are high risk
   - **Known CVEs** — check for security advisories
3. Categorize each dependency:
   - **Healthy** — active, maintained, no concerns
   - **Watch** — slowing down but still maintained; monitor
   - **Replace** — abandoned, security issues, or better alternatives exist
4. For "Replace" items, identify candidates and run a lightweight technology evaluation
5. Produce a health audit report: dependency list with status, and a prioritized replacement plan

## License Audit

1. Run `tools/license-audit.ts` to collect licenses of all direct and transitive dependencies
2. Classify each license by permissiveness:
   - **Permissive** (MIT, Apache-2.0, BSD, ISC) → safe for commercial use
   - **Weak copyleft** (LGPL, MPL) → requires disclosure if modified; generally OK for use as library
   - **Strong copyleft** (GPL, AGPL) → may require open-sourcing your code; requires legal review
   - **Unknown / no license** → do not ship; treat as "all rights reserved"
3. Flag any license that conflicts with the project's distribution model:
   - Closed-source commercial product → GPL/AGPL packages require immediate replacement
   - SaaS product → AGPL packages require careful legal review
4. Check for dual-licensed packages — some have commercial license requirements
5. Produce a compliance report: full dependency license list, flagged items, recommended actions

## Technology Update Tracking

1. Identify the technologies to track (frameworks, runtimes, key libraries)
2. For each, check:
   - Latest stable version vs. version in use
   - Breaking changes in releases since the current version (read changelogs)
   - Deprecations that will affect the codebase
   - Security patches that apply to the current version
3. Search for migration guides for major version jumps
4. Assess urgency:
   - **Security patch available** → upgrade is high priority
   - **Major version with breaking changes** → plan migration; run `tools/migration-estimator.ts`
   - **Minor/patch with improvements** → schedule routine upgrade
5. Produce an update summary: version gaps, notable changes, recommended upgrade order

## Key references

| File | What it covers |
|---|---|
| `tools/npm-health.ts` | Check download trends, open issues, last publish, and bus factor for npm packages |
| `tools/migration-estimator.ts` | Scan codebase for library usage and estimate migration effort to a replacement |
| `tools/license-audit.ts` | Collect and summarize licenses of all transitive dependencies for compliance |
