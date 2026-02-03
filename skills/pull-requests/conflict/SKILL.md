---
name: pr-conflict
description: Guides resolution of merge conflicts with context-aware suggestions by analyzing both branches, understanding the intent of competing changes, and providing step-by-step resolution strategies. Use when handling merge conflicts, rebasing branches, resolving competing changes, fixing failed merges, or updating PRs with conflicts.
argument-hint: [branch-name or --rebase]
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

# Resolve PR Conflicts

Provides comprehensive guidance for resolving merge conflicts by understanding the context and intent of competing changes.

## Degrees of Freedom: LOW

Merge conflict resolution is a fragile operation. Follow the exact workflow steps, validate at each phase, and always test after resolution.

## Your Task

Guide the user through conflict resolution:

1. **Identify conflicts** - Find all conflicting files
2. **Understand context** - Analyze both branches' changes
3. **Determine strategy** - Choose resolution approach for each file
4. **Resolve conflicts** - Apply resolutions systematically
5. **Validate resolution** - Ensure code works after resolution
6. **Complete merge/rebase** - Finalize the operation

## Task Progress Checklist

Copy and track progress:

```
Conflict Resolution Progress:
============================

Phase 1: Identify Conflicts
- [ ] Determine current operation (merge/rebase/cherry-pick)
- [ ] List all conflicting files
- [ ] Categorize conflict types

Phase 2: Understand Context
- [ ] For each file: read both versions
- [ ] Understand the intent of "ours" changes
- [ ] Understand the intent of "theirs" changes
- [ ] Check commit history for context

Phase 3: Resolution Strategy
- [ ] Determine strategy per file:
      [ ] Keep ours
      [ ] Keep theirs
      [ ] Combine both
      [ ] Rewrite

Phase 4: Apply Resolutions
- [ ] Resolve each file
- [ ] Remove all conflict markers
- [ ] Stage resolved files

Phase 5: Validation
- [ ] Code compiles/lints
- [ ] Tests pass
- [ ] No unintended changes

Phase 6: Complete Operation
- [ ] Commit/continue rebase
- [ ] Push changes
- [ ] Verify PR updated
```

## Phase 1: Identify Conflicts

### Detect Current State

```bash
# Check current operation type
if [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; then
  echo "Rebase in progress"
elif [ -f .git/MERGE_HEAD ]; then
  echo "Merge in progress"
elif [ -f .git/CHERRY_PICK_HEAD ]; then
  echo "Cherry-pick in progress"
else
  echo "No merge operation in progress"
fi

# Get conflicting files
git status --porcelain | grep "^UU\|^AA\|^DD\|^AU\|^UA\|^DU\|^UD"

# More readable format
git diff --name-only --diff-filter=U
```

### Conflict Status Codes

| Code | Meaning |
|------|---------|
| `UU` | Both modified (most common) |
| `AA` | Both added |
| `DD` | Both deleted |
| `AU` | Added by us, modified by them |
| `UA` | Added by them, modified by us |
| `DU` | Deleted by us, modified by them |
| `UD` | Deleted by them, modified by us |

### Categorize Conflicts

```bash
# Get list of conflicting files with context
for file in $(git diff --name-only --diff-filter=U); do
  echo "=== $file ==="
  # Show conflict count
  grep -c "^<<<<<<< " "$file" 2>/dev/null || echo "Binary or special file"
  # Show brief context
  head -20 "$file"
  echo ""
done
```

## Phase 2: Understand Context

### Analyze Each Conflict

For each conflicting file:

```bash
# View the base version (common ancestor)
git show :1:path/to/file > /tmp/base.txt

# View "ours" version (current branch)
git show :2:path/to/file > /tmp/ours.txt

# View "theirs" version (incoming branch)
git show :3:path/to/file > /tmp/theirs.txt

# See what each side changed from base
diff /tmp/base.txt /tmp/ours.txt   # Our changes
diff /tmp/base.txt /tmp/theirs.txt # Their changes
```

### Conflict Markers Explained

```
<<<<<<< HEAD (or <<<<<<< ours)
Your current branch changes
(This is what you had before the merge/rebase)
=======
Incoming changes
(This is what the other branch has)
>>>>>>> feature-branch (or >>>>>>> theirs)
```

### Understanding Intent

For each conflict, answer:

1. **What was the original code?** (Check git show :1:file)
2. **What did "ours" change and why?** (Check commit message)
3. **What did "theirs" change and why?** (Check incoming commits)
4. **Are these changes compatible?** (Can both be kept?)
5. **Which change is more correct/complete?**

```bash
# Get commit history for a file on current branch
git log --oneline HEAD -- path/to/file

# Get commit history from incoming branch
git log --oneline MERGE_HEAD -- path/to/file 2>/dev/null || \
git log --oneline REBASE_HEAD -- path/to/file 2>/dev/null

# View the commit message for context
git log -1 --format="%B" <commit-sha>
```

## Phase 3: Resolution Strategies

### Strategy Selection

| Situation | Strategy | When to Use |
|-----------|----------|-------------|
| Our change supersedes theirs | Keep Ours | Their change is now obsolete |
| Their change supersedes ours | Keep Theirs | Our change was interim |
| Both changes needed | Combine | Changes are additive/complementary |
| Both changes conflict logically | Rewrite | Need new implementation |
| Auto-generated file | Regenerate | Lock files, builds, etc. |

### Strategy: Keep Ours

Use when your changes should take precedence:

```bash
# For entire file
git checkout --ours path/to/file
git add path/to/file

# Manual: Remove conflict markers, keep top section
# Before:
<<<<<<< HEAD
const timeout = 5000;
=======
const timeout = 3000;
>>>>>>> feature

# After:
const timeout = 5000;
```

