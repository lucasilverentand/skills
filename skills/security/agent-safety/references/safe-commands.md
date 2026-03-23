# Safe Commands Reference

Complete allowlist/denylist for agents working near secrets. Organized by category.

## Environment variable inspection

| Command | Verdict | Why |
|---|---|---|
| `printenv` | **FORBIDDEN** | Dumps all env vars including Doppler-injected secrets |
| `env` | **FORBIDDEN** | Same as printenv |
| `set` | **FORBIDDEN** | Dumps all shell variables and functions |
| `export -p` | **FORBIDDEN** | Lists all exported variables with values |
| `echo $VAR_NAME` | **FORBIDDEN** | Prints the value of a potentially secret variable |
| `printf "%s" "$VAR_NAME"` | **FORBIDDEN** | Same as echo |
| `test -n "$VAR_NAME" && echo "set" \|\| echo "unset"` | **SAFE** | Checks existence without revealing the value |
| `[[ -z "$VAR_NAME" ]]` | **SAFE** | Boolean check, no value printed |
| `doppler secrets --only-names` | **SAFE** | Lists secret names without values |
| `doppler secrets` | **FORBIDDEN** | Prints all names AND values |
| `doppler secrets get KEY` | **FORBIDDEN** | Prints a specific secret's value |
| `doppler secrets --only-names --config <env>` | **SAFE** | Names for a specific Doppler config |

## File reading

| Command | Verdict | Why |
|---|---|---|
| `cat .env.example` | **SAFE** | Contains only placeholder values, committed to git |
| `cat .dev.vars.example` | **SAFE** | Same — placeholders only |
| `cat .env` | **SAFE** | Contains only non-secret config (by architecture) |
| `cat .dev.vars` | **SAFE** | Same — non-secret config only |
| `cat ~/.doppler/*` | **FORBIDDEN** | Contains Doppler auth tokens |
| `cat ~/.config/doppler/*` | **FORBIDDEN** | Same |
| `Read .env.example` | **SAFE** | Placeholder values |
| `Read .env` | **SAFE** | Non-secret config |
| Writing secret values to any file | **FORBIDDEN** | Violates no-secrets-on-disk architecture |

## Process management

| Command | Verdict | Why |
|---|---|---|
| `doppler run -- bun run dev` | **SAFE** | Doppler injects secrets; agent doesn't see them |
| `doppler run -- bunx wrangler dev` | **SAFE** | Same — runtime injection |
| `mise run dev` | **SAFE** | mise loads Doppler via `_.source` |
| `bun run dev` | **SAFE** | Inherits secrets from user's shell env |
| `bun run test` | **SAFE** | Tests use `.env.test` with fake values |
| `doppler run --config test -- bun test` | **SAFE** | Uses test-specific Doppler config |
| `curl http://localhost:3000/health` | **SAFE** | Health check, no secrets involved |
| `lsof -i :3000` | **SAFE** | Port inspection, no secrets |

## Dependency management

| Command | Verdict | Why |
|---|---|---|
| `bun install --frozen-lockfile` | **SAFE** | Installs from locked versions, no surprises |
| `bun install` | **CAUTION** | May update lockfile; use only when deliberately adding/updating deps |
| `bun add <package>` | **CAUTION** | Review the package first — see `security/supply-chain` |
| `bun install --ignore-scripts` | **SAFE** | Skips postinstall scripts from potentially malicious packages |

## Secret deployment

| Command | Verdict | Why |
|---|---|---|
| `bunx wrangler secret put KEY --env production` | **SAFE** | Prompts interactively for value |
| `bunx wrangler secret put KEY --value "..."` | **FORBIDDEN** | Secret appears in shell history and process list |
| `bunx wrangler secret list --env production` | **SAFE** | Shows names only |
| `railway variables set KEY` | **SAFE** | Interactive prompt |
| `railway variables set KEY=value` | **FORBIDDEN** | Secret in command arguments |
| `doppler secrets set KEY` | **SAFE** | Interactive prompt |
| `kubectl create secret generic ... --from-literal=KEY=value` | **FORBIDDEN** | Secret in command arguments — use `--from-file` with ephemeral stdin |

## Tool usage (Read, Grep, Glob)

| Action | Verdict | Why |
|---|---|---|
| `Read .env.example` | **SAFE** | Placeholders only |
| `Read .env` | **SAFE** | Non-secret config by architecture |
| `Read .dev.vars` | **SAFE** | Non-secret config by architecture |
| `Read ~/.doppler/*` | **FORBIDDEN** | Doppler auth tokens |
| `Grep` for variable names in `.env.example` | **SAFE** | No secrets in example files |
| `Grep` in application logs for secret patterns | **FORBIDDEN** | Could match and display secret values |
| `Glob .env*` | **SAFE** | Just lists file names |

## Git operations

| Command | Verdict | Why |
|---|---|---|
| `git diff` (when `.env` has only non-secret config) | **SAFE** | No secrets to expose |
| `git log -p` on files that once had secrets | **CAUTION** | Historical secrets may exist in git history |
| `git add .env` | **SAFE** | Contains only non-secret config |
| Committing files with hardcoded secrets | **FORBIDDEN** | Secrets must never be in source |

## Runtime code execution

| Command | Verdict | Why |
|---|---|---|
| `node -e "console.log(process.env)"` | **FORBIDDEN** | Dumps all env vars |
| `node -e "console.log(process.env.KEY)"` | **FORBIDDEN** | Prints specific secret |
| `python -c "import os; print(os.environ)"` | **FORBIDDEN** | Same as printenv |
| `bun -e "console.log(Bun.env)"` | **FORBIDDEN** | Dumps all env vars |
