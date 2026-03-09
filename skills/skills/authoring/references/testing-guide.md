# Testing Skills

The `skill-creator` skill owns the test/eval/improve loop. This guide covers the conventions authoring adds on top.

## Before handing off to skill-creator

Validate structure first — skill-creator doesn't check authoring conventions:

1. Run `tools/skill-validate.ts <path>` — required files, frontmatter, naming
2. Run `tools/token-estimate.ts <path>/SKILL.md` — under 5000 tokens
3. Run `tools/coverage-gap.ts <path>` — responsibilities covered by content and tools

## After each skill-creator iteration

Re-validate after every improvement cycle. Skill-creator optimizes for output quality but may violate authoring structure:

- SKILL.md still under 5000 tokens?
- Decision tree still intact and covering all responsibilities?
- No content duplicated between SKILL.md and references?
- New content placed correctly? (detailed docs → references, automatable steps → tools, workflow → SKILL.md)
- PURPOSE.md still accurate after scope changes?

## Eval query quality standards

When skill-creator asks you to create eval queries (for testing or description optimization), apply these standards:

Good test prompts are concrete, specific, and detailed enough to resemble a real request. Include file paths, personal context, column names, company names. Mix formal and casual phrasings. Some terse, some verbose.

Bad: `"Format this data"`, `"Extract text from PDF"`, `"Create a chart"`

Good: `"ok so my boss sent me this xlsx (its in downloads, 'Q4 sales final FINAL v2.xlsx') and she wants a profit margin column. Revenue is in C, costs in D i think"`

Good: `"I need to convert our team's weekly standup notes from the Notion export (it's a bunch of markdown files in ~/Documents/standups/) into a single PDF report grouped by person. Sarah wants it by EOD."`

For **should-not-trigger** queries in description optimization, focus on near-misses — queries that share keywords but need something different. Bad negative: `"Write a fibonacci function"`. Good negative: `"Can you read the text from this screenshot? It's a photo of a menu from a restaurant"` (shares keywords with a PDF skill but needs OCR).

## Assertion quality standards

Good assertions are:

- **Discriminating** — pass when the skill works, fail without it. "Output file exists" is worthless. "The profit margin column uses the formula (C-D)/C" tests real behavior.
- **Objectively verifiable** — a script can check them, not just human judgment
- **Descriptively named** — someone reading results should immediately understand what each one checks

Don't force assertions onto subjective outputs (writing style, design quality). Those are better evaluated qualitatively through skill-creator's review viewer.
