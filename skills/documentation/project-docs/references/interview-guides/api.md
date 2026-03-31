# Interview Guide: API Reference

Ask 3-5 questions at a time. Skip questions where the answer is already known from the discovery phase.

## Round 1 — Basics
1. What kind of API is it? (REST, GraphQL, RPC, WebSocket)
2. How is authentication handled? (API key, JWT, session, OAuth)
3. Is there an existing OpenAPI spec or API docs tool?

## Round 2 — Structure
4. What are the main resource groups? (users, products, billing — the top-level groupings)
5. What's the standard response format? (envelope with data/error, flat JSON, etc.)
6. How does pagination work?

## Round 3 — Details
7. What are the most important endpoints — the ones a new developer should understand first?
8. Are there any non-standard patterns or gotchas? (eventual consistency, async operations, etc.)
9. Are there webhooks, events, or callbacks the API sends?
