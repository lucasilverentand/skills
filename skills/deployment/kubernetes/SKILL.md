---
name: kubernetes
description: Writes and updates Kubernetes manifests, manages Flux GitOps deployments, handles scaling and rollouts, and debugs pod failures. Use when authoring or updating deployments, services, ingress, or RBAC; when a pod is crashing or stuck; when a rollout needs to be monitored or rolled back; or when configuring resource limits and requests.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Kubernetes

## Decision Tree

- What is the task?
  - **Write or update a manifest** → see "Authoring Manifests" below
  - **Deploy via Flux/GitOps** → see "Flux Deployments" below
  - **Debug a pod failure or CrashLoopBackOff** → see "Debugging Pods" below
  - **Check or adjust resource limits** → run `tools/pod-resource-report.ts`, then see "Resources" below
  - **Monitor or roll back a rollout** → see "Rollouts" below
  - **Configure ingress or network policy** → see "Networking" below

## Authoring Manifests

1. Run `tools/manifest-validate.ts <path>` on any new or modified manifest before committing
2. Always set both `requests` and `limits` for CPU and memory on every container
3. Include a `readinessProbe` and `livenessProbe` — without them, traffic is sent to containers that aren't ready
4. Label conventions: `app.kubernetes.io/name`, `app.kubernetes.io/component`, `app.kubernetes.io/part-of`
5. Never hardcode image tags as `latest` — use a digest or explicit semver tag
6. Store sensitive values in `Secret` resources, not `ConfigMap`

### Manifest checklist

- [ ] `namespace` explicitly set (no implicit `default`)
- [ ] Resource requests and limits on every container
- [ ] Liveness and readiness probes configured
- [ ] Image tag is not `latest`
- [ ] Labels follow conventions
- [ ] `imagePullPolicy: IfNotPresent` unless testing unreleased builds

## Flux Deployments

Deployments are managed through the GitOps repo — do not apply manifests directly with `kubectl apply` unless debugging.

1. Commit manifest changes to the correct path in the GitOps repo
2. Check reconciliation state: `flux get kustomizations -A` (or see the `gitops` skill for full tooling)
3. Force reconciliation if needed: `flux reconcile kustomization <name> --with-source`
4. For HelmReleases: `flux reconcile helmrelease <name> -n <namespace>`
5. Check Flux logs if reconciliation hangs: `flux logs --level=error`

See the `gitops` skill for full Flux CD workflow.

## Debugging Pods

1. Check pod status: `kubectl get pods -n <namespace>`
2. Describe the pod for events: `kubectl describe pod <name> -n <namespace>`
   - **ImagePullBackOff** → check image name, tag, and pull secret
   - **CrashLoopBackOff** → check logs from the previous container: `kubectl logs <pod> -n <namespace> --previous`
   - **OOMKilled** → container exceeded memory limit; increase `limits.memory` or reduce usage
   - **Pending** → check node resource availability: `kubectl describe node`
3. Run `tools/pod-resource-report.ts` to compare requested vs actual resource usage across pods
4. Exec into a running container to inspect state: `kubectl exec -it <pod> -n <namespace> -- sh`
5. Check if the issue is in the image itself — reproduce locally with `docker run` using the same image and env

## Resources

1. Run `tools/pod-resource-report.ts` to identify over- or under-provisioned pods
2. Set `requests` based on steady-state usage; set `limits` at 2–3x requests for burst headroom
3. For CPU: avoid setting `limits` too low — CPU throttling degrades performance silently
4. For memory: always set `limits` — unbounded memory usage will OOM-kill the node eventually
5. Use Vertical Pod Autoscaler (VPA) in recommendation mode to get data-driven sizing suggestions

## Rollouts

1. Run `tools/rollout-status.ts` to check progress of all active rollouts
2. Watch a specific rollout: `kubectl rollout status deployment/<name> -n <namespace>`
3. If a rollout is stuck:
   - Check events: `kubectl describe deployment <name> -n <namespace>`
   - Check if new pods are crashing — follow "Debugging Pods" above
4. Roll back: `kubectl rollout undo deployment/<name> -n <namespace>`
5. After rollback, identify the root cause before re-deploying

## Networking

- **Ingress**: use `nginx` ingress class; set `ingressClassName: nginx` explicitly
- **TLS**: reference a `Secret` containing the certificate or use cert-manager annotations
- **Network policies**: default-deny all ingress, then explicitly allow required sources
- Run `tools/manifest-validate.ts` on ingress resources — they are frequently malformed

## Key references

| File | What it covers |
|---|---|
| `tools/manifest-validate.ts` | Lint and validate manifests against the cluster API version |
| `tools/resource-diff.ts` | Diff local manifests against live cluster state |
| `tools/pod-resource-report.ts` | Summarize CPU and memory requests vs actual usage |
| `tools/rollout-status.ts` | Check deployment rollout progress and surface stuck rollouts |
