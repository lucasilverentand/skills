---
name: environment
description: Bootstraps local development environments, generates devcontainer configs, checks tool versions, and detects environment drift. Use when setting up a new machine, onboarding a team member, diagnosing "works on my machine" issues, or ensuring consistent tooling across the team. Handles Bun version management, devcontainer generation, and environment synchronization.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Environment

## Decision Tree

- What is the environment task?
  - **Setting up a fresh environment** → see "Bootstrap workflow" below
  - **Diagnosing environment drift or mismatch** → see "Drift detection workflow" below
  - **Generating a devcontainer config** → see "Devcontainer workflow" below
  - **Verifying prerequisites before running something** → run `tools/env-check.ts` and fix any failures before proceeding

## Bootstrap workflow

1. Read the project root for toolchain signals:
   - `package.json` or `bun.lockb` → Bun project; check `engines.bun` for required version
   - `bun.workspace` or `workspaces` in `package.json` → monorepo; bootstrap all packages
   - `docker-compose.yml` or `compose.yaml` → services need to be started
   - `.tool-versions` or `.nvmrc` → version pins to honor
2. Run `tools/env-check.ts` — review any missing or out-of-date tools
3. Run `tools/setup-scaffold.ts` — generates a bootstrap script for the detected toolchain
4. Present the generated script to the user for review before executing
5. After setup, run `tools/env-check.ts` again to confirm all requirements pass

## Drift detection workflow

1. Run `tools/env-sync.ts` — diffs local environment against the repo baseline
2. Review the drift report:
   - **Version mismatch** → note the required version and how to update (e.g., `bun upgrade`, `brew upgrade`)
   - **Missing tool** → provide the install command for that tool
   - **Extra/unexpected tool version** → flag as informational, not blocking
3. Do not silently auto-update tools — present the diff and let the user confirm changes
4. After user resolves issues, re-run `tools/env-sync.ts` to verify clean state

## Devcontainer workflow

1. Read `package.json`, `bun.lockb`, and any `docker-compose.yml` to understand service topology
2. Run `tools/devcontainer-gen.ts` — generates `.devcontainer/devcontainer.json`
3. Review the output for:
   - Correct base image (prefer `mcr.microsoft.com/devcontainers/typescript-node` with Bun layer, or a Bun-specific image)
   - Port forwarding for all services listed in compose or known dev ports
   - Extensions matching the project stack (Biome, TypeScript, etc.)
4. Write the file only after confirming the config looks correct
5. Note that the devcontainer does not replace local setup — it's an alternative path

## Key references

| File | What it covers |
|---|---|
| `tools/env-check.ts` | Verify all required tools and versions are installed |
| `tools/devcontainer-gen.ts` | Generate devcontainer.json from project dependencies |
| `tools/env-sync.ts` | Diff local environment config against repo baseline |
| `tools/setup-scaffold.ts` | Generate a bootstrap script from detected toolchain |
