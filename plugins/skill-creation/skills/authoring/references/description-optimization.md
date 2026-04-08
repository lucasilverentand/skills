# Description Optimization

The `description` field in SKILL.md frontmatter is the primary mechanism that determines whether Claude invokes a skill. This workflow optimizes it for accurate triggering.

## Step 1: Generate trigger eval queries

Create 20 eval queries — a mix of should-trigger and should-not-trigger. Save as JSON:

```json
[
  {"query": "the user prompt", "should_trigger": true},
  {"query": "another prompt", "should_trigger": false}
]
```

Queries must be realistic — concrete, specific, with file paths, personal context, column names, company names. Mix formal and casual phrasings, different lengths, lowercase, abbreviations, typos. Focus on edge cases rather than clear-cut ones.

Bad: `"Format this data"`, `"Extract text from PDF"`, `"Create a chart"`

Good: `"ok so my boss just sent me this xlsx file (its in my downloads, called something like 'Q4 sales final FINAL v2.xlsx') and she wants me to add a column that shows the profit margin as a percentage. The revenue is in column C and costs are in column D i think"`

**Should-trigger queries (8-10):** Different phrasings of the same intent — formal and casual. Cases where the user doesn't explicitly name the skill but clearly needs it. Uncommon use cases. Cases where this skill competes with another but should win.

**Should-not-trigger queries (8-10):** Near-misses — queries that share keywords but need something different. Adjacent domains, ambiguous phrasing where keyword matching would trigger but shouldn't. Don't make negatives obviously irrelevant.

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

The loop splits the eval set into 60% train and 40% held-out test, evaluates the current description (running each query 3 times for reliable trigger rate), then calls Claude with extended thinking to propose improvements. It re-evaluates each new description on both train and test, iterating up to 5 times. When done, it opens an HTML report and returns JSON with `best_description` — selected by test score to avoid overfitting.

Periodically tail the output to give the user updates.

## Step 4: Apply the result

Take `best_description` from the JSON output and update SKILL.md frontmatter. Show before/after and report the scores.

## How skill triggering works

Skills appear in Claude's `available_skills` list with name + description. Claude decides whether to consult a skill based on that description. Claude only consults skills for tasks it can't easily handle alone — simple one-step queries may not trigger even if the description matches perfectly. Eval queries should be substantive enough that Claude would actually benefit from consulting a skill.

## Note: Requires Claude Code CLI

Description optimization uses `claude -p` via subprocess and is only available in Claude Code. Skip this step in Claude.ai. It works in Cowork via subprocess.
