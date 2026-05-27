---
title: Documentation placement rules
status: Active
owner: Luca Silverentand
last_updated: 2026-05-15
related:
  - project-brief.md
  - customer-profile.md
  - testing-strategy.md
  - research-brief.md
  - platform-dependency.md
  - feature-spec.md
  - technical-design.md
  - decision-record.md
  - release-readiness.md
  - post-release-review.md
---

# Documentation placement rules
<!-- Prompt: Use this once per app, product area, or repo when contributors need a stable rulebook for where planning and reference docs live. The goal is to remove guessing. Keep the rules concrete enough that a new contributor can place a document without asking where it belongs. -->

<!-- Relationship guide for planners/AI: This is a meta-template. It does not replace the project brief, customer profile, testing strategy, feature spec, technical design, research brief, decision record, release readiness, or post-release review. It tells people where those docs should live and why. Link the filled version from the app initiative, the repo README, and any project kickoff issue. -->

## 1. Summary
<!-- Prompt: In one short paragraph, define the app, product area, repo, or team this placement rulebook covers. Name the default planning surface and the default versioned-doc surface. If the rulebook only applies during a certain phase, say that here. -->

Use these rules to decide where a document belongs before writing it. The rule is not "put docs wherever the first draft started." The rule is: pick the surface that matches the document's lifespan, audience, review path, and need to change with code.

---

## 2. Surfaces in use
<!-- Prompt: Delete surfaces this app or repo does not use. Add any extra surfaces that are real sources of truth, such as support knowledge bases, design files, dashboards, or package registries. Keep only surfaces someone is expected to maintain. -->

|Surface|Level|Use it for|Why this surface exists|
|---|---|---|---|
|Linear initiatives|Initiative|App-level or product-line direction that spans more than one project.|Initiative docs keep long-running direction next to the work it funds and sequences.|
|Linear projects|Project|Project briefs, milestone plans, launch state, and project-level decisions.|Project docs stay visible to planning, status, and ownership discussions.|
|Linear issues|Issue|Task-specific investigation notes, clarifications, and acceptance details for one piece of work.|Issue context should travel with the work item and close with it.|
|Linear documents|Initiative, project, or issue|Narrative planning docs that need comments, lightweight edits, or broad planning visibility.|Linear is the collaboration layer for planning and review before code changes exist.|
|Repo `documents/` folder|Repo|Versioned templates, technical designs, decision records, dependency docs, and product docs that should change with code.|Repo docs get branch history, PR review, and code-adjacent ownership.|
|Code-level docs|Module, package, API, or command|READMEs, doc comments, inline notes, generated reference, and examples tied to implementation.|Code-level docs should change in the same diff as the behavior they explain.|

---

## 3. Document placement rules
<!-- Prompt: This table is the contract. Add or remove rows until it covers the document types contributors actually create. Each row must answer "if this kind of doc, then that surface" and include the reason, so the rule survives turnover. -->

|If the document is...|Primary home|Level|Link it from|Reason|
|---|---|---|---|---|
|Initiative charter, app strategy, or product-line thesis|Linear initiative document|Initiative|Project briefs and project kickoff issues|The audience is broader than one project, and the document should move with initiative planning.|
|Project brief or project-level scope|Linear project document by default; repo `documents/project-brief.md` when the repo needs a versioned copy|Project or repo|Initiative, feature specs, and kickoff issues|Planning needs visibility in Linear, but code-coupled scope needs review history with the repo.|
|Customer profile, market notes, or audience assumptions|Linear project or initiative document; repo `documents/customer-profile.md` only when the repo owns the product truth|Project, initiative, or repo|Project brief and feature specs|Audience truth changes as planning learns; only version it with code when the product repo is the canonical owner.|
|Testing strategy|Repo `documents/testing-strategy.md` when testing choices should change with code; Linear project or initiative document when the strategy is a planning commitment across repos|Repo, project, or initiative|Technical designs, release readiness, and PR descriptions when testing expectations affect review|The project needs one confidence model so feature-level plans can point to it instead of re-arguing layers, tools, fixtures, and CI gates.|
|Research brief or evidence trail|Linear project or initiative document; repo `documents/research-brief.md` when the evidence supports a code or product contract|Project, initiative, or repo|Decision records, feature specs, and dependency docs|Research should be near the decision it informs, with enough source trail for review.|
|Platform dependency analysis|Repo `documents/platform-dependency.md` when the dependency shapes implementation; Linear initiative or project document when it is a strategic vendor choice|Repo, initiative, or project|Project brief, feature specs, release readiness|Dependency risk often affects both planning and code; place it where the lasting owner will notice changes.|
|Feature spec or acceptance criteria|Linear project document for broad product review; Linear issue for small scoped work; repo `documents/feature-spec.md` when behavior should be versioned with code|Project, issue, or repo|Implementation issues, technical design, and release readiness|Product behavior needs stakeholder review first; durable behavior should also live where code reviewers can maintain it.|
|Technical design or architecture plan|Repo `documents/technical-design.md` once it affects implementation; Linear project document while options are still being shaped|Repo or project|Feature spec, PR description, decision records|Engineering choices need PR review and code history when they become build commitments.|
|Decision record|Repo `documents/decision-record.md` for product, technical, dependency, or process decisions that create precedent; Linear issue or project comment for local task decisions|Repo, project, or issue|The affected docs, PR, and follow-up issues|Decisions are only useful later if they sit where future reviewers will look for the reason.|
|Release readiness|Linear project document by default; repo `documents/release-readiness.md` when release evidence is tied to a versioned artifact|Project or repo|Release issue, PR, changelog, and post-release review|Launch state belongs with project coordination; shipped contracts may need repo history.|
|Post-release review|Linear project document by default; repo `documents/post-release-review.md` when lessons should travel with the codebase|Project or repo|Initiative, project, decision records, and follow-up issues|Retrospectives should feed planning, but codebase-specific lessons should be easy to find from the repo.|
|Runbook, support handoff, or operator procedure|Repo docs or code-level docs when tied to implementation; Linear project document for temporary launch handoff|Repo, module, or project|Release readiness and owner handoff issue|Operational docs age badly when separated from the thing they operate.|
|README, API reference, examples, or doc comments|Code-level docs|Repo, package, module, API, or command|Technical design when extra context is needed|Reader-facing implementation docs should be reviewed in the same change as the interface.|
|Temporary investigation notes|Linear issue comment, then promote the durable facts to the right doc|Issue|Final doc or decision record|Scratch work should not become a second source of truth.|

