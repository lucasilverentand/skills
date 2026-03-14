---
name: tagging
description: Creates and manages git tags for releases, milestones, and version markers. Use when the user wants to create a tag, list tags, compare tagged releases, push tags, or enforce semver conventions. Trigger phrases: "create a tag", "tag this release", "list tags", "compare tags", "push tags", "semver", "version tag", "release tag", "tag diff".
allowed-tools: Read Grep Glob Bash
---

# Tagging

## Current context

- Branch: !`git branch --show-current`
- Latest tag: !`git describe --tags --abbrev=0 2>/dev/null || echo "no tags"`
- Total tags: !`git tag | wc -l | tr -d ' '`

## Decision Tree

- What do you need to do?
  - **Create a new tag** → follow "Creating tags" below
  - **List or search tags** → `git tag -l --sort=-v:refname` (semver order) or `git tag -l "v1.*"` (filter)
  - **Compare two tags** → `git log --oneline <tag1>..<tag2>` for commits, `git diff --stat <tag1>..<tag2>` for changes
  - **Push tags to remote** → follow "Pushing tags" below
  - **Plan a release from tags** → follow "Tag-based releases" below

## Annotated vs lightweight tags

| Type | When to use | Command |
|---|---|---|
| **Annotated** (default) | Releases, milestones — stores author, date, message | `git tag -a v1.2.3 -m "message"` |
| **Lightweight** | Temporary markers, local bookmarks | `git tag v1.2.3-temp` |

Always prefer annotated tags for anything shared with a team or used in CI/CD.

## Semver conventions

Tags must follow semantic versioning: `v<major>.<minor>.<patch>`

- **Major** (`v2.0.0`) — breaking changes, incompatible API updates
- **Minor** (`v1.1.0`) — new features, backward-compatible additions
- **Patch** (`v1.0.1`) — bug fixes, backward-compatible corrections

Pre-release suffixes are allowed: `v1.2.3-beta.1`, `v1.2.3-rc.1`

To determine the next version:
1. Check the latest tag: `git describe --tags --abbrev=0`
2. Review changes since that tag: `git log --oneline <latest>..HEAD`
3. Bump major if breaking, minor if features added, patch if only fixes

## Creating tags

1. Decide the version number using semver conventions above
2. Validate and create: `tools/tag-create.ts v1.2.3 --message "Release v1.2.3"`
   - Add `--lightweight` to skip the annotation
   - Omit the message to open an editor for the annotation
3. To tag a specific commit (not HEAD): `tools/tag-create.ts v1.2.3 abc1234`

## Pushing tags

Tags are **not** pushed by `git push` by default. Push explicitly:

- Single tag: `git push origin v1.2.3`
- All tags: `git push origin --tags`
- Only annotated tags: `git push origin --follow-tags`

Never force-push tags that others may have pulled. If a tag was created in error:
1. Delete remote: `git push origin --delete v1.2.3`
2. Delete local: `git tag -d v1.2.3`
3. Recreate with the correct target

## Tag-based releases

1. List recent tags: `git tag -l --sort=-v:refname | head -5`
2. Compare the last two releases: `git log --oneline v1.1.0..v1.2.0`
3. Generate a changelog from the diff output
4. Create the new tag: `tools/tag-create.ts v1.3.0 --message "Release v1.3.0"`
5. Push: `git push origin v1.3.0`

## Comparing releases

- Commits between tags: `git log --oneline <tag1>..<tag2>`
- Stat summary: `git diff --stat <tag1>..<tag2>`
- Full diff: `git diff <tag1>..<tag2>`

## Key references

| File / Command | What it covers |
|---|---|
| `tools/tag-create.ts` | Create annotated or lightweight tags with semver validation |
| `git tag -l --sort=-v:refname` | List tags in semver order |
| `git log --oneline <tag1>..<tag2>` | Commits between two tags |
| `git diff --stat <tag1>..<tag2>` | File changes between two tags |
