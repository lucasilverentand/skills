---
name: actions-optimize
description: Optimizes GitHub Actions for speed and cost reduction. Use when workflows are slow, hitting rate limits, consuming excessive minutes, or need performance improvements.
argument-hint: [workflow-file]
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

# Optimize GitHub Actions

Improves workflow performance and reduces execution costs.

## Your Task

<!-- TODO: Implement skill logic -->

1. Analyze workflow files in `.github/workflows/`
2. Fetch run history via `gh run list`
3. Identify optimization opportunities:
   - Caching improvements
   - Job parallelization
   - Conditional execution
   - Runner selection
   - Step consolidation
4. Calculate potential time/cost savings
5. Apply optimizations
6. Provide before/after comparison

## Examples

```bash
# Optimize all workflows
/actions-optimize

# Optimize specific workflow
/actions-optimize ci.yml
```

## Optimization Strategies

<!-- TODO: Add optimization implementations -->

- **Caching**: Dependencies, build artifacts, Docker layers
- **Parallelization**: Matrix strategies, concurrent jobs
- **Conditions**: Skip unnecessary runs, path filters
- **Runners**: Appropriate runner size, self-hosted options

## Validation Checklist

- [ ] Workflows still function correctly
- [ ] Cache keys are deterministic
- [ ] No race conditions introduced
- [ ] Cost reduction estimated
