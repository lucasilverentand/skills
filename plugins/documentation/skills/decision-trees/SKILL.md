---
name: decision-trees
description: Creates decision trees that both humans and AI agents can follow reliably — captures expert knowledge as branching logic with concrete conditions, clear actions, and visible reasoning traces. Use when the user wants to document a decision process, create a troubleshooting guide, build a triage flowchart, write an escalation tree, or turn tribal knowledge into structured steps.
allowed-tools: Read Grep Glob Bash Write Edit Agent
---

# Decision Trees

Create decision trees that work for two audiences at once: humans scanning for the right path, and AI agents that must walk every node and show their reasoning.

## Current context

- Repo: !`basename $(git rev-parse --show-toplevel) 2>/dev/null || echo "not in a repo"`
- Root: !`git rev-parse --show-toplevel 2>/dev/null || pwd`

## Decision tree

- What are you doing?
  - **Creating a new decision tree from scratch** -> follow "Authoring a tree" below
  - **Converting an existing document into a decision tree** -> what format is the source?
    - **Prose runbook or wiki page** -> read the source, extract the branching logic (look for "if", "when", "in case of", conditional paragraphs), then follow "Authoring a tree" with the extracted structure
    - **Flowchart or diagram** -> read or view the source, map each node to a condition/action pair, then follow "Authoring a tree"
    - **Checklist or numbered steps** -> determine if the steps are truly sequential or contain hidden branches (steps like "if X, skip to step 7"). Extract the branches, then follow "Authoring a tree"
  - **Reviewing or improving an existing decision tree** -> follow "Reviewing a tree" below
  - **Problem is too big for a single tree** (>4 levels deep, multiple phases, or the tree covers distinct stages of a process) -> follow "Chaining trees" below
  - **User wants to understand the decision tree format** -> show them `references/format.md`

## Authoring a tree

### 1. Capture the domain

Before writing anything, understand the decision space:

1. **What triggers this tree?** — what situation does someone encounter that sends them here? (e.g., "CI is failing", "customer reports data loss", "new service needs a database")
2. **What are the possible outcomes?** — enumerate the leaf actions. Every path through the tree must end in a concrete action, not a vague suggestion.
3. **What information disambiguates?** — what questions or checks separate one outcome from another? These become your branch conditions.
4. **Who follows this tree?** — humans only, agents only, or both? This affects how much context to embed at each node.

If the conversation already contains this knowledge (e.g., the user described their process), extract it rather than re-asking. Only ask about gaps.

### 2. Structure the tree

Build the tree top-down, starting from the trigger:

1. **Root question** — the first thing to evaluate. Should be the highest-signal discriminator (the question that eliminates the most paths).
2. **Branch conditions** — concrete, observable, testable. "Is the error a 5xx?" not "Is the server unhealthy?". Each condition at a given level must be mutually exclusive.
3. **Leaf actions** — every terminal branch states exactly what to do. Include: the action, any commands or tool invocations, and what "done" looks like.
4. **Depth check** — if any path goes deeper than 4 levels, the tree is probably trying to do too much. Split it into sub-trees or simplify the conditions.

See `references/format.md` for the exact syntax.

### 3. Write the reasoning prompt

If the tree is embedded in a skill or covers complex/judgment-heavy decisions, write a reasoning prompt before the first branch. See "Reasoning prompts" below for the full guide. The prompt should frame the problem, name key signals to gather before entering the tree, and call out the common mistake — without biasing toward any branch.

Skip this for simple mechanical trees where every condition is a clear boolean check.

### 4. Write the tree

Follow these principles:

**Conditions must be observable.** Each branch condition should be something the reader (human or agent) can check right now — run a command, read a value, inspect a state. "Is the service degraded?" is not observable. "Does `curl -s /health` return a non-200 status?" is.

**Actions must be complete.** A leaf node isn't "fix the configuration" — it's "edit `config/production.yml`, set `max_connections` to 100, then restart with `systemctl restart app`". The person following the tree shouldn't need to figure out *how* to do the action.

