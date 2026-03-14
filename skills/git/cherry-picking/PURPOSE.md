# Cherry-picking

Apply specific commits across branches for backports and selective merges.

## Responsibilities

- Cherry-pick single commits and commit ranges
- Handle conflicts during cherry-pick operations
- Backport fixes to release and maintenance branches
- Verify whether commits have already been picked into a branch
- Manage cherry-pick workflows across long-lived branches

## Tools

- `tools/cherry-pick-range.ts` — pick a range of commits with conflict handling
- `tools/backport.ts` — cherry-pick commits to a release or maintenance branch
