---
name: project-docs
description: Writes and edits project documents from the project-docs templates. Use when the user asks for a project brief, feature spec, technical design, decision record, research brief, platform dependency doc, customer profile, testing strategy, release readiness doc, post-release review, documentation placement rules, or is filling one of those project document templates.
---

# Project Docs
Use this skill to select the right project document template, write the document, and keep the project-docs chain linked without duplicating ownership across docs.

Do not use this skill to add or change the template library itself. For template maintenance in this repo, use `create-doc-template`.

## Decision tree
- What is the user asking for?
  - **Where planning, repo, and code docs should live** -> use documentation placement rules and read `references/documentation-placement-rules-template.md`.
  - **A shared project testing contract** -> use testing strategy and read `references/testing-strategy-template.md`.
  - **Project kickoff, framing, scope, or success criteria** -> use project brief and read `references/project-brief-template.md`.
  - **Audience, personas, market notes, alternatives, or customer assumptions** -> use customer profile and read `references/customer-profile-template.md`.
  - **Evidence, source trail, or a focused research question** -> use research brief and read `references/research-brief-template.md`.
  - **External API, OS framework, hardware, vendor, model, protocol, or service risk** -> use platform dependency and read `references/platform-dependency-template.md`.
  - **User stories, acceptance criteria, product behavior, lifecycle, or rollout behavior** -> use feature spec and read `references/feature-spec-template.md`.
  - **Implementation architecture, state ownership, contracts, migrations, rollout mechanics, or failure modes** -> use technical design and read `references/technical-design-template.md`.
  - **A choice already made, alternatives rejected, or trade-off accepted** -> use decision record and read `references/decision-record-template.md`.
  - **Ship, hold, launch risk, test evidence, phased rollout, or rollback decision** -> use release readiness and read `references/release-readiness-template.md`.
  - **What happened after a release, rollback, stalled effort, or abandoned effort** -> use post-release review and read `references/post-release-review-template.md`.
  - **Adding or changing project-docs templates in this repo** -> use `create-doc-template` instead.
  - **Something else** -> ask one short question to choose between product behavior, implementation design, evidence, decision history, release evidence, and project framing.

## Workflow
1. Read `../../README.md` for shared conventions, relationship rules, status values, and the project-docs chain.
2. Pick exactly one document type from the decision tree unless the user explicitly asks for a document set.
3. Read the matching template reference before drafting or editing.
4. Gather only the information the chosen document owns. Link to other project docs instead of restating their content.
5. Keep uncertainty visible. Mark assumptions, gaps, missing evidence, and open questions directly.
6. Use tables or Mermaid diagrams when states, roles, flows, contracts, evidence, risks, or alternatives are easier to review structurally.
7. Fill or update `related:` frontmatter when linked documents exist or are planned.
8. Remove prompt comments from sections you fill. Leave comments only while a document is still being drafted.

## Document selector
|Document|Use when|Owns|Link instead of duplicating|
|---|---|---|---|
|Documentation placement rules|A repo, app, product area, or initiative has more than one plausible documentation surface.|Placement decisions, ownership expectations, review triggers, and cross-linking conventions.|Project scope, feature behavior, technical designs, release checks, and reviews.|
|Testing strategy|A project needs one shared testing contract across features, packages, services, and releases.|Test layers, coverage expectations, tools, fixtures, CI integration, flaky-test handling, and manual checks.|Feature-specific implementation tests and launch evidence.|
|Project brief|A project is starting and needs a compact anchor before commitment.|Project purpose, principles, scope boundary, success criteria, assumptions, and open questions.|Audience detail, feature behavior, dependency analysis, technical implementation, and release evidence.|
|Customer profile|There is a rough sense of who the project is for and the team needs durable audience context.|Audience segments, use contexts, alternatives, value, market notes, assumption risks, and open questions.|Project justification, feature behavior, and evidence trails.|
|Research brief|Evidence needs its own source trail before a product, dependency, or implementation decision.|Research question, source trail, findings, evidence quality, implications, risks, recommendation, and follow-up questions.|Decisions, implementation plans, and dependency contracts.|
|Platform dependency|The product builds on an external API, OS framework, hardware capability, vendor, model, protocol, or service.|Capabilities, limits, interface shape, versions, behavior, cost, fallback, monitoring, risks, and exit strategy.|Product scope, feature behavior, and adoption rationale.|
|Feature spec|A feature has real product scope and needs behavior defined before implementation.|User stories, acceptance criteria, product behavior, model concepts, lifecycle, edge cases, telemetry needs, rollout, and non-goals.|Project thesis, audience detail, dependency analysis, implementation architecture, and release evidence.|
|Technical design|Product scope is clear enough to choose implementation shape.|Goals, non-goals, implementation structure, state ownership, contracts, failure handling, migration, rollout, testing plan, alternatives, and open questions.|Product behavior, shared testing rules, and durable decisions.|
|Decision record|A product, technical, operational, or process direction has been chosen and future work may need the rationale.|Decision, context, options, chosen direction, trade-offs, follow-up work, and review trigger.|Deep research, implementation plans, and feature behavior.|
|Release readiness|A release, feature, service change, library version, CLI update, or infrastructure change is being evaluated for ship or hold.|Ship scope, operational scope, known risks, test evidence, support and docs checks, privacy or security checks, rollout, rollback, and launch decision.|Product behavior, testing expectations, and lessons learned.|
|Post-release review|Something shipped, stalled, rolled back, or was abandoned and the team needs to preserve what happened.|Outcome, plan changes, what worked, what did not, preserved decisions, debt created, and follow-up issues.|Launch evidence, product behavior, and precedent.|

## Routing rules
- Use a project brief before feature specs when scope, purpose, or success criteria are still unclear.
- Use a feature spec before technical design when user-visible behavior or acceptance criteria are unsettled.
- Use a technical design before a decision record when the options have not been reviewed yet.
- Use a research brief for source detail; use a decision record for the choice made from that evidence.
- Use platform dependency for durable external-system truth; use research brief for a focused investigation that supports it.
- Use testing strategy for project-wide expectations; use technical design for feature-specific test plans; use release readiness for actual release evidence.
- Use release readiness before shipping; use post-release review only after there is an outcome to review.

## References
|Reference|Document type|
|---|---|
|`references/documentation-placement-rules-template.md`|Documentation placement rules|
|`references/testing-strategy-template.md`|Testing strategy|
|`references/project-brief-template.md`|Project brief|
|`references/customer-profile-template.md`|Customer profile|
|`references/research-brief-template.md`|Research brief|
|`references/platform-dependency-template.md`|Platform dependency|
|`references/feature-spec-template.md`|Feature spec|
|`references/technical-design-template.md`|Technical design|
|`references/decision-record-template.md`|Decision record|
|`references/release-readiness-template.md`|Release readiness|
|`references/post-release-review-template.md`|Post-release review|