**Add reasoning hints for agents.** When a condition requires judgment (not just a boolean check), add a brief note about what to look for. This helps agents produce useful reasoning traces without turning every node into a paragraph.

**Cover the fallback.** Every set of sibling conditions needs a catch-all: "**None of the above**" or "**Something else**" that either escalates or points to a different resource.

### 5. Place the tree

- **Standalone document** — write to the location the user specifies, or suggest a sensible default based on the repo structure (e.g., `docs/decision-trees/`, `.context/`, or alongside the code it relates to)
- **Inside a SKILL.md** — if this tree is for an agent skill, put short trees (<20 lines) inline under a `## Decision tree` heading, longer trees in `references/`
- **README or runbook** — embed under a clear heading so it's scannable

### 6. Validate

Walk the tree yourself before delivering it:

1. **Completeness** — pick 3-5 real scenarios the tree should handle. Trace each one through the tree. Does every scenario reach a leaf action?
2. **Mutual exclusivity** — at each branch point, can only one condition be true? If two conditions could both match, the tree is ambiguous.
3. **Observability** — can every condition be evaluated without prior knowledge? If a condition requires context not available at that point, restructure.
4. **Depth** — no path exceeds 4 levels. If it does, split or simplify.
5. **Fallbacks** — every branch set has a catch-all.

## Reviewing a tree

When asked to review or improve an existing decision tree:

1. Read the tree and identify its purpose (trigger, audience, outcomes)
2. Check each quality dimension:
   - **Dead branches** — paths that can never be reached because an earlier condition already caught them
   - **Ambiguous conditions** — branches where two conditions could both be true
   - **Vague actions** — leaf nodes that say what to do but not how
   - **Missing paths** — scenarios that should be covered but have no branch
   - **Unobservable conditions** — branches that require information the reader doesn't have at that point
   - **Too deep** — paths that go beyond 4 levels
3. Report findings as a table: `| Issue | Location | Suggestion |`
4. If the user wants fixes, apply them directly

## Reasoning prompts

Decision trees tell you *what* to evaluate. Reasoning prompts tell you *how* to think about it — without telling you what to conclude. They're the preamble that orients the reader before they enter the tree.

This matters because both agents and humans tend to anchor on the first branch that looks plausible. A good reasoning prompt slows them down just enough to evaluate properly, without doing the evaluation for them.

### When to include reasoning prompts

- **Always for trees embedded in skills** — agents benefit most from explicit reasoning scaffolding
- **For complex trees** (>2 levels, judgment-heavy conditions) — the harder the tree, the more the reader needs orientation
- **Optional for simple trees** (binary checks, mechanical conditions) — a tree that asks "does the file exist? yes/no" doesn't need a reasoning prompt

### What a reasoning prompt includes

Place it between the tree's heading and the first branch. It has three parts:

1. **Frame the problem** — one sentence on what the reader is trying to determine and why it matters. This prevents tunnel vision on a single branch. "You're determining why the build failed. The cause dictates both the fix and whether you need to notify anyone, so misclassification is costly."

2. **Name the key signals** — what information should the reader gather *before* entering the tree? Commands to run, files to read, state to inspect. This front-loads evidence gathering so the reader has facts in hand when they hit the first branch, rather than gathering evidence to confirm a branch they already picked. "Before starting: read the full build log (`gh run view --log-failed`), note the first error (not the last), and check whether the same build passed on the previous commit."

3. **Call out the common mistake** — what do people (and agents) typically get wrong with this tree? Name the specific trap. "Common mistake: jumping to 'dependency error' because the log mentions a package name — read the actual error type, not just the nouns in the message."

### What a reasoning prompt must NOT include

- **The answer** — "this is usually a dependency issue" biases the reader toward that branch regardless of evidence
- **Condition summaries** — don't preview the branches. The tree is right there — the prompt shouldn't be a second table of contents
- **Instructions to think carefully** — generic "be thorough" or "consider all options" adds nothing. Name the specific failure mode instead

