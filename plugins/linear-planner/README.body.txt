## Template library
Starter templates for the documents kept around a product.

## What's in here
|Template|When to write it|How many|
|---|---|---|
|[Documentation placement rules](skills/project-docs/references/documentation-placement-rules-template.md)|When contributors need one rulebook for where planning, repo, and code-level docs belong.|One per app, product area, or repo|
|[Testing strategy](skills/project-docs/references/testing-strategy-template.md)|When a project needs one shared testing contract across features, packages, services, and releases.|One per app, product area, repo, or long-running project|
|[Project brief](skills/project-docs/references/project-brief-template.md)|At the start of a project, before commitment. The one-pager that justifies it.|One per project|
|[Customer profile](skills/project-docs/references/customer-profile-template.md)|Once there is a rough sense of who this is for. A living document that grows as the team learns.|One per project|
|[Research brief](skills/project-docs/references/research-brief-template.md)|When evidence needs its own source trail before a product, dependency, or implementation decision.|One per focused research question|
|[Platform dependency](skills/project-docs/references/platform-dependency-template.md)|When the product builds on something external — API, OS framework, hardware, vendor.|One per load-bearing dependency|
|[Feature spec](skills/project-docs/references/feature-spec-template.md)|Before building a feature with real scope.|One per feature|
|[Technical design](skills/project-docs/references/technical-design-template.md)|After product scope is clear enough to choose implementation shape.|One per feature, system, or infrastructure change that needs engineering review|
|[Decision record](skills/project-docs/references/decision-record-template.md)|After choosing a product, technical, operational, or process direction that future work may need to understand.|One per important decision|
|[Release readiness](skills/project-docs/references/release-readiness-template.md)|Before shipping a release, feature, service change, library version, CLI update, or infrastructure change.|One per release or launch decision|
|[Post-release review](skills/project-docs/references/post-release-review-template.md)|After something ships, stalls, or gets abandoned and the team needs to preserve what happened.|One per release or abandoned effort|

## Project types they cover
The templates are designed to flex across project shapes — iOS apps, cross-platform Expo apps, backend APIs, open-source libraries, CLIs, almost any coding project. Each section's prompt either applies generically or names how to adapt it for non-UI projects. Sections that genuinely do not apply to a given project should be deleted, not left empty.

## How they relate
- **Documentation placement rules** define which surface owns each kind of document: Linear initiative, Linear project, Linear issue, repo `documents/`, or code-level docs.
- **Testing strategy** defines the project-wide confidence model: test layers, coverage expectations, tools, fixtures, CI, flaky-test handling, and manual checks.
- **Project brief** frames the project. It summarizes the audience, points at the full customer profile, and names the platform dependencies it commits to.
- **Customer profile** owns audience truth. The brief and feature specs reference it instead of re-describing personas.
- **Research brief** owns evidence and source trail. Decisions, dependency docs, briefs, and specs link to it instead of carrying all the research inline.
- **Platform dependency** owns the truth about an external system. Feature specs that touch the dependency link to it.
- **Feature spec** builds on the brief's scope and references the customer profile and platform dependency docs it touches. It owns user stories, acceptance criteria, product behavior, and user-visible rollout.
- **Technical design** builds on the feature spec and testing strategy. It owns implementation structure, state ownership, contracts, failure handling, migration, and the feature-specific testing plan.
- **Decision record** preserves why a direction was chosen. Link it from the doc or issue whose scope, behavior, dependency, cost, or future options changed.
- **Release readiness** collects the evidence for a ship or hold decision. It references the project brief, feature specs, dependency risks, testing strategy, and decision records that affect release.
- **Post-release review** compares what happened against the plan. It should turn useful lessons into follow-up issues or decision records instead of burying them in prose.

The relationship appears in two places:

- `related:` in YAML frontmatter, where automation can validate the referenced files still exist.
- Template comments near the top of each document, where planners and AI agents can see how to use the chain without adding visible boilerplate to finished docs.

Do not add a rendered `## Related documents` section by default. Real docs should link to related docs where the reference helps the reader. The validator checks that these references resolve; it does not enforce relationship types or a minimum set of required related docs.

## Planner guide
Use the templates as a chain, not as independent forms:

1. Start with **documentation placement rules** when a repo or app has more than one possible documentation surface. It prevents early drafts from becoming accidental sources of truth.
2. Add a **testing strategy** when the project needs a shared testing contract before individual features invent their own layers or tools.
3. Write the **project brief**. It defines why the project exists, the scope boundary, success criteria, and the assumptions that matter.
4. Use the **customer profile** for audience detail. Briefs and feature specs should point to it instead of re-creating personas, market notes, or acquisition assumptions.
5. Create **platform dependency** docs for external systems that shape what can be built. Link them from the brief when the project commits to them and from feature specs when a feature relies on them.
6. Write **feature specs** against the brief, customer profile, and dependencies. A feature spec should explain feature behavior, not restate the project thesis or audience model.
7. Use research briefs and decision records when evidence or choices need their own trail, then link them from the doc whose claims depend on them.
8. Use release readiness before shipping and post-release review afterward. These compare shipped reality against the brief, feature specs, testing strategy, dependency risks, and decisions.

The frontmatter `related:` list is for automation and planning context. Inline Markdown links are for readers.

## Conventions
- **Sentence case** for all headings. "Why it should exist", not "Why It Should Exist".
- **YAML frontmatter** at the top of each doc: `title`, `status`, `owner`, `last_updated`, `related`.
- **Avoid generic scope openers.** If the document needs a short orientation, put it directly under the H1. Keep a numbered summary only when summary is the first real section.
- **HTML comments** carry section prompts and planning guidance. Delete prompt comments as sections are filled, or leave them while drafting.
- **`---` between every H2.** Not before the first, not after the last.
- **Mermaid diagrams** are encouraged when they make a flow, state machine, sequence, component boundary, or rollout easier to review.
- **Markdown tables** are encouraged for acceptance criteria, state lists, schema fields, endpoint contracts, rollout phases, dependency limits, risks, and alternatives.
- **Markdown** is formatted with Prettier (`proseWrap: never`) and linted with markdownlint-cli2. Run `bun run check` before committing; `bun run check:fix` to auto-fix.

## Creating a new template
Agents should use the maintenance skill at [skills/create-doc-template/SKILL.md](skills/create-doc-template/SKILL.md). It captures the workflow for researching the document type, trimming the outline, matching the templates already in `skills/project-docs/references/<document-type>-template.md`, and writing section prompts that are useful to both humans and LLMs.

## Status values
- **Active** — maintained template or current rulebook.
- **Draft** — actively being written, expect changes.
- **In review** — content has settled, gathering feedback.
- **Approved** — current source of truth.
- **Archived** — superseded; kept for history.

## Using a template
1. Copy the matching `skills/project-docs/references/<document-type>-template.md` file into the destination repo or doc store.
2. Fill in the frontmatter.
3. Walk the sections top to bottom. Delete a section if it is genuinely not relevant; do not leave it empty.
4. Replace each `<!-- Prompt: ... -->` comment with the content it asks for. The prompts are guidance, not section descriptions; they should not survive into the final doc.
5. When a section describes a flow, decision, matrix, or contract, consider whether a Mermaid diagram or Markdown table would be clearer than prose.
