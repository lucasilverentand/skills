# Auth

Shared auth: Better Auth configuration, session types, and middleware.

## Responsibilities

- Configure Better Auth setup
- Define session types
- Provide auth middleware
- Manage OAuth provider registration and callback URLs
- Handle role-based access control and permission definitions
- Coordinate auth token refresh and session persistence across platforms

## Tools

- `tools/provider-list.ts` — list configured OAuth providers with their callback URLs and status
- `tools/permission-audit.ts` — show all defined roles and their associated permissions
- `tools/session-inspect.ts` — decode and display the claims of a given session token for debugging
