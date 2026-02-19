# GitOps

Flux CD management, repo structure, and reconciliation debugging.

## Responsibilities

- Manage Flux CD configurations
- Structure GitOps repositories
- Debug reconciliation issues
- Validate Kustomize overlays and HelmRelease specs
- Manage image automation and update policies
- Audit drift between desired state and live cluster

## Tools

- `tools/kustomize-build.ts` — render Kustomize overlays and validate the output YAML
- `tools/flux-status.ts` — summarize reconciliation status for all Flux resources
- `tools/drift-detect.ts` — compare rendered manifests against live cluster state
- `tools/helm-values-diff.ts` — diff HelmRelease values across environments