### Strategy: Keep Theirs

Use when incoming changes should take precedence:

```bash
# For entire file
git checkout --theirs path/to/file
git add path/to/file

# Manual: Remove conflict markers, keep bottom section
# Before:
<<<<<<< HEAD
const timeout = 5000;
=======
const timeout = 3000;
>>>>>>> feature

# After:
const timeout = 3000;
```

### Strategy: Combine Both

Use when both changes are needed:

```bash
# Manual editing required
# Before:
<<<<<<< HEAD
import { auth } from './auth';
import { logger } from './logger';
=======
import { auth } from './auth';
import { metrics } from './metrics';
>>>>>>> feature

# After (combined):
import { auth } from './auth';
import { logger } from './logger';
import { metrics } from './metrics';
```

### Strategy: Rewrite

Use when conflicts require a new approach - understand both intents and write new code that accomplishes both goals.

### Strategy: Regenerate

For auto-generated files (package-lock.json, yarn.lock, go.sum):

```bash
rm package-lock.json && npm install && git add package-lock.json
```

## Phase 4: Apply Resolutions

### Systematic Resolution Process

For each conflicting file:

1. **Read the file with conflicts**
2. **Understand each conflict block**
3. **Apply chosen strategy**
4. **Remove ALL conflict markers**
5. **Stage the file**

```bash
# Read file with conflicts
cat path/to/file

# After manually editing, verify no markers remain
grep -n "^<<<<<<< \|^=======$\|^>>>>>>> " path/to/file
# Should return nothing if all resolved

# Stage resolved file
git add path/to/file
```

### Conflict Marker Cleanup

Ensure ALL markers are removed:

```bash
# Check for remaining conflict markers in all files
git diff --check

# Or search explicitly
grep -rn "^<<<<<<< \|^=======$\|^>>>>>>> " .

# These patterns must all be removed:
# <<<<<<< HEAD
# =======
# >>>>>>> branch-name
```

### Verify No Conflicts Remain

```bash
# List remaining conflicts
git diff --name-only --diff-filter=U

# Should be empty if all resolved
```

## Phase 5: Validation

### Build/Lint Check

```bash
# JavaScript/TypeScript
npm run lint 2>&1 || echo "Lint issues found"
npm run build 2>&1 || echo "Build issues found"

# Python
python -m py_compile path/to/file.py
flake8 path/to/file.py

# Go
go build ./...
go vet ./...

# General syntax check
# Ensure the file is valid for its type
```

### Test Check

```bash
# Run tests to verify resolution
npm test 2>&1 || echo "Tests failed"

# Or specific tests for affected areas
npm test -- --grep "affected feature"
```

### Review Changes

```bash
# See what the resolution looks like
git diff --cached

# Verify resolved files are correct
git diff --cached path/to/file
```

## Phase 6: Complete Operation

### For Merge

```bash
# After all conflicts resolved and staged
git commit

# The commit message will be pre-populated for merges
# Or specify explicitly:
git commit -m "Merge branch 'feature' into main

Resolved conflicts in:
- path/to/file1
- path/to/file2"
```

### For Rebase

```bash
# After resolving current commit's conflicts
git add .
git rebase --continue

# May need to repeat for multiple commits
# Check status:
git status
```

### For Cherry-pick

```bash
# After resolving
git add .
git cherry-pick --continue
```

### Abort Operations (If Needed)

```bash
# If resolution is too complex, abort and try again
git merge --abort
# or
git rebase --abort
# or
git cherry-pick --abort
```

### Push Changes

```bash
# After completing merge
git push

# After rebase (requires force push for existing PRs)
git push --force-with-lease
```

### Verify PR Updated

```bash
# Check PR status
gh pr view

# Check for merge conflicts in PR
gh pr view --json mergeable,mergeStateStatus
```

## Special Cases and Error Recovery

For handling special conflict types and error recovery, read `references/ADVANCED.md`:

- Binary file conflicts
- Deleted vs modified conflicts
- Renamed file conflicts
- Submodule conflicts
- Error recovery strategies
- Extended examples

### Quick Reference

```bash
# Binary files - choose one version
git checkout --ours path/to/image.png && git add path/to/image.png

# Deleted vs modified - keep or delete
git add path/to/file  # Keep the file
git rm path/to/file   # Delete the file

# Package locks - regenerate
rm package-lock.json && npm install && git add package-lock.json

# Undo a bad resolution
git checkout -m path/to/file  # Restore conflict markers

# Abort and start over
git merge --abort  # or git rebase --abort
```

## Validation Checklist

Before completing resolution:

- [ ] All conflict markers removed (no <<<<<<, =======, >>>>>>>)
- [ ] All conflicting files staged
- [ ] `git diff --check` shows no issues
- [ ] Code compiles without errors
- [ ] Linting passes
- [ ] Tests pass
- [ ] No unintended changes introduced
- [ ] Changes make logical sense together
- [ ] PR will be mergeable after push

## Tips

- Always understand BOTH sides of a conflict before resolving
- Check commit messages for context on why changes were made
- When in doubt, rewrite rather than blindly merge
- Test after every resolution, not just at the end
- Use `git log --merge -p <file>` to see commits that touched conflicting file
- For large conflicts, consider breaking into smaller merges
- Keep a mental note of which files you resolved how (for later reference)
- If rebasing many commits, consider squashing first to reduce conflict points
- Use `git rerere` to remember conflict resolutions for repeated patterns
- When stuck, `git merge --abort` and discuss with the other developer
