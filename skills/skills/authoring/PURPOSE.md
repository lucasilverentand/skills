# Skill Authoring

Create, improve, test, and validate agent skills. Runs the full skill development lifecycle from intent capture through evaluation and description optimization.

## Responsibilities

- Capture user intent before writing — understand what the skill should do and when it triggers
- Scaffold skill directories with PURPOSE.md, SKILL.md, tools/, and references/
- Write SKILL.md with correct frontmatter, decision trees, and lean instructions
- Add tools and references to support the skill's responsibilities
- Validate structure, naming, and token budgets
- Run test evaluations — spawn with-skill and baseline runs, grade assertions, aggregate benchmarks
- Present results via the interactive eval viewer for user review
- Iterate on skills based on user feedback — generalize improvements, keep prompts lean
- Run blind A/B comparisons between skill versions when rigorous comparison is needed
- Optimize skill descriptions for accurate triggering via the eval loop
- Adapt workflows for Claude.ai and Cowork environments

## Tools

- `tools/skill-validate.ts` — deep quality check on a single skill directory: validates structure (SKILL.md, PURPOSE.md, references/, tools/), frontmatter fields and unknown keys, naming conventions, allowed-tools, body content quality, broken and orphan references, undocumented tools, and PURPOSE.md scope. Flags: `--fix` to auto-fix mechanical issues, `--json` for machine output
- `tools/coverage-gap.ts` — compare responsibilities against tools and decision tree branches
- `tools/token-estimate.ts` — estimate token count against the 5000-token guideline

## Scripts

- `scripts/aggregate-benchmark.ts` — aggregate individual run results into benchmark stats with mean/stddev/delta
- `scripts/run-eval.ts` — test if a skill description causes Claude to trigger, runs queries via `claude -p`
- `scripts/run-loop.ts` — full description optimization loop: eval + improve iteratively with train/test split
- `scripts/improve-description.ts` — calls Claude API with extended thinking to propose better descriptions
- `scripts/generate-report.ts` — generates HTML reports from optimization loop output
- `scripts/quick-validate.ts` — quick SKILL.md frontmatter validation
- `scripts/package-skill.ts` — packages a skill into a distributable .skill ZIP file

## Eval Viewer

- `eval-viewer/generate_review.py` — creates interactive HTML review interface for test case outputs and benchmarks
- `eval-viewer/viewer.html` — web viewer template (two-tab interface: Outputs + Benchmark)

## Subagent Instructions

- `agents/grader.md` — how to evaluate assertions against execution transcripts and outputs
- `agents/comparator.md` — how to do blind A/B comparison between two outputs
- `agents/analyzer.md` — how to analyze why one version beat another, and benchmark pattern analysis
