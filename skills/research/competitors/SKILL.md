---
name: competitors
description: Performs competitor analysis including feature comparison, UX teardown, pricing benchmarks, and technical approach evaluation. Use when the user needs to understand the competitive landscape, find feature gaps, benchmark pricing, track competitor changes, or identify differentiation opportunities.
allowed-tools: Read Glob Grep Bash WebFetch WebSearch
context: fork
agent: Explore
---

# Competitors

## Decision Tree

- What is the research goal?
  - **Compare features across competitors** → follow "Feature Matrix" below
  - **Understand a competitor's UX and product decisions** → follow "UX Teardown" below
  - **Compare pricing across the market** → follow "Pricing Benchmark" below
  - **Track what competitors have shipped recently** → follow "Changelog Tracking" below
  - **Identify where to differentiate** → follow "Gap Analysis" below

## Feature Matrix

1. Clarify the feature set to compare — gather requirements or user stories to use as evaluation criteria
2. Identify competitors: ask the user or search for top products in the category
3. Run `tools/feature-matrix.ts <url1> <url2> ... --criteria "..."` to generate the initial matrix
4. For each competitor, verify the matrix against their marketing page, docs, and changelog — automated tools may miss nuanced feature distinctions
5. Mark each cell: full support / partial / missing / unclear (needs verification)
6. Produce a feature matrix table with a summary of strengths and weaknesses per competitor

## UX Teardown

1. Identify the flows to evaluate (onboarding, core task, settings, error recovery)
2. For each flow, document:
   - Steps required to complete the task
   - UI patterns used (modals, wizards, inline editing, etc.)
   - Copy and tone
   - Points of friction or confusion
   - What's done well
3. Apply heuristic evaluation against Nielsen's 10 heuristics:
   - Visibility of system status
   - Match between system and the real world
   - User control and freedom
   - Error prevention and recovery
   - Recognition over recall
4. Note accessibility basics: keyboard navigability, contrast, screen reader hints
5. Produce a teardown report: flow-by-flow breakdown, heuristic scores, UX patterns to adopt or avoid

## Pricing Benchmark

1. Run `tools/pricing-compare.ts <url1> <url2> ...` to collect published pricing tiers
2. For each competitor, document:
   - Tier names and price points (monthly and annual)
   - What's included at each tier (seats, usage limits, features)
   - Free tier or trial offer
   - Enterprise/custom pricing signals
3. Identify pricing model patterns:
   - **Per-seat** → scales with team size
   - **Usage-based** → scales with consumption
   - **Flat-rate** → predictable, but may leave money on the table
   - **Hybrid** → combination; note how it's communicated
4. Map where the product under development would sit in the competitive price range
5. Produce a pricing comparison table and recommendations for positioning

## Changelog Tracking

1. Run `tools/changelog-tracker.ts <url1> <url2> ...` to scrape and summarize recent releases
2. For each competitor, identify:
   - Release cadence (how often do they ship?)
   - Recent feature additions (what are they prioritizing?)
   - Bug fixes and polish (signals of product maturity)
   - Deprecations or breaking changes (signals of platform stability)
3. Look for patterns:
   - **Converging on the same features** → market expectation forming; must-have
   - **One competitor accelerating** → potential threat; investigate their team/funding
   - **No one solving X** → potential differentiation opportunity
4. Produce a timeline summary and trend analysis

## Gap Analysis

1. Start from the feature matrix (complete it first if not done)
2. Identify gaps in three categories:
   - **Features everyone has that you lack** → table-stakes, must close the gap
   - **Features some have** → assess whether they matter for your target segment
   - **Features no one has** → potential differentiation; validate demand before building
3. For differentiation candidates:
   - Is there user evidence of demand (forums, reviews, social media)?
   - Is it technically feasible at your current stage?
   - Does it align with the product's core value proposition?
4. Prioritize: high-impact gaps vs. high-effort differentiators vs. quick wins
5. Produce a gap analysis report with a recommended build/buy/skip decision for each item

## Key references

| File | What it covers |
|---|---|
| `tools/feature-matrix.ts` | Generate feature comparison matrix from competitor URLs and criteria |
| `tools/changelog-tracker.ts` | Scrape and summarize recent changelog entries from competitor sites |
| `tools/pricing-compare.ts` | Collect and tabulate pricing tiers across competing products |
