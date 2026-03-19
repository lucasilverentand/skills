# Docker

Write Dockerfiles, optimize images, and debug containers.

## Responsibilities

- Write and optimize Dockerfiles
- Optimize container image size and build speed
- Debug container issues
- Manage multi-stage builds and build caching
- Configure health checks and container networking
- Scan images for known vulnerabilities

## Tools

- `tools/image-size-breakdown.ts` — analyze image layers and identify the largest contributors
- `tools/dockerfile-lint.ts` — check Dockerfiles for common anti-patterns and best practices
- `tools/layer-cache-hit.ts` — estimate cache hit rate for each build stage
- `tools/vulnerability-scan.ts` — scan a built image for known CVEs using Trivy output
