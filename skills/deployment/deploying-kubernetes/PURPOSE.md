# Kubernetes

Write and update manifests, manage Flux/GitOps deployments, and handle scaling and rollouts.

## Responsibilities

- Write and update Kubernetes manifests
- Manage Flux and GitOps deployments
- Handle scaling and rollout strategies
- Configure resource limits and requests for pods
- Manage ingress rules and network policies
- Debug pod failures and CrashLoopBackOff issues

## Tools

- `tools/manifest-validate.ts` — lint and validate manifests against the cluster API version
- `tools/resource-diff.ts` — diff local manifests against live cluster state
- `tools/pod-resource-report.ts` — summarize CPU and memory requests vs actual usage
- `tools/rollout-status.ts` — check deployment rollout progress and surface stuck rollouts