### Example

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

### Reasoning prompts in chained trees

For chains, each tree gets its own reasoning prompt. Later trees should reference the carry-forward context from earlier trees:

"You've already classified this as a rollout failure (from the Classify tree). Now you're finding the specific cause. The carry-forward context tells you the pod status — start from there rather than re-checking the pipeline."

This prevents agents from re-deriving what was already established while still requiring them to walk the new tree's branches properly.

## Chaining trees

Single trees work for isolated decisions, but real problems often span multiple phases — diagnose, then fix, then verify. Or the problem space is too wide to fit in one tree without hitting the depth limit. Chaining lets you decompose these into a sequence of focused trees that hand off to each other.

### When to chain vs. when to keep it in one tree

- **One tree**: the problem has a single trigger, the conditions don't change mid-process, and the depth stays under 4. Most decision problems fit here.
- **Chain of trees**: the problem has distinct phases where the output of one phase changes the conditions for the next (e.g., diagnosis → remediation → verification). Or a single tree would exceed 4 levels because the problem genuinely has that much branching — not because the conditions are too vague.

Don't chain to avoid writing better conditions. If the tree is too deep because conditions are broad ("is it a frontend issue?"), sharpen the conditions first.

### Structure of a chain

A chain is a set of trees with explicit handoff points. See `references/chaining.md` for the full format and examples. The key mechanics:

1. **Each tree is self-contained** — it has its own root question, conditions, and leaf actions. A reader should be able to follow one tree without having read the others.
2. **Leaf actions hand off to the next tree** — instead of (or in addition to) a terminal action, a leaf says "→ continue with Tree 2" or "→ follow the remediation tree below." The handoff names the next tree and passes any context it needs.
3. **Context carries forward explicitly** — the handoff states what was determined in the current tree that the next tree needs. "→ continue with the remediation tree — the issue is a stale DNS cache on the edge nodes." Don't make the next tree re-derive what the previous tree already figured out.
4. **Trees in a chain share a namespace** — name them clearly so handoffs are unambiguous. Use a numbering scheme or phase names: "Tree 1: Diagnosis", "Tree 2: Remediation", "Tree 3: Verification".

### Authoring a chain

1. **Map the phases** — before writing any tree, identify the distinct phases of the problem. Each phase should have a clear entry condition ("we know X") and exit condition ("we've determined Y" or "we've completed action Z").
2. **Write each tree independently** — follow the normal "Authoring a tree" workflow for each. Validate each tree on its own.
3. **Write the handoffs** — connect the trees. Every leaf in Tree N that continues the chain must name Tree N+1 and state the context being passed.
4. **Write the chain overview** — a short section above the trees that maps the phases and shows the flow. This is for humans scanning the document to orient themselves before diving into a specific tree.
5. **Validate the chain end-to-end** — trace 3-5 scenarios through the entire chain, crossing tree boundaries. Check that the context passed at handoffs is sufficient for the next tree's root question.

### Chain overview format

Place this above the individual trees so readers can see the full flow:

```markdown
## Chain overview

1. **Diagnose** — determine what's failing and why → produces a diagnosis
2. **Remediate** — fix the issue based on the diagnosis → produces a fix
3. **Verify** — confirm the fix worked and no regressions were introduced
```

Each tree then lives under its own heading below the overview.

### Agent behavior in chains

Agents follow each tree using the standard pro/con evaluation protocol. At a handoff point, the agent must:

1. **Summarize the carry-forward context** — state what was determined in the current tree, in its own words (not just copying the handoff text). This forces the agent to verify it actually reached a conclusion.
2. **Enter the next tree at its root** — don't skip nodes in the next tree even if the carry-forward context seems to make some branches obvious. The pro/con evaluation still applies.
3. **Maintain the full trace across trees** — the reasoning trace doesn't reset at a tree boundary. The agent should reference prior conclusions when evaluating conditions in later trees.

