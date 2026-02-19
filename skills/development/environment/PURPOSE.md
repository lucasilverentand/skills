# Environment

Bootstrap local dev setups, configure dev containers, and manage tool versions.

## Responsibilities

- Bootstrap local development environments
- Configure dev containers
- Manage tool version requirements
- Validate environment prerequisites before setup
- Synchronize environment configs across team members

## Tools

- `tools/env-check.ts` — verify all required tools and versions are installed locally
- `tools/devcontainer-gen.ts` — generate a devcontainer.json from project dependencies
- `tools/env-sync.ts` — diff local environment config against the repo baseline and report drift
- `tools/setup-scaffold.ts` — generate a project bootstrap script from detected toolchain requirements
