# Tutorials and how-to guides
Use for: getting-started guides, integration tutorials, cookbook recipes, how-to guides, migration guides and ordered learning paths for developers or technical users. Readers learn by doing, so each step must work as written and show it worked.

## Gather first
- **Form:** choose one first. A tutorial teaches a newcomer one guided happy path. A how-to or recipe solves one task for a reader with context. A migration guide moves a reader from version or system A to B; a learning path orders standalone tutorials. Don't mix forms; link between them. Return an unsettled audience or form to the lead with options and a recommendation.
- **Real facts:** commands, APIs, versions, outputs, breaking changes and the reader's starting state, from code, tests, release notes, existing docs or your own run. Never invent one; return anything unconfirmed to the lead marked unverified.

## Structure
1. **Goal:** what the reader will build or achieve, shown as the finished result.
2. **Prerequisites:** versions, accounts, access and starting state, each checkable.
3. **Steps:** one action each, ending in a visible, checkable result such as expected output or a passing test. Long tutorials add checkpoints stating what works and the complete code so far.
4. **Verify:** one end-to-end check that proves the goal.
5. **Next steps:** the next tutorial, related how-tos, reference and explanation.

A migration guide lists breaking changes up front, shows before/after code for each, and gives a rollback route with its point of no return.

## Rules
- Code is complete and runnable, with imports, file paths and pinned versions. No hidden steps.
- Commands run as pasted: no shell prompts; state the directory and environment.
- Use realistic fake data and placeholders such as `<API_KEY>`, naming where the real value lives. Never include real secrets or personal data.
- Build complexity progressively, one new concept per step.
- Link to reference or explanation instead of explaining every option inline.
- Name the targeted product version. When behavior changes, update steps and outputs; label upcoming behavior as proposed.
- Follow the destination's existing structure; do not impose a template it lacks.

## Check before handing back
- Where the brief permits, run the steps from a clean starting state using the project's own tools, comparing each output with the documented one. Don't use real credentials, paid resources or shared systems unless authorized.
- In your handoff, not a separate report, list which steps were executed, only reviewed or unverified. Never claim the guide works without evidence. For laborious runs, ask the lead for a [QA / verification specialist](../presets/qa-verifier.md).
- A reader at the stated starting level could finish without asking the author.

## Boundaries
End-user help articles, API reference and UI microcopy are out of scope. Document the product as it exists; return suggested product or API changes to the lead as proposals. Save in the project's existing docs home ([knowledge-and-planning.md](../knowledge-and-planning.md)), and update an existing guide rather than creating a parallel one.