---

## 4. Ownership and review expectations
<!-- Prompt: Fill this table with names, roles, or teams. "Everyone" is not an owner. If the owner changes by surface, keep the rule explicit. -->

|Surface|Owner|Review before changing|Keep current by|
|---|---|---|---|
|Linear initiative documents|Initiative owner|Initiative stakeholders and project owners|Reviewing at initiative kickoff, major scope changes, and initiative closeout.|
|Linear project documents|Project owner|People accountable for scope, delivery, and launch|Updating when project scope, dates, risks, or release state change.|
|Linear issue comments and issue-linked docs|Issue assignee|Reviewer for the issue or PR when the note affects acceptance|Summarizing durable findings into the parent doc before closing the issue.|
|Repo `documents/` folder|Repo owner or area owner|Code owners or the people accountable for the product contract|Requiring PR review and updating related frontmatter when links change.|
|Code-level docs|Module, package, or API owner|Same reviewers as the code path|Changing docs in the same PR as the behavior or interface.|

---

## 5. Cross-linking conventions
<!-- Prompt: Keep these conventions specific to the surfaces you use. The test is whether someone can move from a Linear issue to the canonical doc, then from the doc to the relevant code or PR, without guessing. -->

- Link the canonical document, not a copied summary. If a short summary is needed in another place, include one or two lines and point back to the source.
- Linear initiatives link to the project documents and repo docs that carry durable scope, dependency, or decision context.
- Linear projects link to the initiative, the repo, release docs, and open issues that need document updates.
- Linear issues link to the smallest document that sets the boundary for the work. Avoid linking the whole document chain unless each link changes the task.
- Repo docs use `related:` frontmatter for repo-local Markdown files that automation can validate.
- Repo docs use inline Markdown links when the reader needs to open a related doc at that point in the text.
- PR descriptions link the Linear issue and any repo docs changed or used as acceptance context.
- Decision records link the research, project, feature, dependency, issue, or PR that forced the decision.

---

## 6. What does not belong anywhere
<!-- Prompt: Add local exclusions. For each one, say what to do instead so people do not create unofficial hiding places. -->

|Content|Do this instead|Reason|
|---|---|---|
|Secrets, credentials, tokens, private keys, or recovery codes|Store them in the approved secret manager and link only to the access process.|Docs are copied, indexed, exported, and reviewed by more people than secrets should reach.|
|Raw personal data, unredacted customer material, or interview transcripts|Put the raw material in the approved research or support system; document only the sanitized finding and source location.|Planning docs need evidence, not unnecessary exposure of private data.|
|Duplicated copies of a canonical doc|Replace the copy with a link and a short local note if context is needed.|Duplicate docs drift and make reviewers check the wrong source.|
|Unverified claims, guesses, or uncited market numbers|Mark them as assumptions or move them into a research brief with sources.|Readers need to know which statements are evidence and which are bets.|
|"Maybe later" feature ideas with no owner or trigger|File a Linear suggestion issue or delete the note.|Backlog-shaped notes need triage, ownership, and a reason to revisit.|
|Old decisions with no current owner and no review trigger|Archive them or replace them with a decision record that names the current rule.|A stale decision without a trigger is worse than no decision because it looks authoritative.|

---

## 7. Review trigger for these rules
<!-- Prompt: Name the signals that force this rulebook to change. Include both scheduled review and event-based review. -->

Review these placement rules when any of the following happens:

- A new documentation surface becomes a real source of truth.
- Contributors ask more than once where a recurring document type belongs.
- A project review finds that work was delayed because docs were split, duplicated, or hidden.
- A document type appears that does not fit the table in section 3.
- A repo starts or stops owning product truth for an app, package, API, or operational process.
- An initiative or project closes and the team has to decide what stays durable.
- Ownership changes for the initiative, project, repo, or module.

At minimum, review this rulebook during initiative kickoff and after the first release that used it.
