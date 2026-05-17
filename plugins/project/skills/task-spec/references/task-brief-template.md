# Task Brief Template
Trim sections that do not apply. Keep unresolved details out of the settled requirements.

## Default brief
```markdown
# <short task title>

## Context
- Current state:
- Trigger:
- Relevant links/files/issues:

## Goal
- <what should be true when this is done>

## Non-goals
- <explicitly out of scope>

## Requirements
1. <testable requirement>
2. <testable requirement>

## Acceptance criteria
1. Given <context>, when <action>, then <observable result>.
2. <observable check>

## Constraints
- Technical:
- Product/design:
- Process/timing:
- Security/privacy/compliance:

## Assumptions
- <assumption that is safe enough to proceed with>

## Open questions
- [blocking] <question that must be answered before work starts>
- [non-blocking] <question that can be answered during implementation>

## Verification
- Automated:
- Manual:
- Review/rollout:
```

## Issue body
```markdown
## Problem
<what is wrong or missing, and why it matters>

## Scope
<what this issue covers>

## Non-goals
- <what should not be included>

## Acceptance criteria
- [ ] <observable outcome>
- [ ] <observable outcome>

## Context
<links, examples, screenshots, logs, related issues, prior decisions>

## Implementation notes
<optional; include only if useful and not overly prescriptive>

## Verification
<how the assignee should prove this is done>
```

## Implementation brief
```markdown
# Implementation Brief: <task>

## Intent
<one paragraph: desired outcome and why>

## Scope
In:
- <included area>

Out:
- <excluded area>

## Expected behavior
1. <behavior>
2. <behavior>

## Implementation notes
- <repo-specific guidance, files, patterns, dependencies>

## Risks
- <risk and mitigation>

## Validation plan
- <lint/format/typecheck/test/manual check that fits the project>

## Done when
- <final observable condition>
```

## Decision brief
```markdown
# Decision Brief: <decision>

## Decision needed
<the choice to make>

## Options
1. <option>
2. <option>

## Criteria
- <criterion and why it matters>

## Known constraints
- <constraint>

## Evidence needed
- <what would change the decision>
```
