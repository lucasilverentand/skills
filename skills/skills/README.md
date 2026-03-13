# Skill Creation

Skills for building, managing, and auditing agent skills.

## Skills

### authoring

Full skill development lifecycle — scaffolds directories, writes SKILL.md with frontmatter and decision trees, adds tools and references, validates structure and token budgets, runs test evaluations, and optimizes descriptions for triggering.

**Tools:** `skill-validate.ts`, `coverage-gap.ts`, `token-estimate.ts`
**Scripts:** `run-eval.ts`, `run-loop.ts`, `improve-description.ts`, `aggregate-benchmark.ts`, `generate-report.ts`, `quick-validate.ts`, `package-skill.ts`
**Agents:** grader, comparator, analyzer
**References:** skill-format, writing-philosophy, decision-trees, best-practices, skill-structure, tool-template, testing-guide, eval-workflow, blind-comparison, description-optimization, improvement-guide, platform-notes, schemas, marketplace

### marketplace

Manages the skills marketplace — validates `marketplace.json` integrity, publishes and updates skills, enforces naming and category conventions, manages semver versioning, and generates the marketplace catalog.

**Tools:** `marketplace-lint.ts`
**References:** schema
