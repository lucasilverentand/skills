# Lockfile Policy

## Principle

The lockfile is the single source of truth for "what dependency versions we've vetted." It must never be regenerated silently, updated accidentally, or skipped.

## Rules

| Scenario | Command | Notes |
|---|---|---|
| Fresh clone / CI / agent install | `bun install --frozen-lockfile` | Fails if lockfile is out of date — this is correct |
| Adding a reviewed package | `bun add <package>` | Updates `bun.lockb` |
| Removing a package | `bun remove <package>` | Updates `bun.lockb` |
| Updating a specific package | `bun update <package>` | Updates `bun.lockb` |
| Updating all packages | `bun update` | Updates `bun.lockb` — do this deliberately, not accidentally |
| First install of untrusted package | `bun add <package> --ignore-scripts` | Skips postinstall; audit before running scripts |

**Bun-specific notes:**
- `bun.lockb` is a binary file — it cannot be reviewed as a text diff
- Use `bun install --frozen-lockfile` as the default in all automated contexts
- If `bun.lockb` is missing, do not run `bun install` to generate it silently — flag it

## CI enforcement

Every CI workflow that installs dependencies must use the frozen variant:

```yaml
- run: bun install --frozen-lockfile
```

This catches lockfile drift immediately. If the lockfile is stale (someone changed `package.json` without updating the lockfile), CI fails — and that's correct.

## What to do when the lockfile is stale

1. Do NOT regenerate it silently
2. Run the install without `--frozen-lockfile` locally: `bun install`
3. Review the diff: what transitive dependencies changed?
4. If the changes are expected, commit the updated lockfile
5. If unexpected packages changed, investigate before committing

## What to do when the lockfile is missing

1. Do NOT generate it automatically
2. Flag it to the user — a missing lockfile means builds are not reproducible
3. Once the user confirms, run `bun install` to generate it
4. Review the generated lockfile
5. Commit it immediately

## Monorepo considerations

In Bun workspaces, a single `bun.lockb` at the root covers all packages. The same rules apply:
- `bun install --frozen-lockfile` at the root
- Adding packages to a specific workspace: `bun add <pkg> --cwd packages/<name>`