## Agent trace protocol

When an agent follows a decision tree (including the one in this skill), it must produce a visible reasoning trace. At every branch point, the agent works through a structured pro/con evaluation in its thinking:

### The evaluation protocol

At each set of sibling conditions, the agent must — in its thinking/scratchpad — evaluate **every** sibling, not just the one that looks right at first glance:

1. **State the question** — write out the decision node being evaluated
2. **Pro/con each condition** — for every sibling at this level:
   - **Evidence for**: what observable facts support this condition being true? (command output, file contents, error messages, state)
   - **Evidence against**: what observable facts contradict this condition? What would you expect to see if this were true that you don't see?
   - **Verdict**: matches / does not match / uncertain
3. **Resolve** — if exactly one condition matches, commit to it. If multiple match, the tree has an ambiguity problem — note it and pick the most specific. If none match, take the fallback branch. If uncertain between two, **dispatch a research agent** before committing (see "Dispatching research agents" below).
4. **Commit** — state the chosen branch and the key differentiator that made it win over the alternatives
5. **Repeat** until reaching a leaf action, then execute it

### Dispatching research agents

When the pro/con evaluation leaves you uncertain — two conditions look equally plausible, you lack the evidence to rule one out, or a condition requires domain knowledge you don't have — don't guess. Dispatch a research agent to gather the missing evidence before committing to a branch.

**When to dispatch:**
- A verdict comes back "uncertain" and you can't resolve it by running a quick command or reading a file yourself
- The condition requires context from outside the immediate codebase (docs, APIs, external systems, prior incidents)
- Multiple conditions have strong "evidence for" and you need a deeper investigation to find the differentiator
- You're about to take an action at a leaf node but aren't confident the diagnosis was correct — send an agent to verify before acting

**How to dispatch:**
- Give the agent a focused question, not the whole tree. "Is this a DNS resolution failure or a TLS handshake timeout? Check the error pattern in the logs at X and compare against these two signatures." Not "figure out what's wrong."
- Include the evidence you already have so the agent doesn't re-derive it
- Run multiple research agents in parallel when the unknowns are independent (e.g., one agent checks logs while another checks configuration)
- Wait for the agent's findings, then return to the pro/con table and re-evaluate with the new evidence

**What NOT to delegate:**
- The decision itself — the research agent gathers evidence, the main agent evaluates it against the tree. Don't ask the agent "which branch should I take?"
- The full tree walk — dispatching an agent to "follow this decision tree" defeats the purpose. The main agent owns the trace.

The goal is to make the tree evaluation evidence-based rather than speculative. A 30-second research agent that returns a definitive answer is always better than a confident guess that sends you down the wrong branch.

### Why pro/con and not just "pick the match"

An agent that only argues *for* its choice can rationalize anything. An agent that must also argue *against* every alternative catches its own mistakes — if it can't explain why a sibling doesn't apply, it's probably on the wrong branch. The pro/con structure forces genuine evaluation rather than pattern-matching on the first plausible option.

### What goes where

- **Thinking/scratchpad**: the full pro/con table for every sibling. This is the rigorous evaluation.
- **Visible output**: only the chosen branch and its justification. Keep it clean for the human reading the trace.

### Example trace (in thinking)

> **Question: What HTTP status is the error?**
>
> | Condition | Evidence for | Evidence against | Verdict |
> |---|---|---|---|
> | **4xx client error** | Status is 422, which is 4xx | — | Matches |
> | **5xx server error** | — | Status is 422, not 5xx | Does not match |
> | **Network timeout** | — | Got a response with a status code, so the network worked | Does not match |
>
> → Taking **4xx client error** — the response status is 422 Unprocessable Entity.

## Key references

| File | What it covers |
|---|---|
| `references/format.md` | Syntax, node types, nesting rules, examples |
| `references/chaining.md` | Multi-tree chains: handoffs, chain patterns, carry-forward context |
