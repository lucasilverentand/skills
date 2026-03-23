# Secret Architecture — No Secrets on Disk

## Principle

Secret values never exist as files in the project directory. Secrets reach running processes exclusively through runtime injection. This is a structural defense: there is nothing on disk for an agent, a compromised dependency's `postinstall` script, or an accidental `git add .` to capture.

## How secrets flow

```
┌──────────────────────────────────────────────────────┐
│                   Secret Sources                      │
│                                                       │
│  Doppler    Platform Stores    User's Shell Env       │
│  (dev)      (staging/prod)     (fallback)             │
└──────┬──────────┬────────────────┬────────────────────┘
       │          │                │
       ▼          ▼                ▼
┌──────────────────────────────────────────────────────┐
│              Runtime Injection                         │
│                                                       │
│  doppler run --    CF secrets    railway vars          │
│  mise run          K8s secrets   shell export          │
└──────────────────────────┬───────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────┐
│              process.env at runtime                    │
│                                                       │
│  DATABASE_URL, API_KEY, JWT_SECRET, etc.              │
│  Available to the application — invisible to the      │
│  agent, invisible to postinstall scripts              │
└──────────────────────────────────────────────────────┘
```

## What lives on disk

### `.env` / `.dev.vars` — non-secret config

These files contain only values that are safe to read, commit (though they're typically gitignored), and inspect:

```bash
# .env — non-secret config
NODE_ENV=development
API_PORT=3000
PUBLIC_URL=http://localhost:3000
LOG_LEVEL=debug
FEATURE_FLAG_NEW_UI=true
```

```bash
# .dev.vars — non-secret Wrangler config
ENVIRONMENT=development
WORKER_PORT=8787
```

### `.env.example` / `.dev.vars.example` — placeholder documentation

These are committed to git and document every variable the application expects:

```bash
# .env.example
NODE_ENV=development
API_PORT=3000
PUBLIC_URL=http://localhost:3000
LOG_LEVEL=debug

# Secrets — injected via Doppler, not stored in .env
# DATABASE_URL=
# JWT_SECRET=
# STRIPE_SECRET_KEY=
# CLOUDFLARE_API_TOKEN=
```

The example file uses comments to list secrets, making it clear they come from elsewhere.

## Doppler setup

Doppler is the primary secret manager for local development.

### First-time setup

```bash
# Install Doppler CLI
brew install dopplerhq/cli/doppler

# Authenticate (interactive — user logs in via browser)
doppler login

# Link to the project (interactive — user selects project and config)
doppler setup
```

### Using Doppler

```bash
# Start a dev server with secrets injected
doppler run -- bun run dev

# Start a specific worker
doppler run -- bunx wrangler dev

# List secret names (no values)
doppler secrets --only-names

# Set a new secret (interactive)
doppler secrets set NEW_SECRET_KEY

# Use a specific config (e.g., test environment)
doppler run --config test -- bun test
```

### Doppler with mise

Projects using mise can source Doppler automatically via `mise.toml`:

```toml
[env]
_.source = [{ backend = "doppler" }]
```

When `mise run dev` executes, Doppler secrets are automatically in `process.env`.

### Doppler with process-compose

For multi-worker projects, each service in `process-compose.yml` should be wrapped with Doppler:

```yaml
processes:
  auth-api:
    command: doppler run --config dev_auth -- bunx wrangler dev --port 4804
  user-api:
    command: doppler run --config dev_user -- bunx wrangler dev --port 4801
```

Or use a single Doppler config with all secrets, and each worker reads only what it needs from `process.env`.

## Platform secret stores

### Cloudflare Workers

```bash
# Set a secret (interactive prompt for value)
bunx wrangler secret put DATABASE_URL --env production

# List secret names
bunx wrangler secret list --env production
```

Cloudflare encrypts secrets at rest. They are available at runtime via `env.DATABASE_URL` in the Worker.

### Railway

```bash
# Set via CLI (interactive)
railway variables set DATABASE_URL --environment production

# Or set via dashboard: Railway → Project → Variables
```

Railway injects all configured variables as `process.env` at runtime.

### Kubernetes

Use SealedSecrets for GitOps-managed clusters:

```bash
# Create a regular secret (dry-run), pipe to kubeseal
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL="value" \
  --dry-run=client -o yaml | \
kubeseal --format yaml > sealedsecret-app-secrets.yaml
```

The SealedSecret YAML is safe to commit. Only the cluster can decrypt it.

## Migration guide — moving secrets out of .env

If a project currently stores secrets in `.env`:

### Step 1: Identify secrets

```bash
# Look at .env and categorize each variable
cat .env
```

Secrets: anything that grants access (passwords, API keys, tokens, signing keys).
Non-secrets: URLs, ports, feature flags, environment names, log levels.

### Step 2: Set up Doppler

```bash
doppler login
doppler setup
```

### Step 3: Move secrets to Doppler

```bash
# For each secret:
doppler secrets set DATABASE_URL
# Doppler prompts for the value
```

### Step 4: Remove secrets from .env

Edit `.env` to keep only non-secret config. Remove all passwords, keys, and tokens.

### Step 5: Update .env.example

Add comments documenting the secrets that now live in Doppler:

```bash
# Secrets — managed by Doppler
# DATABASE_URL=
# JWT_SECRET=
```

### Step 6: Update dev scripts

Change `bun run dev` to `doppler run -- bun run dev` in `package.json` scripts or `process-compose.yml`.

### Step 7: Verify

```bash
# Confirm .env has no secrets
cat .env  # should show only non-secret config

# Confirm Doppler has all secrets
doppler secrets --only-names

# Confirm the app starts correctly
doppler run -- bun run dev
```

### Step 8: Clean git history (if secrets were committed)

If `.env` with secrets was ever committed to git, the secrets exist in git history and must be rotated regardless. Use `git filter-repo` or BFG Repo Cleaner to remove the file from history, then force-push. See `infrastructure/secrets` for the full remediation process.
