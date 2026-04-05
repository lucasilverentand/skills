---
name: dependencies
description: Dependency philosophy — when to add a package, when to write it yourself, and the approved stack for each platform. Use when deciding whether to install a dependency, choosing between package alternatives, auditing existing dependencies, or setting up a new project's package.json.
---

# Dependency Philosophy

## Decision Tree

- What are you doing?
  - **Deciding whether to add a dependency** → see "Should I Add This Dep?" below
  - **Choosing between alternatives** → check "Approved Stack" in `references/approved-stack.md`, then apply the decision framework
  - **Setting up a new project** → start with the approved stack, add nothing else until you need it
  - **Auditing existing dependencies** → see "Auditing" below
  - **Removing or replacing a dependency** → see "Replacements" below

## Should I Add This Dep?

Ask these questions in order:

1. **Is it < 50 lines to write yourself?** → Write it. A small utility function beats a dependency with its own dependency tree.
2. **Is it security-critical?** (crypto, auth, token validation) → Use a well-maintained dep. Don't roll your own auth or crypto.
3. **Is it on the approved stack?** → Use it. These have been vetted for quality, maintenance, and fit.
4. **Does it have a large dependency tree?** → Avoid it. Prefer packages with zero or few transitive deps.
5. **Is it a utility collection?** (lodash, ramda, underscore) → Don't install the collection. Write the 2-3 functions you need.

### Per-Platform Rules

| Platform | Philosophy |
|---|---|
| **TypeScript** | Minimal, high-quality deps. Use the approved stack. Write small utilities yourself. |
| **Swift** | Zero third-party dependencies. Swift's stdlib and Apple frameworks cover nearly everything. Only exception: system-level libraries that Apple doesn't provide. |
| **Rust** | Crates are normal and expected. The ecosystem is built around composition. Prefer widely-used, well-maintained crates. |
| **React Native** | Same as TypeScript, plus: prefer packages with New Architecture support. Avoid packages that haven't been updated in 6+ months. |

## Anti-Patterns

Packages to never use, and what to use instead:

| Don't use | Use instead | Why |
|---|---|---|
| `lodash` / `underscore` | Write the function | You need 3 functions, not 300. Modern JS has `.map`, `.filter`, `Object.entries`, `structuredClone`. |
| `moment` / `dayjs` | `Intl.DateTimeFormat`, `date-fns` | `Intl` is built-in. If you need more, `date-fns` is tree-shakeable. |
| `express` | Hono | Express is legacy. Hono is faster, smaller, and runs on the edge. |
| `prisma` | Drizzle | Drizzle is lighter, faster, SQL-first, and works with D1. |
| `next` | Astro (content), Vite + React (SPA) | No Vercel lock-in, ships less JS, simpler mental model. |
| `eslint` + `prettier` | Biome | One tool instead of two, faster, less config. |
| `npm` / `yarn` / `pnpm` | Bun | Bun is the runtime and package manager. |
| `axios` | `fetch` | `fetch` is built-in everywhere. No need for a wrapper. |
| `dotenv` | Doppler + `@scope/config` | Secrets belong in a secrets manager, not `.env` files. See `infrastructure/secrets`. |
| `uuid` | `crypto.randomUUID()` | Built into every modern runtime. |

## Auditing

When reviewing an existing project's dependencies:

1. Check for packages on the "don't use" list above → replace them
2. Check for packages that duplicate built-in APIs (`node-fetch`, `uuid`, `path-to-regexp` when using Hono) → remove them
3. Check for unmaintained packages (no commits in 12+ months, open security advisories) → find alternatives or inline
4. Check for packages used in only one place for a simple operation → inline the logic
5. Run `bun pm ls` to check the full dependency tree for unexpected transitive deps

## Replacements

When replacing a dependency:

1. Identify all import sites (`grep -r "from 'package-name'"`)
2. Write or adopt the replacement
3. Update all import sites in one commit
4. Remove the old package: `bun remove <package>`
5. Run tests to confirm nothing broke

## Key References

| File | What it covers |
|---|---|
| `references/approved-stack.md` | Full approved package list with rationale and alternatives |
