# Skill Taxonomy

Skills fall into three tiers based on scope and autonomy. Pick the right tier before writing — it shapes everything from the decision tree to allowed-tools.

## Tiers

### Atomic

Does one thing well. Self-contained, no dependencies on other skills, usually maps to one decision tree.

Examples: `git/committing`, `git/conflicts`, `documentation/style`, `security/audit`

Signals you're building an atomic skill:
- The skill handles a single, well-defined task
- It doesn't need to call or reference other skills
- Same input consistently produces the same kind of output
- A user would invoke it with a short, specific request ("write a commit message")

### Workflow

Chains atomic skills in a defined sequence. The path may branch, but the set of possible paths is known upfront.

Examples: `git` (parent routing to children), `documentation/developer-docs` (composes `style` + `knowledge`), `git/clean`

Signals you're building a workflow skill:
- The skill orchestrates multiple steps that always run in the same order
- It references or delegates to atomic skills for individual steps
- Users describe the task as a multi-step goal ("clean up this repo", "write architecture docs")

Workflow skills compose atomics in two ways:
1. **Decision tree routing** — the parent's decision tree sends the user to the right child skill
2. **Cross-skill references** — the skill points to another skill for a specific concern (e.g., "for tone → see `documentation/style`")

### Agent

Goal-driven. Receives an outcome and decides which workflows/atomics to use based on what it discovers. The path is determined at runtime, not prescribed.

Signals you're building an agent skill:
- The approach depends on what the skill finds when it inspects the codebase/context
- Different inputs lead to fundamentally different sequences (not just branching within a fixed flow)
- The skill needs to loop, retry, or change strategy on failure
- Users describe the task as an outcome ("release v2.0", "migrate to the new API")

Agent skills use `Agent` in `allowed-tools` to delegate subtasks to workflows and atomics.

## Choosing a tier

Pick the lowest tier that covers the use case:

1. Can it do its job without other skills? → **atomic**
2. Does it follow a known sequence? → **workflow**
3. Does the sequence depend on runtime context? → **agent**

## Extracting skills downward

Higher-tier skills often contain steps that are valuable on their own. When you spot a reusable piece, extract it into its own lower-tier skill.

### Extracting atomics from workflows

A workflow step that does real work inline (formatting, validation, generation) should become its own atomic when:

- The same logic appears in multiple workflows
- Users want to run just that step without the full workflow
- The step has its own conventions or rules that deserve a dedicated decision tree

Example: `git/committing` started as the commit-writing step inside `git/clean`. Extracted, it became independently useful — any workflow that creates commits can reference it.

### Extracting workflows from agents

A fixed sequence inside an agent skill should become its own workflow when:

- The agent always runs those steps in the same order for a particular sub-goal, regardless of what decisions led there
- Users sometimes want to run just that sequence directly
- Multiple agent skills share the same fixed sequence

**The test:** Could someone invoke this piece on its own and get useful output? If yes, extract it.
