---
name: knowledge
description: Records development learnings and creates Architecture Decision Records (ADRs) — captures discoveries, workarounds, and architectural choices for future reference. Use when encountering a non-obvious insight worth preserving, when past context might be relevant, when making a significant architectural decision, or when reviewing whether recorded decisions are still current.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Knowledge

## Decision Tree

- What are you doing?
  - **Just discovered something worth recording** → see "Capturing a learning" below
  - **Current issue seems familiar — looking for past context** → see "Searching for relevant learnings" below
  - **Making a new architectural decision** → see "Creating an ADR" below
  - **Reviewing whether existing ADRs are still accurate** → see "Staleness review" below
  - **Generating a summary of recent learnings** → run `tools/learning-digest.ts` and review output
  - **Connecting a learning to a specific file or module** → run `tools/learning-link.ts <file-path>`
  - **Onboarding or auditing decision history** → run `tools/adr-index.ts` to generate a summary index
  - **Verifying code references in ADRs resolve correctly** → run `tools/adr-link.ts` and fix broken links

## Capturing a learning

1. Identify what was discovered:
   - A bug cause and fix
   - An unexpected API behavior
   - A performance pitfall
   - A tool or library quirk
   - A pattern that worked well (or didn't)
2. Write a concise entry with:
   - **What** happened (1-2 sentences)
   - **Why** it happened (root cause if known)
   - **Fix or workaround** applied
   - **Tags**: relevant technology, module, or topic names
3. Run `tools/learning-capture.ts` with the entry text and tags — appends a timestamped record to the project knowledge base
4. Good learnings are specific and actionable. Avoid vague entries like "be careful with async" — write "Bun's `Bun.serve` does not support streaming responses with `TransformStream` when behind a Cloudflare Tunnel — use chunked transfer instead."

## Searching for relevant learnings

1. Identify keywords describing the current issue (technology, error message, module name)
2. Run `tools/learning-search.ts <query>` — full-text search across recorded learnings
3. Review results:
   - **Direct match** → apply the recorded fix or workaround; note if the situation has changed
   - **Partial match** → use as context but verify it still applies to the current version/environment
   - **No match** → proceed without prior context; capture a learning once resolved
4. After finding and applying a past learning, check if it still needs updating (e.g., a newer version fixed the issue)

## Creating an ADR

1. Confirm this decision is worth recording:
   - Significant architectural choice (not a minor implementation detail)
   - Affects multiple parts of the codebase or future work
   - The "why" would not be obvious from reading the code
2. Run `tools/adr-create.ts "<title>"` — scaffolds a new ADR with auto-incrementing ID in `docs/decisions/`
3. Fill in the generated template:
   - **Status**: Proposed / Accepted / Deprecated / Superseded
   - **Context**: What situation made this decision necessary?
   - **Decision**: What was chosen, stated clearly
   - **Consequences**: What becomes easier? What becomes harder? What are the trade-offs?
4. Link the ADR to relevant source files:
   - Add a comment in the code: `// See ADR-NNN: <title>`
   - Add the file path to the ADR's "Affected code" section
5. Commit the ADR in the same commit as the code change when possible

## Staleness review

1. Run `tools/adr-stale.ts` — finds ADRs that reference changed or deleted code paths
2. For each flagged ADR:
   - **Code path deleted** → check if the decision is still relevant; if not, mark ADR as Deprecated
   - **Code path changed significantly** → update the ADR to reflect current reality or create a superseding ADR
   - **Decision reversed** → mark the old ADR as Superseded by the new one, add the new ADR number
3. Do not delete ADRs — mark them as Deprecated or Superseded with a reference to what replaced them
4. ADRs are a historical record; even bad decisions are worth preserving with their outcome noted

## Conventions

- Learnings go in `.learnings.md` at the project root; ADRs go in `docs/decisions/`
- Write ADR decisions as statements: "We will use Drizzle ORM" not "Should we use an ORM?"
- ADR consequences must include both positive and negative trade-offs
- Keep ADR status up to date (Proposed → Accepted → Deprecated/Superseded)
- Learnings should be specific and actionable, not vague observations

## Key references

| File | What it covers |
|---|---|
| `tools/learning-capture.ts` | Append a timestamped learning entry to the project knowledge base |
| `tools/learning-search.ts` | Full-text search across recorded learnings by keyword or tag |
| `tools/learning-digest.ts` | Generate a summary of recent learnings grouped by topic |
| `tools/learning-link.ts` | Find and attach related learnings to a given file or module |
| `tools/adr-create.ts` | Scaffold a new ADR with auto-incrementing ID |
| `tools/adr-stale.ts` | Find ADRs that reference changed or deleted code paths |
| `tools/adr-index.ts` | Generate a summary index of all ADRs with status and links |
| `tools/adr-link.ts` | Scan source files for decision references and verify they resolve |
