---
name: internal-docs
description: Writes internal project documents — technical specs, RFCs, proposals, decision docs, and postmortems. Use when drafting any substantial internal document that requires structured thinking, stakeholder alignment, or incident documentation.
---

# Internal Docs

## Voice & Style
> See `documentation/style` for full guide (`references/voice-and-tone.md`)

Direct and precise. Lead with the proposal or conclusion, not the background. Tables for trade-offs and alternatives. Every decision needs stated reasoning. Blameless language for incidents.

> For substantial documents, follow the co-authoring workflow: `documentation/style` → `references/co-authoring-workflow.md`

## Decision Tree

- What kind of internal document?
  - **Technical specification** → follow `references/specs.md`
  - **RFC (request for comments)** → follow `references/rfcs.md`
  - **Proposal or business case** → follow `references/proposals.md`
  - **Decision document or ADR** → follow `references/decision-docs.md`
    - Need ADR tooling? → `development/knowledge` (tools/adr-create.ts)
  - **Postmortem or incident report** → follow `references/postmortems.md`
  - **Project brief** → use the co-authoring workflow with a custom structure

## General workflow

1. **Identify the doc type** — route to the appropriate reference above
2. **Clarify audience and impact** — who reads this, what should they walk away with?
3. **Use the co-authoring workflow for substantial docs** — see `documentation/style` → `references/co-authoring-workflow.md`
4. **Follow the type-specific template** — each reference file has a template, section guidance, and anti-patterns
5. **Review against quality standards** — see `documentation/style` → `references/quality-standards.md`

## Key references

| File | What it covers |
|---|---|
| `references/specs.md` | Technical specification template, section guidance, anti-patterns |
| `references/rfcs.md` | RFC template, review process, lifecycle |
| `references/proposals.md` | Proposal template, stakeholder alignment, success criteria |
| `references/decision-docs.md` | Decision document template, ADR content guidance |
| `references/postmortems.md` | Postmortem template, blameless format, prevention focus |
| `documentation/style` | Shared voice, tone, formatting, and quality standards |
| `development/knowledge` | ADR scaffolding tooling (tools/adr-create.ts) |
