# Description Optimization

The `description` field in SKILL.md frontmatter is the primary mechanism that determines whether Claude invokes a skill. An under-specified description means the skill won't trigger when it should; an over-broad description means it triggers when it shouldn't. This workflow systematically tests and improves descriptions for triggering accuracy.

## How skill triggering works

Agents use progressive disclosure to manage context. At startup, they load only the `name` and `description` of each available skill — just enough to decide when a skill might be relevant. When a user's task matches a description, the agent reads the full SKILL.md into context and follows its instructions.

The description carries the entire burden of triggering. If it doesn't convey when the skill is useful, the agent won't know to reach for it.

One important nuance: agents typically only consult skills for tasks that require knowledge or capabilities beyond what they can handle alone. A simple, one-step request like "read this PDF" may not trigger a PDF skill even if the description matches perfectly, because the agent can handle it with basic tools. Tasks involving specialized knowledge — an unfamiliar API, a domain-specific workflow, or an uncommon format — are where a well-written description makes the difference. Eval queries should be substantive enough that Claude would actually benefit from consulting a skill.

## Writing effective descriptions

Also see `references/writing-philosophy.md` "Description writing" for foundational rules.

- **Use imperative phrasing.** "Use this skill when..." rather than "This skill does..." The agent is deciding whether to act, so tell it when to act.
- **Focus on user intent, not implementation.** Describe what the user is trying to achieve, not the skill's internal mechanics. The agent matches against what the user asked for.
- **Err on the side of being pushy.** Explicitly list contexts where the skill applies, including cases where the user doesn't name the domain directly: "even if they don't explicitly mention 'CSV' or 'analysis.'"
- **Keep it concise.** A few sentences to a short paragraph — long enough to cover the skill's scope, short enough that it doesn't bloat the agent's context across many skills. Hard limit: 1024 characters.

## Step 1: Generate trigger eval queries

Create 20 eval queries — a mix of should-trigger and should-not-trigger. Save as JSON:

```json
[
  {"query": "the user prompt", "should_trigger": true},
  {"query": "another prompt", "should_trigger": false}
]
```

### Should-trigger queries (8-10)

These test whether the description captures the skill's scope. Vary them along several axes:

- **Phrasing**: some formal, some casual, some with typos or abbreviations.
- **Explicitness**: some name the skill's domain directly ("analyze this CSV"), others describe the need without naming it ("my boss wants a chart from this data file").
- **Detail**: mix terse prompts with context-heavy ones — a short "analyze my sales CSV and make a chart" alongside a longer message with file paths, column names, and backstory.
- **Complexity**: vary the number of steps and decision points. Include single-step tasks alongside multi-step workflows to test whether the skill is recognized when the task it addresses is buried in a larger chain.

The most useful should-trigger queries are ones where the skill would help but the connection isn't obvious from the query alone. These are the cases where description wording makes the difference — if the query already asks for exactly what the skill does, any reasonable description would trigger.

### Should-not-trigger queries (8-10)

The most valuable negative test cases are **near-misses** — queries that share keywords or concepts with your skill but actually need something different. These test whether the description is precise, not just broad.

Weak negatives (too easy, test nothing):
- `"Write a fibonacci function"` — obviously irrelevant.
- `"What's the weather today?"` — no keyword overlap.

Strong negatives (share concepts but need something different):
- `"I need to update the formulas in my Excel budget spreadsheet"` — shares "spreadsheet" and "data" concepts, but needs Excel editing, not CSV analysis.
- `"can you write a python script that reads a csv and uploads each row to our postgres database"` — involves CSV, but the task is database ETL, not analysis.

### Tips for realism

Real user prompts contain context that generic test queries lack. Include:

- File paths (`~/Downloads/report_final_v2.xlsx`)
- Personal context (`"my manager asked me to..."`)
- Specific details (column names, company names, data values)
- Casual language, abbreviations, and occasional typos

Bad: `"Format this data"`, `"Extract text from PDF"`, `"Create a chart"`

