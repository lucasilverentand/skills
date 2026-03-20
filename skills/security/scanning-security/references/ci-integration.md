# CI Integration for Security Scanning

## GitHub Actions — SAST on pull requests

```yaml
name: Security Scan
on:
  pull_request:

jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: p/owasp-top-ten p/typescript
        env:
          SEMGREP_APP_TOKEN: ${{ secrets.SEMGREP_APP_TOKEN }}

      - name: Upload SARIF
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: semgrep.sarif
```

## GitHub Actions — DAST on staging deploy

```yaml
name: DAST Scan
on:
  deployment_status:
    types: [success]

jobs:
  dast:
    if: github.event.deployment_status.environment == 'staging'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Nuclei
        run: |
          go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest
          echo "$(go env GOPATH)/bin" >> $GITHUB_PATH

      - name: Run Nuclei
        run: |
          nuclei -u ${{ github.event.deployment_status.target_url }} \
            -severity critical,high \
            -jsonl -o nuclei-results.jsonl

      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: dast-results
          path: nuclei-results.jsonl
```

## GitLab CI

```yaml
stages:
  - test
  - deploy
  - dast

sast:
  stage: test
  image: returntocorp/semgrep
  script:
    - semgrep scan --config auto --json -o semgrep-results.json .
  artifacts:
    paths:
      - semgrep-results.json
    when: always

dast:
  stage: dast
  image: projectdiscovery/nuclei
  needs: [deploy-staging]
  script:
    - nuclei -u $STAGING_URL -severity critical,high -jsonl -o nuclei-results.jsonl
  artifacts:
    paths:
      - nuclei-results.jsonl
    when: always
```

## General patterns

- **SAST on every PR** — fast, catches issues before merge
- **DAST on staging deploys** — tests the running application after deploy
- **Fail on critical only** — use `--severity critical` to gate merges; report high/medium as warnings
- **SARIF upload** — GitHub Security tab aggregates findings across runs
- **Baseline scanning** — use `--baseline` flags to only report new findings, not pre-existing ones
- **Cache scanner databases** — semgrep rules and nuclei templates can be cached between runs

## Severity gating

To fail CI only on critical/high findings:

```bash
# Run scan, capture exit code
semgrep scan --config auto --json -o results.json . || true

# Check for critical/high findings
bun run tools/triage-findings.ts results.json --min-severity high --json | \
  jq -e '.afterDedup == 0' || exit 1
```

## Configuration in repo

Keep scanner configs versioned alongside code:

```
.semgrep.yml          # Semgrep rules and exclusions
.bandit               # Bandit configuration
nuclei-templates/     # Custom nuclei templates
scan-suppressions.log # Audit trail for false-positive suppressions
```

Use `tools/scan-config.ts validate` in CI to ensure configs are well-formed before running scans.
