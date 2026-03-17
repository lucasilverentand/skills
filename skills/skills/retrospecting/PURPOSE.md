# Retro

Mine recent Claude conversations and code changes for struggles, repeated corrections, and taste signals — then turn those findings into new skills or updates to existing ones.

## Responsibilities

- Scan recent Claude Code conversation transcripts for struggle patterns (corrections, retries, long back-and-forths, rejections)
- Detect taste signals in conversations (preferences, style guidance, technology choices, process patterns)
- Analyze git history for rework indicators (same-file churn, fix-after-feat commits, reverts)
- Cluster findings into themes and rank by frequency and impact
- Cross-reference findings against existing skills to identify gaps vs. update opportunities
- Present a structured retro report with evidence, suggested actions, and confidence scores
- Guide creation of new skills from identified gaps (hand off to lifecycle skill)
- Guide updates to existing skills with newly discovered patterns

## Tools

- `tools/conversation-miner.ts` — scans Claude Code conversation JSONL files for struggle patterns and taste signals, outputs structured findings with evidence quotes
- `tools/rework-detector.ts` — analyzes git log for rework indicators (churn, fix commits, reverts), outputs files and patterns that suggest skill gaps
