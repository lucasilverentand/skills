---
name: wrap-up
description: Wrap up a project's current work, preserve unfinished changes, reconcile delivery, and restore a clean main checkout. Use when asked to wrap up, park a project, or leave main pristine without losing work.
---

# Wrap up a project
Leave the project easy to resume: completed work delivered within existing authorization, unfinished work explicitly preserved, and the designated main checkout clean and synchronized with its authoritative remote. Use the repository's actual default branch when it is not named `main`.

This is a project-scoped workflow, not machine-wide cleanup. Creating or editing this skill does not invoke it. A wrap-up request authorizes reversible preservation and routine cleanup of proven disposable task artifacts; it does not independently authorize merging, publishing private work, discarding changes, bypassing reviews, or stopping another session. Reuse authorization already given in the conversation. Ask only for a consequential missing decision after preparing the concrete result.

## Establish the state
- Identify the repository, intended main checkout, authoritative remote/default branch, applicable instructions and current task. Read the project's guidance index where present. Do not assume `origin`, the current branch, or a remembered checkout is authoritative.
- Inventory all worktrees and branches, upstream divergence, staged/unstaged changes, untracked files, ignored files with possible unique data, stashes, submodules, and any merge/rebase/cherry-pick in progress. Inspect file paths before content; avoid printing credentials.
- Establish which work belongs to this task and which worktrees or processes are active elsewhere. Do not switch, stash, remove or stop work owned by another session. Treat unclear ownership as retained work.
- Fetch the relevant remote without pruning first. If unavailable, preserve local work and report that synchronization cannot be verified. Never claim pristine remote alignment from a stale remote-tracking ref.

## Preserve before changing checkout state
Build a brief inventory mapping every unfinished or unique item to its retained location and next action. This can live in the final handoff or existing task record; do not create duplicate archives or a new repository report by default.

- Prefer the existing task branch. If on main or a detached HEAD, create a uniquely named task/WIP branch at the current commit before moving away. Preserve local-only commits, even when the working tree is clean.
- Review and stage only intended non-secret files, then make a clearly labeled WIP commit when work is incomplete. Do not sweep unrelated edits into a commit with `git add .` or `git add -A`. Preserve logical separation where the index holds a meaningful staged subset.
- Verify the saved commit and included paths before removing anything from the working directory. Git commits do not preserve ignored files, empty directories, external files, or dirty submodule contents. Handle unique data separately and retain it in place when safe relocation is unclear. Never commit secrets to make status clean.
- Preserve existing stashes. A new named stash may bridge a short operation, but is not the default final home for work. If necessary, include the appropriate untracked files, record its object ID and contents, and keep it until restoration is verified. Never clear the stash list.
- If an operation is in progress, inspect its state before continuing. Do not automatically abort, skip or resolve conflicts just to clean up. Preserve the workspace and report the blocker when resolution is outside scope.
- Push a task branch only to its intended authorized remote and verify its remote SHA. If remote preservation is unavailable or unauthorized, explicitly label it local-only and keep the branch/worktree. A reflog entry is not a durable preservation plan.

## Reconcile delivery and knowledge
Separate work into delivered, ready for review, and parked/blocked. Complete already-authorized delivery using the repository's PR, review, CI and merge rules; never push directly to main. Inspect reviews at the current source revision. If authorization or acceptance is missing, leave a concrete PR or preserved branch and state the gate instead of silently merging or calling it done.

Use existing issue tracking and knowledge conventions. Persist lasting decisions in their proper source, link delivery to active work, and record a concise resume point for parked work. Keep outstanding live acceptance distinct from green CI or a merged PR. Follow any required write verification and recovery policy before continuing cleanup.

## Restore main and remove proven leftovers
- Recheck status and worktree ownership immediately before mutation. If files changed since inspection, reassess rather than overwrite them.
- Use the existing designated main checkout when safe; do not force-checkout a branch held by another worktree. Switch only after intended changes have been preserved and the source checkout is clean. Update main by fast-forward only against the freshly fetched authoritative branch.
- If local main is ahead or diverged, retain its tip on a named branch and compare the unique work. Do not reset, force-move main or rewrite history as a routine fallback. Report the precise remaining divergence and seek the specific authorization needed, unless already supplied.
- Remove a task worktree only after checking tracked, untracked, ignored and submodule state, proving every unique item is retained elsewhere, and confirming no active session needs it. Use normal worktree removal; never force it to bypass a warning. Do not remove a worktree that installed skills, tools or other active references still depend on.
- Delete branches only when delivery and preservation are verified and they are no longer needed. Squash/rebase merges break ancestry tests: a merged PR or missing remote branch alone does not prove a local tip is disposable. Compare its exact tip with the delivered PR head and examine any later commits; retain it when equivalence is uncertain. Never use `git branch -D` merely because `-d` refused.
- Remove only identified disposable artifacts created by this task and no longer in use. Leave required ignored configuration and local data intact. Do not use blanket `git clean`, hard reset, stash clearing, mass branch deletion or broad cache removal. Do not create backup mirrors or bundles without a concrete recovery need and cleanup point.

## Verify and hand back
Recheck the authoritative remote, main HEAD, working tree and retained work. Report the actual outcome:

- **Main:** designated path/branch and SHA; whether it equals the freshly fetched remote tip, has no staged/unstaged/untracked changes, and has no operation in progress. Required ignored configuration may remain; disclose retained unique local data. If a check fails, say main is not yet pristine and name the blocker.
- **Delivered:** relevant PRs and validation; distinguish merged, reviewed and live acceptance.
- **Preserved:** branch/commit or stash ID, worktree/data location, local-only versus remote-verified, and the next step to resume.
- **Cleaned / remaining:** what was removed and any remaining gate. Clean main can coexist with explicitly parked unfinished work; do not imply the project is completed.

Use a concise handoff proportional to the work. If a gate prevents pristine main, finish independent preservation and documentation, then state the exact remaining action. Never trade work preservation for a clean-looking status.