Good: `"ok so my boss just sent me this xlsx file (its in my downloads, called something like 'Q4 sales final FINAL v2.xlsx') and she wants me to add a column that shows the profit margin as a percentage. The revenue is in column C and costs are in column D i think"`

## Step 2: Review with user

Present the eval set using the HTML template:

1. Read `assets/eval_review.html`
2. Replace placeholders:
   - `__EVAL_DATA_PLACEHOLDER__` -> the JSON array (no quotes — it's a JS variable assignment)
   - `__SKILL_NAME_PLACEHOLDER__` -> the skill name
   - `__SKILL_DESCRIPTION_PLACEHOLDER__` -> the current description
3. Write to a temp file (e.g., `/tmp/eval_review_<skill-name>.html`) and open it
4. User edits queries, toggles should-trigger, adds/removes entries, clicks "Export Eval Set"
5. File downloads to `~/Downloads/eval_set.json` — check Downloads for the most recent version

## Step 3: Run the optimization loop

Tell the user this will take some time, then run in the background:

```bash
bun run scripts/run-loop.ts \
  --eval-set <path-to-trigger-eval.json> \
  --skill-path <path-to-skill> \
  --model <model-id-powering-this-session> \
  --max-iterations 5 \
  --verbose
```

Use the model ID from your system prompt so the triggering test matches what the user actually experiences.

### What the loop does

1. **Splits** the eval set into 60% train and 40% held-out test (proportional mix of positives and negatives, seeded shuffle for reproducibility).
2. **Evaluates** the current description by running each query 3 times for a reliable trigger rate. A should-trigger query passes if its trigger rate exceeds the threshold (default 0.5). A should-not-trigger query passes if its trigger rate is below that threshold.
3. **Identifies failures** in the train set only — which should-trigger queries didn't trigger? Which should-not-trigger queries did?
4. **Proposes an improved description** using Claude with extended thinking, guided by train failures but blind to test results (prevents overfitting).
5. **Repeats** until all train queries pass or max iterations reached (default 5).
6. **Selects the best iteration** by test score — not necessarily the last iteration, since later ones may overfit to the train set.

### Why train/test splits matter

If you optimize against all queries, you risk overfitting — crafting a description that works for these specific phrasings but fails on new ones. The held-out test set gives an honest signal of whether improvements generalize. The improvement model never sees test results, so it can't game them.

### Manual testing (without the loop)

If you want to test triggering manually or the CLI isn't available, the basic approach is:

```bash
# Run a query and check if the skill was invoked
claude -p "user query here" --output-format json 2>/dev/null \
  | jq -e --arg skill "skill-name" \
    'any(.messages[].content[]; .type == "tool_use" and .name == "Skill" and .input.skill == $skill)'
```

Run each query multiple times (3+) since model behavior is nondeterministic, and compute a trigger rate.

Periodically tail the output to give the user updates.

## Step 4: Apply the result

Take `best_description` from the JSON output and update SKILL.md frontmatter. Show before/after and report the scores.

Before and after example:

```yaml
# Before
description: Process CSV files.

# After
description: >
  Analyze CSV and tabular data files — compute summary statistics,
  add derived columns, generate charts, and clean messy data. Use this
  skill when the user has a CSV, TSV, or Excel file and wants to
  explore, transform, or visualize the data, even if they don't
  explicitly mention "CSV" or "analysis."
```

The improved description is more specific about what the skill does (summary stats, derived columns, charts, cleaning) and broader about when it applies (CSV, TSV, Excel; even without explicit keywords).

### Verify generalization

After applying the best description, verify it generalizes beyond the eval set:

1. Check the description is under the 1024-character limit.
2. Try a few prompts manually as a quick sanity check.
3. For a more rigorous test, write 5-10 fresh queries (never part of the optimization) and run them — these give an honest check on whether the description generalizes.

## Note: Requires Claude Code CLI

Description optimization uses `claude -p` via subprocess and is only available in Claude Code. Skip this step in Claude.ai. It works in Cowork via subprocess.
