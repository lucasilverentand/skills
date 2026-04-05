# Interview Guide: Data Model

Ask 3-5 questions at a time. Skip questions where the answer is already known from the discovery phase.

## Round 1 — Overview
1. What database(s) does the project use?
2. What are the main entities? (users, orders, posts — the core domain objects)
3. Is there an ORM or query builder? (Drizzle, Prisma, raw SQL, etc.)

## Round 2 — Entity details
For each major entity:
4. What does it represent and what are its key fields?
5. How does it relate to other entities?
6. Are there any non-obvious fields or constraints worth calling out?

## Round 3 — Operations
7. How are schema changes managed? (migration tool, manual SQL, ORM generate)
8. Is there seed data for local development?
9. Are there any data lifecycle rules? (soft deletes, archival, retention policies)
