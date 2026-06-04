# Unresolved cleanup findings
Use this format when a tidy run cannot safely finish an item. The goal is to hand humans a short, actionable queue without opening duplicate tracking noise.

## When to use
- Merge or duplicate decisions need product judgment.
- Blocker removal might change sequencing expectations.
- Document drift needs author input, not agent rewrite.
- State moves lack evidence.
- Findings are `out-of-scope` but still worth recording for the project owner.

## Report format
Add a `## Unresolved cleanup` section to the tidy report. For each item use:

```markdown
### <short title>
- **Kind:** duplicate | blocker | field | document | state | link | other
- **Severity:** low | medium | high
- **Issues/docs:** ST-123, ST-456, [Project brief](url)
- **Observation:** one sentence on what is wrong
- **Suggested action:** what a human should do
- **Why not auto-fixed:** one sentence
- **Owner hint:** role or team if known, else "project lead"
```

## Severity guide
|Severity|Use when|
|---|---|
|high|Wrong blockers hide ready work, duplicate execution is likely, or doc drift misstates current scope|
|medium|Missing AC, labels, or links slow execution but work can continue|
|low|Cosmetic consistency, optional links, or stale Suggestion issues|

## Escalation paths
1. **Comment on the primary issue** — default for single-issue decisions. Tag the assignee or project lead.
2. **Project status update** — use when three or more high-severity items affect milestone risk or the next gate.
3. **New tracking issue** — only when the user asked to file follow-ups, or the same unresolved item survived two tidy runs. Title pattern: `Tidy: <short topic>`. Label with `Planning` or the project's hygiene label if one exists. Link back to the tidy report comment or date.

## Periodic runs
When the same unresolved item appears in two consecutive report-only runs, bump severity by one level and recommend escalation path 2 or 3 in the report.

## Example
```markdown
### Overlap between domain glossary and product brief issues
- **Kind:** duplicate
- **Severity:** medium
- **Issues/docs:** ST-201, ST-205
- **Observation:** Both issues ask for the same term list with different AC wording.
- **Suggested action:** Merge into ST-205 and mark ST-201 duplicate, or relate and narrow ST-201 to glossary maintenance only.
- **Why not auto-fixed:** Partial overlap; merge would drop review expectations for the brief.
- **Owner hint:** project lead
```
