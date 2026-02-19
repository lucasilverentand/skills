# Config

Shared configuration: environment variables, feature flags, and constants.

## Responsibilities

- Manage shared environment variable definitions
- Maintain feature flags and constants
- Provide typed config accessors with Zod validation
- Ensure environment variables are documented with required/optional status
- Coordinate config differences between development, staging, and production

## Tools

- `tools/env-check.ts` — validate that all required environment variables are set for a given target
- `tools/flag-list.ts` — list all feature flags with their current default values and descriptions
- `tools/config-diff.ts` — compare environment configs across deployment targets and highlight mismatches
