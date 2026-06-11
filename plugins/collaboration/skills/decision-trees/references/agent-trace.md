# Agent Trace Protocol
When an agent follows a decision tree (including the one in this skill), it must produce a visible reasoning trace. At every branch point, the agent works through a structured pro/con evaluation in its thinking.

## The evaluation protocol
At each set of sibling conditions, the agent must — in its thinking/scratchpad — evaluate **every** sibling, not just the one that looks right at first glance:

1. **State the question** — write out the decision node being evaluated
2. **Pro/con each condition** — for every sibling at this level:
   - **Evidence for**: what observable facts support this condition being true? (command output, file contents, error messages, state)
   - **Evidence against**: what observable facts contradict this condition? What would you expect to see if this were true that you don't see?
   - **Verdict**: matches / does not match / uncertain
3. **Resolve** — if exactly one condition matches, commit to it. If multiple match, the tree has an ambiguity problem — note it and pick the most specific. If none match, take the fallback branch. If uncertain between two, **dispatch a research agent** before committing (see "Dispatching research agents" below).
4. **Commit** — state the chosen branch and the key differentiator that made it win over the alternatives
5. **Repeat** until reaching a leaf action, then execute it

## Dispatching research agents
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

## Why pro/con and not just "pick the match"
An agent that only argues *for* its choice can rationalize anything. An agent that must also argue *against* every alternative catches its own mistakes — if it can't explain why a sibling doesn't apply, it's probably on the wrong branch. The pro/con structure forces genuine evaluation rather than pattern-matching on the first plausible option.

## What goes where
- **Thinking/scratchpad**: the full pro/con table for every sibling. This is the rigorous evaluation.
- **Visible output**: only the chosen branch and its justification. Keep it clean for the human reading the trace.

## Example trace (in thinking)
> **Question: What HTTP status is the error?**
>
> |Condition|Evidence for|Evidence against|Verdict|
> |---|---|---|---|
> |**4xx client error**|Status is 422, which is 4xx|—|Matches|
> |**5xx server error**|—|Status is 422, not 5xx|Does not match|
> |**Network timeout**|—|Got a response with a status code, so the network worked|Does not match|
>
> → Taking **4xx client error** — the response status is 422 Unprocessable Entity.
