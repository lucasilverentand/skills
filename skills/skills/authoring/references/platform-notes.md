# Platform-Specific Notes

The core workflow (draft -> test -> review -> improve -> repeat) is the same everywhere, but some mechanics change per platform.

## Claude.ai

**Running test cases:** No subagents, so no parallel execution. For each test case, read the skill's SKILL.md, then follow its instructions yourself, one at a time. Skip baseline runs.

**Reviewing results:** If you can't open a browser, skip the viewer. Present results directly in conversation — show prompt and output for each test case. If the output is a file, save it and tell the user where. Ask for feedback inline.

**Benchmarking:** Skip quantitative benchmarking — it relies on baselines which aren't meaningful without subagents. Focus on qualitative feedback.

**The iteration loop:** Same as normal — improve, rerun, ask for feedback — just without the browser viewer.

**Description optimization:** Requires `claude -p` CLI. Skip it on Claude.ai.

**Blind comparison:** Requires subagents. Skip it.

**Packaging:** `scripts/package-skill.ts` works anywhere with Bun.

## Cowork

**Test cases:** Subagents available, so the full workflow works. If you hit timeouts, run test prompts in series rather than parallel.

**Viewer:** No browser/display — use `--static <output_path>` for a standalone HTML file. Proffer a link for the user to open. Feedback works via "Submit All Reviews" which downloads `feedback.json`.

**Important:** Always generate the eval viewer *before* evaluating outputs yourself. Get results in front of the human ASAP using `eval-viewer/generate_review.py` (this script is still Python).

**Description optimization:** Works via `claude -p` subprocess. Save it until the skill is in good shape and the user agrees.
