---
name: merge-conflicts
description: Helps resolve Git merge conflicts. Use when encountering merge conflicts, understanding conflict markers, or choosing resolution strategies.
argument-hint: [file]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Merge Conflicts

Helps resolve Git merge conflicts effectively.

## Your Task

1. **Identify conflicts**: Find conflicting files
2. **Understand changes**: Review both versions
3. **Resolve**: Choose correct resolution
4. **Test**: Verify resolved code works
5. **Complete**: Finish merge/rebase

## Conflict Markers

```
<<<<<<< HEAD
Your current branch changes
=======
Incoming changes (from merge/rebase)
>>>>>>> feature-branch
```

## Resolution Strategies

### Keep Current (Ours)

```bash
git checkout --ours path/to/file
git add path/to/file
```

### Keep Incoming (Theirs)

```bash
git checkout --theirs path/to/file
git add path/to/file
```

### Manual Resolution

```bash
# 1. Open file and edit
# 2. Remove conflict markers
# 3. Keep/combine the code you want
# 4. Stage the file
git add path/to/file
```

## Common Scenarios

### Package Lock Conflicts

```bash
# Regenerate lock file
rm package-lock.json
npm install
git add package-lock.json
```

### Both Modified Same Lines

```javascript
// Before (conflict)
<<<<<<< HEAD
const timeout = 5000;
=======
const timeout = 10000;
>>>>>>> feature

// After (resolved - pick one or combine)
const timeout = 10000; // Using higher value for slow connections
```

### Deleted vs Modified

```bash
# If you want to keep the file
git add path/to/file

# If you want to delete it
git rm path/to/file
```

## Completing Resolution

```bash
# After resolving all conflicts

# For merge
git add .
git commit

# For rebase
git add .
git rebase --continue

# To abort
git merge --abort
# or
git rebase --abort
```

## Prevention Tips

- Keep branches short-lived
- Pull/rebase frequently
- Communicate about shared files
- Use code owners for critical files
- Consider feature flags for parallel work
