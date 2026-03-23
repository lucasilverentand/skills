---
name: supply-chain
description: Protects against dependency supply chain attacks — reviews packages before adding, verifies lockfile integrity, pins GitHub Actions to SHA, audits postinstall scripts, and pins Docker base images to digests. These rules apply unconditionally, including in bypassPermissions and dontAsk modes. Use when adding a new dependency, reviewing a Dependabot/Renovate PR, setting up CI, auditing existing dependencies, or responding to a suspected compromised package.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Supply Chain Security

> **These rules are unconditional.** In `bypassPermissions` mode, `bun install` and `bun add` execute without user approval. A malicious package's `postinstall` script runs with full shell access — it can exfiltrate data, install backdoors, or modify source files. These rules are the only line of defense.

## Decision Tree

- What is the task?
  - **Adding a new dependency** → follow "Dependency review" below
  - **Running `bun install` / updating lockfile** → follow "Lockfile integrity" below
  - **Reviewing a Dependabot/Renovate PR** → follow "Update review" below
  - **Auditing existing dependencies for vulnerabilities** → run `tools/dependency-audit.ts`
  - **Checking for typosquatting** → run `tools/typosquat-check.ts <package-name>`
  - **Pinning GitHub Actions to SHA** → follow "Action pinning" below
  - **Pinning Docker base images** → follow "Image pinning" below
  - **Responding to a suspected compromised package** → follow "Compromised dependency response" below

## Dependency review

**Before running `bun add <package>`**, always review the package:

1. Run `tools/dep-review.ts <package-name>` — checks:
   - npm download count and trend (low/declining downloads = risk)
   - Package age (new packages with few downloads are higher risk)
   - Number of maintainers (single maintainer = higher bus factor risk)
   - Known CVEs in current version
   - Typosquatting similarity to popular packages
   - License compatibility
   - Whether it has `postinstall` scripts

2. Ask: **can this be done without a dependency?**
   - Small utility functions (< 50 lines) → write it yourself
   - Standard library equivalents exist → use them
   - The package pulls in a large transitive dependency tree → consider alternatives

3. Check the package source:
   - Repository exists and is actively maintained
   - Has a meaningful test suite
   - Publishes provenance attestations (verify with `npm audit signatures`)

4. If the package has `postinstall` scripts:
   - Read the script before installing
   - Install with `bun install --ignore-scripts` first
   - Audit `node_modules/<package>/` for anything suspicious
   - Then run `bun rebuild <package>` if the scripts are safe

5. Only after review: `bun add <package>`

## Lockfile integrity

**Hard rule:** Never run `bun install` without `--frozen-lockfile` unless you are deliberately adding, removing, or updating a dependency.

| Scenario | Command |
|---|---|
| Routine install (CI, agent, fresh clone) | `bun install --frozen-lockfile` |
| Adding a new (reviewed) package | `bun add <package>` — updates lockfile |
| Removing a package | `bun remove <package>` — updates lockfile |
| Updating a specific package | `bun update <package>` — updates lockfile |
| Lockfile missing or corrupt | **Stop.** Flag to the user. Do not regenerate silently. |

Why this matters: `bun install` without `--frozen-lockfile` can silently update transitive dependencies to newer versions that may be compromised. The lockfile is the single source of truth for "what we've vetted."

See `references/lockfile-policy.md` for rules across Bun, npm, and pnpm.

## Post-install script safety

`postinstall` scripts run arbitrary code during `bun install`. This is the primary vector for supply chain attacks.

**Defense layers:**

1. **No secrets on disk** — `postinstall` can't read `.env` because it contains no secrets (see `security/agent-safety`)
2. **Frozen lockfile** — prevents unknown versions from being installed
3. **`--ignore-scripts`** — skips `postinstall` entirely for first installs of unfamiliar packages
4. **Audit before running** — read `node_modules/<package>/package.json` scripts section

**Runtime risk:** Even with no secrets on disk, a compromised dependency loaded at runtime CAN access `process.env` (which has Doppler-injected secrets). This is harder to prevent — the mitigations are: minimal dependencies, regular audits, and monitoring for unexpected network calls.

## Action pinning

Every GitHub Actions `uses:` reference must pin to a **full commit SHA**, not a tag or branch:

```yaml
# WRONG — tags can be moved to point to malicious code
- uses: actions/checkout@v4
- uses: oven-sh/setup-bun@v2

# RIGHT — SHA is immutable
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
- uses: oven-sh/setup-bun@4bc047ad259df6fc24a6c9b0f9a0cb08cf17fbe0 # v2.0.1
```

**Rules:**
- Always include the version as a comment after the SHA for readability
- Never use `@latest` or `@main` — these are mutable references
- When updating an action version, verify the SHA matches the tag on the official repository
- Run `tools/action-pin.ts` to scan workflow files and replace tags with SHAs
- Run `tools/action-pin.ts --check` in CI to enforce pinning

## Image pinning

Docker base images must pin to a specific digest:

```dockerfile
# WRONG — tag can be overwritten
FROM oven/bun:1.1-alpine

# RIGHT — digest is immutable
FROM oven/bun:1.1-alpine@sha256:a1b2c3d4e5f6...
```

**How to get the digest:**
```bash
docker pull oven/bun:1.1-alpine
docker inspect --format='{{index .RepoDigests 0}}' oven/bun:1.1-alpine
```

Include the tag for readability, and the digest for immutability.

## Update review

When reviewing a Dependabot or Renovate PR:

1. **Read the changelog** — look for breaking changes, new behaviors, removed features
2. **Check if it's a major version bump** — major bumps require manual verification of migration steps
3. **Diff the lockfile** — verify only the expected package and its transitive deps changed
4. **Check for new `postinstall` scripts** — compare `package.json` scripts section before and after
5. **Run `tools/dependency-audit.ts`** — verify no new CVEs in the updated version
6. **Run the test suite** — if tests pass, the update is likely safe
7. **Check provenance** — verify the new version has valid provenance attestations

## Compromised dependency response

If a dependency is suspected or confirmed compromised:

1. **Stop using it immediately** — remove or pin to the last known-good version
2. **Audit what it had access to:**
   - Filesystem: could it have read/modified source files?
   - Environment: was the dev server running with secrets in `process.env`?
   - Network: could it have exfiltrated data?
3. **Rotate all secrets** that were accessible during its install or runtime
4. **Check for persistence:**
   - Inspect `node_modules/` for unexpected files or modifications
   - Check for new entries in `package.json` scripts
   - Look for new files outside `node_modules/` that weren't there before
5. **Notify the team** — if this is a shared project, others may be affected
6. **Report the package** — report to npm security (`npm report <package>`) and the package's issue tracker

## Key references

| File | What it covers |
|---|---|
| `references/lockfile-policy.md` | Lockfile integrity rules for Bun, npm, and pnpm |
| `tools/dep-review.ts` | Pre-addition dependency analysis (downloads, CVEs, typosquat) |
| `tools/typosquat-check.ts` | Check package names against typosquatting patterns |
| `tools/action-pin.ts` | Pin GitHub Actions to SHA, verify existing pins |
| `tools/lockfile-verify.ts` | Verify lockfile exists, is current, and matches package.json |
| `tools/dependency-audit.ts` | Scan dependencies for known CVEs (also in `security/audit`) |
