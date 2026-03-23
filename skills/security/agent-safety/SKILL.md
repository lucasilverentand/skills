---
name: agent-safety
description: Defines security boundaries for automated agents — enforces the no-secrets-on-disk architecture, prevents secret exposure through commands or tool usage, and ensures secrets reach processes only via runtime injection (Doppler, platform stores, shell environment). These rules apply unconditionally, including in bypassPermissions and dontAsk modes. Use when an agent works with environments that contain secrets, starts dev servers, runs builds, debugs issues near sensitive configuration, or bootstraps a new environment.
allowed-tools: Read Grep Glob Bash
---

# Agent Safety

> **These rules are unconditional.** They apply in every permission mode — including `bypassPermissions` and `dontAsk`. Secret exposure cannot be undone. There is no sandbox; these rules are the only defense.

## Decision Tree

- What is the agent doing?
  - **Starting a dev server or process that needs secrets** → see "Safe process launch" below
  - **Bootstrapping a new environment** → see "Safe bootstrap" below
  - **Debugging an issue that might involve env vars or config** → see "Safe debugging" below
  - **Running tests** → see "Safe test execution" below
  - **Installing dependencies** → see `security/supply-chain`
  - **Inspecting what environment variables exist** → see "Safe env inspection" below
  - **Deploying or setting production secrets** → see "Safe secret deployment" below
  - **A secret was accidentally exposed** → see "Accidental exposure response" below

## Secret architecture — no secrets on disk

**Secret values never live in files inside the project directory.** This is the architecture, not a convention. The only way secrets reach a running process is through runtime injection:

| How secrets reach the process | When |
|---|---|
| **Doppler** (`doppler run -- <command>`) | Local development — injects secrets as env vars at process start |
| **Platform secret stores** (Cloudflare secrets, Railway variables, K8s Secrets) | Staging and production |
| **User's shell environment** (exported in `.zshrc`/`.bashrc`) | Fallback for simple setups |

What IS on disk (safe to read):
- `.env.example` / `.dev.vars.example` — placeholder values, committed to git, documents what vars exist
- `.env` / `.dev.vars` — **non-secret config only**: URLs, ports, feature flags, `NODE_ENV`

What is NOT on disk (does not exist as files):
- Database passwords, API keys, JWT signing secrets, OAuth client secrets, encryption keys

Because `.env` contains no secrets, it is safe to read. The "forbidden file" problem is eliminated by architecture.

See `references/secret-architecture.md` for the full architecture, migration guide, and platform-specific details.

## Forbidden commands

Even though secret files don't exist on disk, secrets ARE present in the process environment at runtime (injected by Doppler or the shell). These commands would expose them:

| Forbidden | Why | Safe alternative |
|---|---|---|
| `printenv`, `env`, `set` | Dumps all env vars including injected secrets | `test -n "$VAR_NAME" && echo "set" \|\| echo "unset"` |
| `echo $SECRET_VAR`, `printf "$SECRET"` | Prints the secret value to stdout | Check if set without printing the value |
| `node -e "console.log(process.env.X)"` | Same as echo — prints the value | N/A — never print env var values |
| `python -c "import os; print(os.environ)"` | Same as printenv | N/A |
| Writing secrets to files: `echo $KEY > .env` | Creates a secret file on disk — violates the architecture | Secrets stay in Doppler/platform stores only |
| `doppler secrets` (without `--only-names`) | Prints all secret values | `doppler secrets --only-names` |
| `wrangler secret list` with `--show-values` | Exposes deployed secret values | `wrangler secret list` (names only, safe) |
| `cat`/`Read` on files in `~/.doppler/` | Exposes Doppler auth tokens | Never access Doppler internal files |
| `history` after a user typed a secret | Could reveal secrets from shell history | N/A — avoid this entirely |

See `references/safe-commands.md` for the complete allowlist/denylist.

## Safe process launch

The agent starts processes; secrets flow through Doppler injection — the agent never sees them.

```bash
# SAFE: Doppler injects secrets as env vars — agent never sees values
doppler run -- bun run dev
doppler run -- bunx wrangler dev

# SAFE: Using mise (which loads Doppler via _.source)
mise run dev

# SAFE: Process inherits secrets from user's shell environment
bun run dev

# SAFE: Check if the process started successfully
curl -s http://localhost:3000/health
```

**Critical:** Do not capture or parse stdout/stderr looking for secret values that a process might log during startup. If a process logs a secret, that is a bug in the application — flag it, don't exploit it.

