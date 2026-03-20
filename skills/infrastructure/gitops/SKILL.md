---
name: gitops
description: Manages Flux CD configurations, structures GitOps repositories, debugs reconciliation failures, validates Kustomize overlays and HelmRelease specs, and audits drift between desired and live cluster state. Use when setting up Flux, authoring or modifying Kustomizations or HelmReleases, debugging a reconciliation that is stuck or failing, or detecting configuration drift.
allowed-tools: Read Grep Glob Bash Write Edit
---

# GitOps

## Decision Tree

- What is the task?
  - **Set up Flux in a new cluster or repo** → see "Bootstrapping Flux" below
  - **Author or modify a Kustomization** → see "Kustomize Overlays" below
  - **Author or modify a HelmRelease** → see "HelmReleases" below
  - **Reconciliation is stuck or failing** → run `tools/flux-status.ts`, then see "Debugging Reconciliation" below
  - **Detect drift between desired and live state** → run `tools/drift-detect.ts`
  - **Diff HelmRelease values across environments** → run `tools/helm-values-diff.ts`

## Bootstrapping Flux

1. Ensure the cluster is reachable: `kubectl cluster-info`
2. Bootstrap Flux into the GitOps repo:
   ```
   flux bootstrap github \
     --owner=<org> \
     --repository=<repo> \
     --branch=main \
     --path=clusters/<cluster-name>
   ```
3. Verify Flux controllers are running: `flux check`
4. Commit the generated manifests that Flux pushes to the repo

### Recommended repo structure

```
clusters/
  homelab/          # cluster-specific Flux config
    flux-system/    # managed by Flux bootstrap — do not edit manually
apps/
  base/             # shared base manifests (Deployments, Services)
  staging/          # overlays for staging
  production/       # overlays for production
infrastructure/
  base/             # shared infrastructure (ingress, cert-manager, monitoring)
  staging/
  production/
```

## Kustomize Overlays

1. Run `tools/kustomize-build.ts <overlay-path>` to render the overlay and validate output before committing
2. Base manifests live in `apps/base/<app>/` — overlays only contain patches, not duplicates of base resources
3. Use `patchesStrategicMerge` for simple field overrides, `patchesJson6902` for complex structural changes
4. Reference images with `images:` in `kustomization.yaml` rather than editing Deployment manifests directly — Flux image automation updates these
5. Keep patches minimal — large patches indicate the base is wrong

### Kustomization resource example

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: apps
  namespace: flux-system
spec:
  interval: 10m
  path: ./apps/production
  prune: true
  sourceRef:
    kind: GitRepository
    name: flux-system
```

- Always set `prune: true` — it removes resources deleted from Git
- Set `interval` to `10m` for most resources; use `1m` only for frequently changing configs

## HelmReleases

1. Run `tools/helm-values-diff.ts <release> --envs staging,production` before changing values
2. HelmRelease structure:
   ```yaml
   apiVersion: helm.toolkit.fluxcd.io/v2
   kind: HelmRelease
   metadata:
     name: <app>
     namespace: <namespace>
   spec:
     interval: 10m
     chart:
       spec:
         chart: <chart-name>
         version: ">=1.0.0 <2.0.0"
         sourceRef:
           kind: HelmRepository
           name: <repo>
     values:
       # override values here
   ```
3. Pin chart versions to a semver range — avoid `*` or omitting `version`
4. Use `valuesFrom` to reference Secrets or ConfigMaps for sensitive values rather than inlining them

## Debugging Reconciliation

1. Run `tools/flux-status.ts` to get a summary of all Flux resource states
2. For a failing Kustomization:
   ```
   flux get kustomization <name>
   flux logs --kind=Kustomization --name=<name>
   ```
3. For a failing HelmRelease:
   ```
   flux get helmrelease <name> -n <namespace>
   flux logs --kind=HelmRelease --name=<name> -n <namespace>
   ```
4. Common failure reasons:
   - **"unable to build kustomize"** → run `tools/kustomize-build.ts` locally to find the YAML error
   - **"chart not found"** → verify `HelmRepository` is synced: `flux get sources helm`
   - **"resource already exists"** → a non-Flux resource conflicts; either adopt it (`flux import`) or delete and let Flux recreate it
   - **Stuck in "Reconciling"** → check if a previous revision is still deploying: `kubectl rollout status deployment/<name> -n <namespace>`
5. Force reconciliation: `flux reconcile kustomization <name> --with-source`

## Image Automation

1. Create an `ImageRepository` to track image tags
2. Create an `ImagePolicy` to define which tags to select (semver, alphabetical, or regex)
3. Create an `ImageUpdateAutomation` to commit tag updates back to the repo
4. Mark the image field in `kustomization.yaml` with a comment so Flux knows where to write:
   ```yaml
   images:
     - name: ghcr.io/org/app
       newTag: v1.0.0 # {"$imagepolicy": "flux-system:app"}
   ```

## Key references

| File | What it covers |
|---|---|
| `tools/kustomize-build.ts` | Render Kustomize overlays and validate the output YAML |
| `tools/flux-status.ts` | Summarize reconciliation status for all Flux resources |
| `tools/drift-detect.ts` | Compare rendered manifests against live cluster state |
| `tools/helm-values-diff.ts` | Diff HelmRelease values across environments |
