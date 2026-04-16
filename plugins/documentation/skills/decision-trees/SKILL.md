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
Add a reasoning prompt before complex trees to orient the reader. It frames the problem, names key signals to gather before entering the tree, and calls out the common mistake — without biasing toward any branch. Skip for simple mechanical trees. See `references/reasoning-prompts.md` for the full guide, format, and examples.

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
When following a decision tree, produce a visible reasoning trace using pro/con evaluation at every branch point. Evaluate **every** sibling condition (not just the first plausible one), gather evidence before committing, and dispatch research agents when uncertain rather than guessing. See `references/agent-trace.md` for the full protocol, dispatching rules, and examples.

## Key references
|File|What it covers|
|---|---|
|`references/format.md`|Syntax, node types, nesting rules, examples|
|`references/chaining.md`|Multi-tree chains: handoffs, chain patterns, carry-forward context|
|`references/reasoning-prompts.md`|Reasoning prompt format, when to include, examples|
|`references/agent-trace.md`|Pro/con evaluation protocol, dispatching research agents, trace format|