## Safe env inspection

```bash
# SAFE: Read example files for variable names
cat .env.example
cat .dev.vars.example

# SAFE: Read .env/.dev.vars (contains only non-secret config)
cat .env
cat .dev.vars

# SAFE: Check if a specific secret is present (without printing its value)
test -n "$DATABASE_URL" && echo "set" || echo "unset"

# SAFE: List secret names in Doppler
doppler secrets --only-names

# SAFE: Check which workers have complete config
tools/devvars-check.ts

# FORBIDDEN: Never do these
printenv
env
echo $DATABASE_URL
doppler secrets
```

## Safe bootstrap

1. Copy example files and fill in non-secret config:
   ```bash
   cp .env.example .env
   # Agent can write non-secret values (URLs, ports, flags) to .env
   ```
2. Set up Doppler — the user authenticates interactively:
   ```bash
   doppler setup
   ```
3. Verify secrets are available (names only):
   ```bash
   doppler secrets --only-names
   ```
4. Start dev with secrets injected:
   ```bash
   doppler run -- bun run dev
   ```

**The agent NEVER writes secret values to any file.** If the user needs to provide a secret, direct them to set it in Doppler (`doppler secrets set KEY`) or export it in their shell.

## Safe debugging

When debugging issues that might involve configuration or secrets:

1. Read `.env.example` or `.dev.vars.example` to understand what variables are expected
2. Read `.env` or `.dev.vars` to check non-secret config values (URLs, ports)
3. Check if a specific secret is available: `test -n "$VAR_NAME" && echo "set" || echo "unset"`
4. Check Doppler for expected secrets: `doppler secrets --only-names`
5. Run the application's health check to verify connectivity: `curl -s http://localhost:3000/health`
6. Check application logs for error messages — but never grep logs for secret values

**Never dump the full environment** to diagnose config issues. Cross-reference: `development/debugging` for the full debugging workflow.

## Safe test execution

Tests must never depend on real secrets:

- Use `.env.test` with fake/placeholder values for test configuration
- Test databases use local in-memory instances or test-specific connection strings
- Mock external API calls that require real credentials
- CI injects test-specific secrets via GitHub Actions secrets (not production secrets)

```bash
# SAFE: Run tests — they use .env.test, not real secrets
bun test

# SAFE: Run tests with Doppler providing test-specific config
doppler run --config test -- bun test
```

## Safe secret deployment

When deploying secrets to platforms, the agent runs the command — the user provides the value interactively:

```bash
# SAFE: Wrangler prompts for the value interactively
bunx wrangler secret put DATABASE_URL --env production

# SAFE: Railway prompts interactively
railway variables set DATABASE_URL

# FORBIDDEN: Never pass secret values as CLI arguments
# They appear in shell history and process lists
bunx wrangler secret put DATABASE_URL --value "postgres://..."  # NEVER
```

## Post-install script risks

Dependencies can run arbitrary code via `postinstall` scripts. With no secrets on disk, `postinstall` cannot read `.env` files. However, if a dev server is running with Doppler-injected secrets, a compromised runtime dependency CAN access `process.env`.

Mitigations:
- Use `bun install --frozen-lockfile` for routine installs (locks to known-safe versions)
- Use `bun install --ignore-scripts` when adding unfamiliar packages, then audit scripts
- See `security/supply-chain` for the full dependency review process

## Accidental exposure response

If a secret value was accidentally exposed (a process logged it, a command printed it, it appeared in tool output):

1. **Do NOT repeat it** in any subsequent output, message, commit, PR description, or file
2. **Flag it immediately** to the user: "A secret value was exposed in [context]. You should rotate this credential."
3. **Do NOT attempt to redact after the fact** — the value is already in the conversation context
4. The user must rotate the compromised secret at the source

## Escalation

If diagnosing an issue genuinely requires knowing a secret's value:

1. Stop and ask the user via `AskUserQuestion`
2. The user can check the value themselves (`doppler secrets get KEY`, or look in the platform dashboard)
3. The user tells you the relevant diagnostic info without giving you the full secret (e.g., "the DATABASE_URL points to localhost:5432" or "the API key starts with sk_test_")

In `bypassPermissions` mode, this is the one case where the agent must pause execution and wait for user input.

## Key references

| File | What it covers |
|---|---|
| `references/safe-commands.md` | Complete allowlist/denylist of commands with safe alternatives |
| `references/secret-architecture.md` | No-secrets-on-disk architecture, Doppler setup, platform stores, migration guide |
