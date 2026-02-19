# Secrets

Secret scanning, rotation, and vault/store setup.

## Responsibilities

- Scan for leaked secrets
- Manage secret rotation
- Set up and configure secret vaults and stores
- Enforce secret access policies and audit trails
- Integrate secrets into CI/CD pipelines
- Validate that no plaintext secrets exist in manifests or config files

## Tools

- `tools/secret-scan.ts` — scan the repo for high-entropy strings and known secret patterns
- `tools/rotation-check.ts` — report secrets that exceed their maximum age policy
- `tools/env-leak-audit.ts` — verify .env files are gitignored and not committed in history
- `tools/sealed-secret-validate.ts` — check that SealedSecret resources decrypt correctly against the cluster key
