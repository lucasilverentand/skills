# Decision Tree Conventions

## Format

Indented markdown bullet lists. Questions are plain text, conditions are bold, outcomes use `→` arrows.

```markdown
- What is the situation?
  - **Condition A** → take action A
  - **Condition B** → ask a follow-up question
    - **Sub-condition X** → take action X
    - **Sub-condition Y** → take action Y
  - **Condition C** → take action C
```

## How agents must use decision trees

When following a decision tree, the agent must explicitly walk through every node in writing. At every branch:

1. **State the question** — write out the current decision node
2. **Evaluate the answer** — reason about which branch applies and why
3. **Commit to the branch** — state the chosen path before moving to the next node
4. **Repeat** until reaching a leaf action

This creates a visible reasoning trace. Example:

> **Is the test flaky?** I re-ran the test 3 times — it passed twice and failed once. Yes, it's flaky.
>
> **Is there shared state between tests?** Looking at the test file, it uses a module-level variable that isn't reset in beforeEach. Yes, shared state.
>
> → Reset fixtures between test runs using beforeEach.

Never skip steps. Never collapse multiple decisions into one. Every question gets a written answer.

## Writing good decision trees

- **Start with the trigger** — what activates this skill? What does the agent observe first?
- **Ask diagnostic questions** — each branch narrows the problem space
- **Use concrete conditions** — "Does the file have a default export?" not "Is the file structured well?"
- **Leaf nodes are actions** — every terminal branch says exactly what to do
- **Cover the 80% cases** — don't enumerate every edge case, handle the common paths
- **3-4 levels deep** — ideal depth. 5 is the max before it gets unwieldy
- **Reference tools** — when a branch needs a tool: "→ run `tools/coverage-gaps.ts`"
- **Reference references** — when a branch needs detail: "→ see `references/foo.md`"

## Placement

- **Short trees** (under ~20 lines) → inline in SKILL.md
- **Longer trees** → standalone file in `references/` (e.g. `references/decision-tree.md`)

When a tree lives in `references/`, the SKILL.md must point to it explicitly.
