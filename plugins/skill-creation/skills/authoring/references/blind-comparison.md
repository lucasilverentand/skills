# Blind Comparison

For situations where you want a rigorous comparison between two versions of a skill (e.g., "is the new version actually better?").

## How it works

Give two outputs to an independent agent without telling it which is which, and let it judge quality. Then analyze why the winner won.

This is optional, requires subagents, and most users won't need it. The human review loop is usually sufficient.

## Running a blind comparison

1. **Spawn a comparator subagent** — read `agents/comparator.md` for the full protocol. The comparator receives two outputs labeled A and B (randomly assigned) and judges based on rubric scoring + optional assertion checking. It produces `comparison.json`.

2. **Spawn an analyzer subagent** — read `agents/analyzer.md` for the post-hoc analysis protocol. The analyzer "unblinds" the results, reads both skills and transcripts, and identifies what made the winner better and how to improve the loser. It produces `analysis.json`.

3. **Apply insights** — use the analyzer's improvement suggestions to guide skill changes, prioritized by impact.

## When to use

- User asks "is the new version better?" and wants objective evidence
- Pass rates are similar between versions and you need a tiebreaker
- You want to understand *why* one approach works better, not just that it does
