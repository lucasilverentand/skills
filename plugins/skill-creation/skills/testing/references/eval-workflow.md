# Eval Workflow

Running and evaluating test cases end-to-end. This is one continuous sequence — don't stop partway through.

## Workspace layout

Put results in `<skill-name>-workspace/` as a sibling to the skill directory. Within the workspace, organize by iteration (`iteration-1/`, `iteration-2/`, etc.) and within that, each test case gets a directory (`eval-0/`, `eval-1/`, etc.). Create directories as you go.

## Step 1: Spawn all runs in the same turn

For each test case, spawn two subagents in the same turn — one with the skill, one without. Launch everything at once so it finishes around the same time.

**With-skill run:**

```
Execute this task:
- Skill path: <path-to-skill>
- Task: <eval prompt>
- Input files: <eval files if any, or "none">
- Save outputs to: <workspace>/iteration-<N>/eval-<ID>/with_skill/outputs/
- Outputs to save: <what the user cares about>
```

**Baseline run** (same prompt, depends on context):
- **New skill**: no skill at all. Same prompt, no skill path, save to `without_skill/outputs/`.
- **Improving existing skill**: snapshot the old version (`cp -r <skill-path> <workspace>/skill-snapshot/`), point baseline subagent at the snapshot. Save to `old_skill/outputs/`.

Write an `eval_metadata.json` for each test case. Give each eval a descriptive name.

```json
{
  "eval_id": 0,
  "eval_name": "descriptive-name-here",
  "prompt": "The user's task prompt",
  "assertions": []
}
```

## Step 2: While runs are in progress, draft assertions

Draft quantitative assertions for each test case and explain them to the user. If assertions already exist in `evals/evals.json`, review and explain them.

Good assertions are objectively verifiable and have descriptive names that read clearly in the benchmark viewer. Subjective skills (writing style, design quality) are better evaluated qualitatively — don't force assertions onto things that need human judgment.

Update `eval_metadata.json` files and `evals/evals.json` with the assertions. Explain what the user will see in the viewer.

## Step 3: Capture timing data as runs complete

When each subagent task completes, the notification contains `total_tokens` and `duration_ms`. Save immediately to `timing.json` in the run directory — this is the only opportunity to capture this data.

```json
{
  "total_tokens": 84852,
  "duration_ms": 23332,
  "total_duration_seconds": 23.3
}
```

## Step 4: Grade, aggregate, and launch the viewer

Once all runs are done:

1. **Grade each run** — spawn a grader subagent that reads `agents/grader.md` and evaluates each assertion against the outputs. Save results to `grading.json`. The grading.json expectations array must use fields `text`, `passed`, and `evidence` — the viewer depends on these exact names. For assertions that can be checked programmatically, write and run a script.

2. **Aggregate into benchmark** — run from the skill directory:
   ```bash
   bun run scripts/aggregate-benchmark.ts <workspace>/iteration-N --skill-name <name>
   ```
   This produces `benchmark.json` and `benchmark.md`. Put each with_skill version before its baseline counterpart.

3. **Analyst pass** — read the benchmark data and surface patterns the aggregate stats might hide. See `agents/analyzer.md` ("Analyzing Benchmark Results" section) for what to look for.

4. **Launch the viewer**:
   ```bash
   nohup bun run <skill-path>/eval-viewer/generate_review.py \
     <workspace>/iteration-N \
     --skill-name "my-skill" \
     --benchmark <workspace>/iteration-N/benchmark.json \
     > /dev/null 2>&1 &
   VIEWER_PID=$!
   ```
   For iteration 2+, also pass `--previous-workspace <workspace>/iteration-<N-1>`.

   **Headless/Cowork:** Use `--static <output_path>` for a standalone HTML file instead of a server.

5. **Tell the user** the viewer is open and describe the two tabs (Outputs + Benchmark).

## Step 5: Read feedback

When the user is done, read `feedback.json`:

```json
{
  "reviews": [
    {"run_id": "eval-0-with_skill", "feedback": "the chart is missing axis labels", "timestamp": "..."}
  ],
  "status": "complete"
}
```

Empty feedback means the user thought it was fine. Focus improvements on test cases with specific complaints.

Kill the viewer server when done: `kill $VIEWER_PID 2>/dev/null`

## What the user sees in the viewer

The "Outputs" tab shows one test case at a time: prompt, output files (rendered inline), previous output (iteration 2+), formal grades, and a feedback textbox. The "Benchmark" tab shows stats: pass rates, timing, token usage per configuration, with per-eval breakdowns and analyst observations. Navigation via prev/next buttons or arrow keys.
