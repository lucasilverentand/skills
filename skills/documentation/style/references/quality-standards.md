# Quality Standards

Universal quality checklist and anti-patterns for all documentation. Run through this before delivering any document.

## Quality Checklist

Before delivering any document:

- [ ] **Evidence-backed** — every claim is supported by code, data, a link, or explicit reasoning
- [ ] **Audience-aware** — the intro states who the document is for
- [ ] **Executive summary works standalone** — a reader who only reads the summary gets the key message
- [ ] **Tables for structured data** — any data with 3+ comparable items uses a table, not prose
- [ ] **Action items are specific** — assigned where possible, with deadlines where applicable
- [ ] **No orphan sections** — no empty or placeholder content remains
- [ ] **No filler paragraphs** — every sentence adds information
- [ ] **Links resolve** — all internal and external links have been checked
- [ ] **Code examples work** — code blocks are copy-pasteable and syntactically correct
- [ ] **Consistent terminology** — the same concept uses the same term throughout

## Anti-Patterns

These patterns weaken any document. Watch for them during review.

### Content Anti-Patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| **Wall of text** | No one reads long unbroken paragraphs | Break into bullets, tables, or shorter paragraphs |
| **Claims without evidence** | "The code is messy" is an opinion | "47 functions exceed 200 lines in `src/`" is a finding |
| **Evidence without conclusions** | Data dumps don't help decisions | Explain what it means and what to do about it |
| **Burying the lead** | The key message appears on page 3 | Lead with the most important information |
| **Vague language** | "Performance degraded" | "P95 latency increased from 200ms to 1.2s" |
| **Missing trade-offs** | Recommendations seem one-sided | Every recommendation has downsides — acknowledge them |

### Structure Anti-Patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| **No executive summary** | Reader must read everything to get the point | Add a 2-3 sentence summary at the top |
| **Scope creep** | Document tries to cover everything | Define scope upfront, put out-of-scope items in an appendix |
| **Orphan sections** | Empty or placeholder sections remain | Either fill them or remove them |
| **Inconsistent depth** | Some sections are detailed, others are stubs | Match depth to importance and audience needs |

### Process Anti-Patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| **Writing without an audience** | The document doesn't serve anyone well | Define the audience before writing |
| **Skipping review** | Errors and gaps ship to readers | Use the co-authoring workflow for substantial docs |
| **Never updating** | Docs drift from reality | Update docs as part of PRs that change the documented behavior |
| **Perfection paralysis** | Document never ships | A good document today beats a perfect one next month |

## Review Process

When reviewing a document (your own or someone else's), check in this order:

1. **Does the summary convey the key message?** — Read only the first paragraph. Do you know what this is about and why it matters?
2. **Is the audience clear?** — Can a reader tell if this document is for them?
3. **Is every claim grounded?** — Scan for assertions. Is each backed by evidence?
4. **Can anything be cut?** — Look for sentences that repeat what's already stated or add no information
5. **Are tables used for structured data?** — Look for paragraphs that compare items and convert to tables
6. **Do code examples work?** — Try running them mentally or literally
