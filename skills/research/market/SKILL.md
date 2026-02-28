---
name: market
description: Researches market size, synthesizes user research, analyzes trends, segments audiences, and evaluates go-to-market strategies. Use when the user needs to size an opportunity, define target personas, evaluate pricing models, understand distribution channels, or synthesize findings from user interviews and surveys.
allowed-tools: Read Glob Grep Bash WebFetch WebSearch
context: fork
agent: Explore
---

# Market Research

## Decision Tree

- What is the research goal?
  - **Estimate the size of a market opportunity** → follow "Market Sizing" below
  - **Define or refine target personas** → follow "Persona Development" below
  - **Understand pricing models and revenue potential** → follow "Pricing Model Analysis" below
  - **Synthesize findings from surveys or interviews** → follow "User Research Synthesis" below
  - **Track industry trends and benchmark data** → follow "Trend Analysis" below
  - **Evaluate go-to-market channels** → follow "GTM Channel Evaluation" below

## Market Sizing

1. Define the market boundary clearly:
   - Who is the customer? (individual, SMB, enterprise, specific vertical)
   - What job do they hire the product to do?
   - What geography is in scope?
2. Gather data from multiple angles:
   - Top-down: find industry reports via web search; extract TAM/SAM estimates
   - Bottom-up: estimate number of potential customers × willingness to pay
3. Cross-validate: do top-down and bottom-up estimates converge? If they diverge significantly, investigate why
4. Note confidence level and key assumptions for each estimate
5. Run `tools/trend-digest.ts` to find recent analyst coverage and growth rate data
6. Produce a market sizing summary: TAM, SAM, SOM with methodology and assumptions clearly stated

## Persona Development

1. Gather source material: user interview transcripts, survey results, support tickets, sales call notes
2. Run `tools/persona-builder.ts <data-file>` to extract initial patterns from research data
3. For each emerging persona, define:
   - Job title / role and company type
   - Primary goal they're trying to achieve with the product
   - Key frustrations with current solutions
   - Decision-making authority (buyer vs. user vs. influencer)
   - Technical sophistication level
4. Validate each persona against actual data — every attribute should be traceable to evidence
5. Prioritize: identify the primary persona (who you're optimizing for) and secondary personas
6. Produce persona cards: one per segment, with name, role, goals, pain points, and a representative quote

## Pricing Model Analysis

1. Document current and alternative pricing models:
   - Per-seat, usage-based, flat-rate, tiered, freemium, consumption + platform fee
2. Understand the unit economics of the product:
   - What does it cost to serve one customer at each tier?
   - What drives value for the customer (seats, usage, outcomes)?
3. Run `tools/pricing-model.ts` to simulate revenue projections at different conversion rates and average deal sizes
4. Assess pricing model fit:
   - **Aligns cost with value** → customers feel they pay for what they use
   - **Predictable for customers** → reduces churn risk from bill shock
   - **Scalable for the business** → margin improves as usage grows
5. Benchmark against competitors (reference competitor pricing research if available)
6. Produce a pricing model recommendation with revenue projections and risk analysis

## User Research Synthesis

1. Collect all raw data: interview transcripts, survey responses, usability session notes
2. Apply affinity mapping — group observations by theme:
   - Pain points / frustrations
   - Desired outcomes
   - Current workarounds
   - Delighters / moments of positive surprise
3. Run `tools/persona-builder.ts` if the data is structured (CSV/JSON from surveys)
4. For unstructured qualitative data: extract key quotes that represent each theme
5. Count frequency: how many participants mentioned each theme? Distinguish signal from noise
6. Produce a synthesis report: top themes with supporting evidence, insights, and recommended actions

## Trend Analysis

1. Run `tools/trend-digest.ts` to aggregate recent industry publications and analyst reports
2. Identify trend categories:
   - Technology shifts (new platforms, AI capabilities, infrastructure changes)
   - Regulatory and compliance changes
   - Behavioral shifts (remote work, mobile-first, privacy expectations)
   - Economic conditions (budget constraints, investment climate)
3. For each significant trend, assess:
   - **Tailwind** — does this trend accelerate demand for the product?
   - **Headwind** — does this trend threaten the market or create new competition?
   - **Neutral but relevant** — worth monitoring
4. Look for second-order effects: what do these trends mean in 12-24 months?
5. Produce a trend analysis report: trend summary, impact classification, and strategic implications

## GTM Channel Evaluation

1. List candidate channels: product-led growth, content/SEO, paid acquisition, community, partnerships, sales-led
2. For each channel, assess:
   - Reach: how many target customers can be reached?
   - Cost: CAC estimate (acquisition cost per customer)
   - Fit: does the channel match the buyer's purchase journey?
   - Scalability: does cost-per-acquisition improve as volume grows?
3. Identify the primary motion:
   - **Product-led** → self-serve, viral loops, free tier converts to paid
   - **Marketing-led** → content, SEO, paid ads drive inbound
   - **Sales-led** → outbound, demos, enterprise contracts
4. Assess the product's current maturity against each channel's requirements
5. Produce a GTM channel recommendation with prioritized experiments and success metrics

## Key references

| File | What it covers |
|---|---|
| `tools/persona-builder.ts` | Generate user personas from survey data and research notes |
| `tools/pricing-model.ts` | Simulate revenue projections across pricing tiers and conversion rates |
| `tools/trend-digest.ts` | Aggregate and summarize recent industry trends from curated sources |
