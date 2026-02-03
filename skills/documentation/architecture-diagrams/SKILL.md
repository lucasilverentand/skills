---
name: architecture-diagrams
description: Creates architecture documentation and diagrams. Use when documenting system design, creating technical overviews, or explaining component relationships.
argument-hint:
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# Architecture Diagrams

Creates architecture documentation using text-based diagrams.

## Your Task

1. **Understand system**: Analyze the codebase structure
2. **Identify components**: List major parts
3. **Map relationships**: Document interactions
4. **Create diagrams**: Use Mermaid or similar
5. **Document decisions**: Add ADRs if needed

## Mermaid Diagrams

### System Architecture

```mermaid
graph TB
    Client[Web Client] --> API[API Gateway]
    API --> Auth[Auth Service]
    API --> Users[User Service]
    API --> Orders[Order Service]
    Users --> DB[(PostgreSQL)]
    Orders --> DB
    Orders --> Queue[Message Queue]
    Queue --> Notifications[Notification Service]
```

### Sequence Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant D as Database

    C->>A: POST /users
    A->>A: Validate input
    A->>D: INSERT user
    D-->>A: User record
    A-->>C: 201 Created
```

### Entity Relationship

```mermaid
erDiagram
    USER ||--o{ POST : creates
    USER ||--o{ COMMENT : writes
    POST ||--o{ COMMENT : has

    USER {
        string id PK
        string email
        string name
    }
    POST {
        string id PK
        string title
        string authorId FK
    }
```

## Architecture Decision Records

```markdown
# ADR-001: Use PostgreSQL for primary database

## Status
Accepted

## Context
We need a reliable database for storing user and transaction data.

## Decision
Use PostgreSQL as our primary database.

## Consequences
- **Positive**: ACID compliance, rich query capabilities
- **Negative**: Requires more operational expertise
```

## Documentation Structure

```
docs/
├── architecture/
│   ├── overview.md
│   ├── diagrams/
│   │   ├── system.md
│   │   └── data-flow.md
│   └── decisions/
│       ├── ADR-001-database.md
│       └── ADR-002-auth.md
└── api/
```

## Tips

- Use text-based diagrams (version control friendly)
- Keep diagrams up to date
- Document the "why" not just "what"
- Link diagrams from code comments
