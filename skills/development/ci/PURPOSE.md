# CI

Create and update CI workflows and optimize CI pipeline speed.

## Responsibilities

- Create and update CI workflow configurations
- Optimize CI pipeline speed and reliability
- Manage caching strategies for faster builds
- Configure matrix builds for cross-platform testing
- Monitor and reduce CI flakiness rates

## Tools

- `tools/ci-lint.ts` — validate GitHub Actions workflow files for common misconfigurations
- `tools/pipeline-timing.ts` — parse CI logs and report step-by-step duration breakdowns
- `tools/cache-audit.ts` — analyze cache hit rates and suggest missing cache keys
- `tools/workflow-gen.ts` — scaffold a GitHub Actions workflow from a project template
