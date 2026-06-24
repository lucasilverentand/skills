---
name: issue-to-pr
description: Orchestrates an issue-to-PR workflow from a selected Linear or GitHub issue through implementation, validation, signed commits, pull request creation, CI repair, and final status updates. Use when the user asks to pick up an issue and turn it into a PR, implement a ticket end-to-end, make a branch merge-ready, or carry work from issue scope through GitHub review.
---

# Issue to PR
Use this skill when the user wants a traceable execution flow from issue intent to a reviewable pull request.

## First checks
1. Identify the source issue or task. If the issue body is unclear, use `planning:issue-authoring` or `planning:task-spec` to tighten scope before coding.
2. Inspect the repo state, branch, remotes, open PRs, and related issues before editing.
3. Confirm the expected delivery endpoint: draft PR, ready PR, merge-ready branch, or local implementation only.
4. Keep the issue, branch, commit, PR, CI, and final status update aligned.

## Workflow
1. **Understand the issue**
   - Read the issue, linked docs, comments, acceptance criteria, dependencies, and blockers.
   - If scope is too broad, split or clarify before implementation.
2. **Prepare the repo**
   - Use `workflow:repo-management` for branch state, user changes, rebases, conflict resolution, signed commits, PR creation, and CI repair.
   - Use a proper branch name such as `feat/<topic>` or `fix/<topic>`, following repo instructions.
3. **Implement narrowly**
   - Edit only the files needed for the issue.
   - Preserve generated artifact rules and run required generation commands when source changes require them.
4. **Validate**
   - Run the repo's documented checks and any focused tests that prove the acceptance criteria.
   - If CI fails, inspect and repair the actual failure instead of retrying blindly.
5. **Publish and update**
   - Create the signed commit and PR when requested or when the workflow goal includes publishing.
   - Leave concise issue/PR comments for meaningful progress, blockers, fixes, and completion.

## Output
- State the issue handled, branch/PR status, validation performed, and any unresolved risk.
- If follow-up work is useful but outside the issue, file or suggest it separately instead of expanding the PR.
