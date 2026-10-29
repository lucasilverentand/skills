# Architecture Review
Use this when the user provides or describes an existing Expo app and wants feedback.

## Review Order
Inspect or ask about:

```txt
1. routing structure
2. feature boundaries
3. local persistence
4. offline write behavior
5. sync queue or outbox
6. conflict handling
7. adaptive layout strategy
8. shared component boundaries
9. platform-specific code
10. tests and migration strategy
```

## Red Flags
Call out:

```txt
screens with direct fetch calls
route files with large UI or business logic
no local database for durable offline data
optimistic updates without persisted outbox rows
no idempotency keys
no tombstones
shared UI importing feature modules
layout based only on iOS or Android checks
background sync treated as guaranteed
```

## Response Shape
Give the user:

```txt
what is solid
what will break later
what to change first
what can wait
an example target structure or refactor path
```

Prioritize fixes that improve data correctness before purely aesthetic refactors.
