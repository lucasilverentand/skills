---
name: secrets
description: Scans for leaked secrets, manages secret rotation, sets up secret stores, and validates that no plaintext secrets exist in manifests or config files. Use when auditing a repo for committed credentials, setting up environment-based secrets, validating SealedSecrets, checking secret age against rotation policy, or integrating secrets into a CI/CD pipeline.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Secrets

## Decision Tree

- What is the task?
  - **Scan the repo for leaked secrets** → run `tools/secret-scan.ts`, then see "Remediating Leaks" below
  - **Audit .env files and git history** → run `tools/env-leak-audit.ts`
  - **Check which secrets need rotation** → run `tools/rotation-check.ts`
  - **Set up or validate SealedSecrets** → run `tools/sealed-secret-validate.ts`, then see "SealedSecrets" below
  - **Integrate secrets into CI/CD** → see "CI/CD Integration" below
  - **Set up environment variable management** → see "Environment Strategy" below

## Remediating Leaks

When `tools/secret-scan.ts` or `tools/env-leak-audit.ts` finds a leaked secret:

1. **Rotate the secret immediately** — assume it is compromised. Rotation before cleanup.
2. Revoke the old credential at the source (API dashboard, GitHub settings, cloud IAM, etc.)
3. Remove the secret from the codebase and replace with an environment variable reference
4. Purge from git history using `git filter-repo --path <file> --invert-paths` or BFG Repo Cleaner
5. Force-push the cleaned history (coordinate with teammates to rebase their branches)
6. Run `tools/env-leak-audit.ts` again to confirm the file is now gitignored and absent from history
7. Audit access logs at the credential source for unauthorized use during the exposure window

**Never skip rotation** even if you believe the leak was brief or private — the secret is compromised.

## Environment Strategy

Secrets must never be committed. Use this hierarchy:

| Environment | How secrets are provided |
|---|---|
| Local development | `.env` file (gitignored), populated manually or via `cp .env.example .env` |
| CI/CD | Repository secrets (GitHub Actions secrets, etc.) injected as environment variables |
| Staging / Production | Platform secret store (Railway variables, Cloudflare secrets, Kubernetes Secrets or SealedSecrets) |

Rules:
- Every secret has a corresponding entry in `.env.example` with a placeholder value and a comment describing what it is
- `.env` and all `.env.*` variants (except `.env.example`) are in `.gitignore`
- Never log secrets — ensure logging frameworks are configured to redact known secret patterns

## Rotation

1. Run `tools/rotation-check.ts` to identify secrets that exceed their maximum age policy
2. Rotation frequency guidelines:
   - API keys used externally: every 90 days
   - Database passwords: every 180 days or after any team member leaves
   - JWT signing secrets: every 90 days (coordinate with active session invalidation)
   - CI tokens: every 90 days
3. Rotation steps:
   - Generate the new secret at the source
   - Update it in all environments simultaneously (not sequentially — rolling gaps cause auth failures)
   - Verify the application is healthy after rotation
   - Revoke the old secret

## SealedSecrets

SealedSecrets encrypt Kubernetes Secrets so they can be committed to Git safely.

1. Run `tools/sealed-secret-validate.ts` to verify existing SealedSecrets decrypt correctly against the current cluster key
2. Create a new SealedSecret:
   ```
   kubectl create secret generic <name> \
     --from-literal=KEY=value \
     --dry-run=client -o yaml | \
   kubeseal --format yaml > sealedsecret-<name>.yaml
   ```
3. Commit the `.yaml` file — it is safe to commit; only the cluster can decrypt it
4. Never commit the plain `Secret` YAML — only the `SealedSecret`
5. If the cluster key is rotated, re-seal all secrets: `kubeseal --re-encrypt`

### Key backup

Backup the SealedSecrets master key immediately after bootstrapping:
```
kubectl get secret -n kube-system sealed-secrets-key -o yaml > sealed-secrets-key-backup.yaml
```
Store this backup outside the cluster (encrypted, in a password manager or vault). Without it, all SealedSecrets are unrecoverable if the controller is reinstalled.

## CI/CD Integration

1. Store secrets as repository secrets in GitHub Actions (or equivalent)
2. Reference in workflows:
   ```yaml
   env:
     DATABASE_URL: ${{ secrets.DATABASE_URL }}
   ```
3. Never print secrets in CI output — add `::add-mask::$SECRET` if a secret must be computed at runtime
4. Scope secrets to the minimum required environments — do not expose production secrets to PR builds
5. Rotate CI secrets on the same schedule as application secrets

## Key references

| File | What it covers |
|---|---|
| `tools/secret-scan.ts` | Scan the repo for high-entropy strings and known secret patterns |
| `tools/rotation-check.ts` | Report secrets that exceed their maximum age policy |
| `tools/env-leak-audit.ts` | Verify .env files are gitignored and not committed in history |
| `tools/sealed-secret-validate.ts` | Check that SealedSecret resources decrypt correctly against the cluster key |
