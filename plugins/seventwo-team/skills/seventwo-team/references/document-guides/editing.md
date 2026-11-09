# Editing and review
Use for: reviewing or revising an existing document of any type, or a small related set. Not for creating a document. The author must see and decide on every change, so locate every finding and keep edits visible.

## Gather first
- **Brief:** the document, its home, the depth, and whether to return findings, apply edits or both.
- **Purpose and audience:** who reads it and what they must be able to do. If unclear, ask the lead before a deep edit.
- **Style guide:** the project's guide, glossary and destination conventions; otherwise plain-language defaults (short sentences, active voice, one term per concept, defined acronyms).
- **Evidence and tools:** the code, product, data or decisions described, and existing link checkers, linters or spell checkers. Note what is unavailable.

## Passes
Take depth from the brief; default to a thorough review and say so.

|Depth|Passes|Output|
|---|---|---|
|Quick pass|1–3, blocking problems only|Highest-impact findings|
|Thorough review|All|All findings, suggested wording for major ones|
|Deep edit|All, verifying every claim the available evidence covers|Visible edits plus findings for the author or lead|

Run passes in order; do not polish text a later pass cuts.
1. **Structure and flow:** order fits how the reader uses it; missing, redundant or misplaced sections; audience fit.
2. **Gaps:** unsupported claims, unstated assumptions, undefined terms, missing context.
3. **Accuracy and freshness:** verify facts, versions, commands and links against current code, product or evidence, not the text.
4. **Consistency:** terminology, formatting and tone across the document or set.
5. **Prose:** cut filler, use active voice where the actor matters, split long sentences, lead with the point.

## Rules
- Write located, actionable findings ordered by impact: "Section 3, paragraph 2 claims X without evidence; cite Y or cut it", not "some claims lack evidence".
- Show edits as a diff, suggestions or tracked changes in the destination; never rewrite silently.
- Preserve the author's meaning and voice; do not edit for personal taste.
- Never change technical meaning, policy, figures or commitments; flag them for the lead.
- Return unsettled tone, audience or scope decisions to the lead with options and a recommendation.
- Label each finding observed, inferred or unknown.
- Add no copy, review page or run report unless the lead assigns one, and no template or footer the destination lacks.

## Check before handing back
- Every finding names a location, the problem and a concrete fix.
- Changed facts trace to current evidence. List unverified claims, unchecked links and the tools that ran.
- Compare with the original: untouched sections are intact and no meaning, policy or commitment changed.
- For a consequential document, ask the lead for an independent fresh-reader read under the review rules in SKILL.md; do not spawn one.

## Boundaries
This guide covers editorial quality. Artifact correctness belongs to the [independent reviewer](../presets/independent-reviewer.md); cross-record reconciliation to the [knowledge steward](../presets/knowledge-steward.md). Edit the document in its existing home ([knowledge-and-planning.md](../knowledge-and-planning.md)).
