---
name: research-brief
description: Writes research brief documents from the project-docs template. Use when the user asks for a research brief, wants an evidence trail, needs sourced findings for a product or technical decision, or is filling research-brief.md.
---

# Research Brief
Use this skill to preserve evidence, source quality, implications, and follow-up questions without turning product or technical docs into source dumps.

## Decision tree
- What is the user asking for?
  - **A new research brief** -> read `../../README.md` and `references/template.md`, then draft the brief around one focused research question.
  - **Evidence for a decision already made** -> use the `decision-record` skill for the decision and link to this research brief for source detail.
  - **Vendor, API, OS, framework, or hardware analysis** -> use `platform-dependency` when the dependency itself is the durable subject; use this skill for focused supporting research.
  - **Live or recent facts** -> verify with current primary sources before writing findings.
  - **Something else** -> ask for the research question the brief should answer.

## Workflow
1. Read `../../README.md` for shared conventions and relationship rules.
2. Read `references/template.md` before drafting or editing.
3. Frame one research question. Split broad investigations into multiple briefs.
4. Capture sources, findings, evidence quality, implications, risks, recommendation, and follow-up questions.
5. Keep source summaries short. Link to source material and explain why it matters.
6. Make uncertainty visible. Distinguish confirmed findings, weak signals, and guesses.

## Document contract
- **When to write**: When evidence needs its own source trail before a product, dependency, or implementation decision.
- **How many**: One per focused research question.
- **Owns**: Research question, source trail, findings, evidence quality, implications, risks, recommendation, and follow-up questions.
- **Link instead of duplicating**: Decisions belong in decision records; implementation plans belong in technical designs; dependency contracts belong in platform dependency docs.
