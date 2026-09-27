---
name: port-registry
description: Maintain a user-scoped local development port registry, scan project workspaces for explicit and inferred ports, find collisions, check whether ports are listening, and reserve or release free ports for app, API, worker, Expo, Vite, Astro, Firebase, Docker, and Kubernetes development services. Use when the user asks to pick a port, avoid port collisions, generate a free port, check if a port is free, scan projects for ports, or update the local port registry.
---

# Port Registry
Use this skill when local development ports need coordination across projects.

## Storage
The registry is user-scoped, not project-scoped:

- default path: `~/.config/developer-ports/registry.json`
- override: `DEVELOPER_PORTS_REGISTRY=/custom/path/registry.json`

Do not create project-root registries unless the user asks for an export.

## Workflow
1. Use the `developer-ports` MCP tools when they are available.
2. Start with `registry_info` to confirm the registry path.
3. For broad workspace updates, run `scan_projects` with the relevant roots. The default root is `/Volumes/DevDisk/Developer`.
4. Before assigning a new port:
   - run `suggest_ports` for a registry-aware candidate,
   - run `check_port` if a specific port was requested,
   - run `reserve_port` once the user or task has a chosen project/service.
5. Use `release_port` when a service no longer owns a reservation.
6. Treat shared dependency defaults separately from app-owned ports:
   - Postgres `5432`, Ollama `11434`, HTTPS `443`, and node-exporter `9100` are often intentional shared services.
   - Vite `5173`, Astro `4321`, Expo/Metro `8081`, Wrangler `8787`, and Next `3000` are collision-prone defaults and should usually become explicit project-owned ports.

## Tool Expectations
The MCP server exposes:

|Tool|Use|
|---|---|
|`registry_info`|Show the registry path and summary counts.|
|`scan_projects`|Scan project roots, update detected ports, and report collisions.|
|`list_ports`|List reservations, detected ports, and collisions.|
|`check_port`|Check live listener state and registry ownership for one port.|
|`suggest_ports`|Generate available port candidates from a range.|
|`reserve_port`|Reserve a chosen or suggested port for a project/service.|
|`release_port`|Mark a reservation as released.|

## Output Rules
- Report the registry path when writing or reserving.
- Explain whether a port is free because it is not listening, not reserved, and not detected.
- When a collision remains intentional, say why it is safe or shared.
- When changing project scripts, keep the registry updated after the edit.
