---
name: docker
description: Writes and optimizes Dockerfiles, debugs container issues, manages multi-stage builds and layer caching, and scans images for vulnerabilities. Use when authoring a new Dockerfile, shrinking image size, diagnosing a container that won't start, setting up health checks, or reviewing an image for CVEs before deploying.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Docker

## Decision Tree

- What is the task?
  - **Write a new Dockerfile** → see "Authoring Dockerfiles" below
  - **Reduce image size** → run `tools/image-size-breakdown.ts`, then see "Image Optimization" below
  - **Improve build speed / cache hit rate** → run `tools/layer-cache-hit.ts`, then see "Cache Optimization" below
  - **Debug a container that won't start** → see "Debugging Containers" below
  - **Scan for vulnerabilities** → run `tools/vulnerability-scan.ts`, then see "Security" below
  - **Lint an existing Dockerfile** → run `tools/dockerfile-lint.ts`

## Authoring Dockerfiles

### Bun-based services (default)

```dockerfile
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1-alpine AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
USER bun
CMD ["bun", "run", "start"]
```

Rules:
- Always use a specific image tag, never `latest` — pin to a minor version (`oven/bun:1.1-alpine`)
- Use Alpine variants to minimize base image size
- Run as a non-root user (`USER bun` or `USER node`) in the final stage
- Copy only what the final stage needs — do not copy `node_modules` from source, only from the `deps` stage

### Multi-stage build structure

1. **deps stage**: install all dependencies (including devDependencies if needed for build)
2. **build stage** (if needed): compile TypeScript, run bundler, generate assets
3. **runner stage**: copy built artifacts and production `node_modules` only

## Image Optimization

1. Run `tools/image-size-breakdown.ts <image>` to identify which layers are largest
2. Common size contributors and fixes:
   - **`node_modules` too large** → ensure `--production` flag on `bun install`; remove unused dependencies
   - **Source files copied unnecessarily** → add a `.dockerignore` excluding `node_modules`, `.git`, `*.test.ts`, `docs/`
   - **Base image too large** → switch to Alpine variant; avoid Debian-based images for production
   - **Build artifacts left in final stage** → use multi-stage build, only copy `dist/` or equivalent
3. Target: < 200 MB for most services; < 100 MB for lightweight APIs

### .dockerignore essentials

```
node_modules
.git
*.test.ts
*.test.js
coverage/
docs/
.env
.env.*
```

## Cache Optimization

1. Run `tools/layer-cache-hit.ts` to estimate cache hit rate per stage
2. Order `COPY` instructions from least-to-most frequently changed:
   - First: `package.json`, `bun.lockb` (changes rarely)
   - Then: config files, static assets
   - Last: source code (changes most often)
3. Each `RUN`, `COPY`, `ADD` creates a new layer — if a layer changes, all subsequent layers are invalidated
4. Split long `RUN` chains only at logical boundaries, not arbitrarily — too many layers hurt pull performance

## Debugging Containers

1. Run `tools/dockerfile-lint.ts <path>` — fix any flagged issues first
2. Build with verbose output: `docker build --progress=plain .`
3. Container exits immediately:
   - Check the exit code: `docker inspect <container> --format '{{.State.ExitCode}}'`
   - Code 1 → application error; run `docker logs <container>` and trace the startup error
   - Code 137 → OOM killed; increase memory limit or reduce application memory usage
4. Container starts but misbehaves:
   - Exec into a running container: `docker exec -it <container> sh`
   - Confirm environment variables are injected: `env | grep <KEY>`
5. Networking issues:
   - Service not reachable → confirm it binds to `0.0.0.0`, not `127.0.0.1`
   - Container-to-container: use service names as hostnames in docker compose; use `host.docker.internal` to reach the host

### Health checks

Add to the `runner` stage:

```dockerfile
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
```

## Security

1. Run `tools/vulnerability-scan.ts <image>` — it wraps Trivy output into a readable report
2. Prioritize CRITICAL and HIGH CVEs — patch or upgrade the affected base image or package
3. Never include secrets in the image:
   - Do not `COPY .env` — inject at runtime via environment variables or a secrets manager
   - Do not `ARG` secrets — build arguments appear in image history
4. Use non-root user in the final stage (always)
5. Minimize the attack surface: use Alpine, remove package managers and shells if possible in distroless scenarios

## Key references

| File | What it covers |
|---|---|
| `tools/image-size-breakdown.ts` | Analyze image layers and identify the largest contributors |
| `tools/dockerfile-lint.ts` | Check Dockerfiles for common anti-patterns and best practices |
| `tools/layer-cache-hit.ts` | Estimate cache hit rate for each build stage |
| `tools/vulnerability-scan.ts` | Scan a built image for known CVEs using Trivy output |
