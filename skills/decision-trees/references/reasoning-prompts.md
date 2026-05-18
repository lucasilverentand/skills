# Reasoning Prompts
Decision trees tell you *what* to evaluate. Reasoning prompts tell you *how* to think about it — without telling you what to conclude. They're the preamble that orients the reader before they enter the tree.

This matters because both agents and humans tend to anchor on the first branch that looks plausible. A good reasoning prompt slows them down just enough to evaluate properly, without doing the evaluation for them.

## When to include reasoning prompts
- **Always for trees embedded in skills** — agents benefit most from explicit reasoning scaffolding
- **For complex trees** (>2 levels, judgment-heavy conditions) — the harder the tree, the more the reader needs orientation
- **Optional for simple trees** (binary checks, mechanical conditions) — a tree that asks "does the file exist? yes/no" doesn't need a reasoning prompt

## What a reasoning prompt includes
Place it between the tree's heading and the first branch. It has three parts:

1. **Frame the problem** — one sentence on what the reader is trying to determine and why it matters. This prevents tunnel vision on a single branch. "You're determining why the build failed. The cause dictates both the fix and whether you need to notify anyone, so misclassification is costly."
2. **Name the key signals** — what information should the reader gather *before* entering the tree? Commands to run, files to read, state to inspect. This front-loads evidence gathering so the reader has facts in hand when they hit the first branch, rather than gathering evidence to confirm a branch they already picked. "Before starting: read the full build log (`gh run view --log-failed`), note the first error (not the last), and check whether the same build passed on the previous commit."
3. **Call out the common mistake** — what do people (and agents) typically get wrong with this tree? Name the specific trap. "Common mistake: jumping to 'dependency error' because the log mentions a package name — read the actual error type, not just the nouns in the message."

## What a reasoning prompt must NOT include
- **The answer** — "this is usually a dependency issue" biases the reader toward that branch regardless of evidence
- **Condition summaries** — don't preview the branches. The tree is right there — the prompt shouldn't be a second table of contents
- **Instructions to think carefully** — generic "be thorough" or "consider all options" adds nothing. Name the specific failure mode instead

## Example
```markdown
## Build failure triage

You're determining why the CI build failed so you can apply the right fix. Misdiagnosis
means wasted time on the wrong fix and a second failed build.

Before starting: run `gh run view --log-failed` and find the **first** error in the output
(cascading failures mean the last error is usually a symptom, not the cause). Also check
if the previous commit's build passed — that narrows the cause to what changed.

Common trap: the log mentions a package name and you jump to "dependency error." Read the
error type — a TypeScript error that references a package is a compilation error, not a
dependency error.

- What is the first error in the build log?
  - **"Could not resolve" / "ERESOLVE" / "No matching version"** -> dependency resolution failure ...
  - **"TS2XXX" / "Type error" / "Cannot find module"** -> TypeScript compilation error ...
  - ...
```

## Reasoning prompts in chained trees
For chains, each tree gets its own reasoning prompt. Later trees should reference the carry-forward context from earlier trees:

"You've already classified this as a rollout failure (from the Classify tree). Now you're finding the specific cause. The carry-forward context tells you the pod status — start from there rather than re-checking the pipeline."

This prevents agents from re-deriving what was already established while still requiring them to walk the new tree's branches properly.
