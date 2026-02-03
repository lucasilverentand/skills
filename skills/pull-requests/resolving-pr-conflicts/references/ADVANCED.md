# Advanced Conflict Resolution

Extended documentation for handling complex merge conflict scenarios.

## Table of Contents

1. [Special Cases](#special-cases)
2. [Error Recovery](#error-recovery)
3. [Extended Examples](#extended-examples)

---

## Special Cases

### Binary Files

```bash
# Cannot merge binary files - must choose one
git checkout --ours path/to/image.png   # Keep ours
# or
git checkout --theirs path/to/image.png # Keep theirs
git add path/to/image.png
```

### Deleted vs Modified

```bash
# File was deleted in one branch, modified in another

# To keep the file (accept modification)
git add path/to/file

# To delete the file (accept deletion)
git rm path/to/file
```

### Renamed Files

```bash
# Git usually detects renames, but if conflict:
# Check if same content exists under different name
git diff --name-status HEAD MERGE_HEAD | grep "^R"

# May need to manually handle rename + modification
```

### Submodule Conflicts

```bash
# Submodule pointer conflicts
git checkout --theirs path/to/submodule
git add path/to/submodule

# Or update to specific commit
cd path/to/submodule
git checkout <desired-commit>
cd ..
git add path/to/submodule
```

### Package Lock Conflicts

Lock files are auto-generated and should be regenerated:

```bash
# npm
rm package-lock.json
npm install
git add package-lock.json

# Yarn
rm yarn.lock
yarn install
git add yarn.lock

# Go
rm go.sum
go mod tidy
git add go.sum

# Python
# Usually keep one version and test
```

---

## Error Recovery

### Partially Resolved

If you've made a mistake in resolution:

```bash
# Re-checkout conflicting version of specific file
git checkout -m path/to/file  # Restore conflict markers

# Or get specific version
git checkout --ours path/to/file
git checkout --theirs path/to/file
```

### Reset Single File

```bash
# Undo resolution for one file
git checkout -m path/to/file
```

### Start Over

```bash
# Abort current operation
git merge --abort
# or
git rebase --abort

# Try again with different strategy
git merge --strategy-option=theirs feature-branch  # Prefer theirs
git merge --strategy-option=ours feature-branch    # Prefer ours
```

### Common Post-Resolution Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Missing import | Kept one side's code that uses removed import | Add missing import |
| Duplicate import | Combined imports but one was shared | Remove duplicate |
| Syntax error | Incomplete conflict resolution | Find and fix markers |
| Test failure | Logic conflict not properly resolved | Review and rewrite |
| Type error | Combined incompatible changes | Align types |

---

## Extended Examples

### Simple Two-Way Conflict

```bash
# Conflict in config file
git diff --name-only --diff-filter=U
# Output: src/config.ts

# View the conflict
cat src/config.ts
# Shows:
# <<<<<<< HEAD
# const API_URL = 'https://api.prod.example.com';
# =======
# const API_URL = 'https://api.staging.example.com';
# >>>>>>> feature/new-endpoint

# Understand: HEAD has prod URL, feature has staging
# Decision: Keep prod URL but feature likely needs staging for dev

# Resolution: Use environment variable (rewrite strategy)
# Edit file to:
# const API_URL = process.env.API_URL || 'https://api.prod.example.com';

# Remove all markers, save, stage
git add src/config.ts
git commit
```

### Multiple Files Resolution

```bash
# List all conflicts
git diff --name-only --diff-filter=U
# src/auth.ts
# src/api.ts
# package-lock.json

# Resolve each systematically

# 1. Regenerate lock file (easiest first)
rm package-lock.json && npm install && git add package-lock.json

# 2. Resolve auth.ts (combine both)
# Read file, understand both changes, edit, remove markers
git add src/auth.ts

# 3. Resolve api.ts (keep theirs - their implementation is better)
git checkout --theirs src/api.ts
git add src/api.ts

# Complete
git commit
```

### Import Statement Conflicts

Common scenario when both branches add imports:

```javascript
// Before (conflict):
<<<<<<< HEAD
import { auth } from './auth';
import { logger } from './logger';
import { cache } from './cache';
=======
import { auth } from './auth';
import { metrics } from './metrics';
>>>>>>> feature

// After (combined - keep all unique imports):
import { auth } from './auth';
import { logger } from './logger';
import { cache } from './cache';
import { metrics } from './metrics';
```

### Function Parameter Conflicts

```javascript
// Before (conflict):
<<<<<<< HEAD
function fetchData(url, options = {}) {
  options.timeout = options.timeout || 5000;
  // ...
}
=======
function fetchData(url, retries = 3) {
  // ...
}
>>>>>>> feature

// After (rewrite to include both):
function fetchData(url, options = {}) {
  const { timeout = 5000, retries = 3 } = options;
  // ... combined implementation
}
```

### Database Migration Conflicts

When both branches add migrations:

```bash
# Check migration sequence
ls -la migrations/

# If both added migrations, you may need to:
# 1. Renumber one branch's migrations
# 2. Combine if they touch same tables
# 3. Keep both if they're independent

# After resolution, regenerate any migration checksums
npm run migrate:generate  # or equivalent
```

### Config/Environment Conflicts

```yaml
# Before (conflict):
<<<<<<< HEAD
database:
  host: localhost
  port: 5432
  pool_size: 10
=======
database:
  host: localhost
  port: 5432
  ssl: true
>>>>>>> feature

# After (combined - new settings are additive):
database:
  host: localhost
  port: 5432
  pool_size: 10
  ssl: true
```

---

## Advanced Strategies

### Using git rerere

Enable rerere (reuse recorded resolution) for repeated conflicts:

```bash
# Enable globally
git config --global rerere.enabled true

# Git will now remember how you resolved conflicts
# and apply same resolution automatically next time
```

### Merge vs Rebase Strategy

**When to merge:**
- Preserving complete history is important
- Working on shared/public branches
- Conflicts are complex and benefit from explicit merge commit

**When to rebase:**
- Clean linear history is preferred
- Working on personal feature branches
- Want to update with latest main changes

### Squash Before Rebase

For branches with many commits that conflict:

```bash
# Squash to reduce conflict points
git rebase -i HEAD~N  # Squash N commits into fewer

# Then rebase onto main
git rebase main
```

### Handling Large Conflicts

For complex conflicts affecting many files:

1. **Abort and discuss** with the other developer
2. **Split the work** - resolve different files in separate commits
3. **Consider alternative approach** - maybe the changes are fundamentally incompatible
4. **Document decisions** - add comments explaining resolution choices
