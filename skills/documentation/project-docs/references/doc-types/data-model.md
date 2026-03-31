# Doc Type: Data Model (`docs/data-model.md`)

```markdown
# Data Model

## Overview
What database(s) the project uses and the general approach (relational, document, etc.).

## Entity relationship diagram
Mermaid ER diagram showing tables/collections and their relationships.

## Entities
For each major entity:
- **Table/collection name**
- **Purpose** — what it represents
- **Key fields** — name, type, constraints, description (only non-obvious fields)
- **Relationships** — foreign keys, references
- **Indexes** — which ones exist and why

## Migrations
How schema changes are managed. What tool is used. How to create and run migrations.

## Seed data
Whether seed data exists, what it contains, how to load it.

## Data lifecycle
How data is created, updated, archived, and deleted. Any retention policies.
```

**Guidance:**
- The ER diagram is the most valuable part — start there
- Don't list every field — focus on the ones that aren't self-explanatory
- Document why indexes exist, not just that they do
- If using Drizzle/Prisma/etc., link to the schema file as the source of truth
