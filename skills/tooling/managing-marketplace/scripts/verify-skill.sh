#!/usr/bin/env bash
# Quick single-skill validation.
# Usage: verify-skill.sh <path-to-skill-directory>

set -euo pipefail

SKILL_DIR="${1:?Usage: verify-skill.sh <skill-directory>}"
SKILL_MD="${SKILL_DIR}/SKILL.md"
MAX_LINES=500
errors=0
warnings=0

err() {
	echo "  ERROR: $1"
	((errors++)) || true
}
warn() {
	echo "  WARN:  $1"
	((warnings++)) || true
}

echo "Checking ${SKILL_DIR} ..."

# 1. SKILL.md exists
if [[ ! -f $SKILL_MD ]]; then
	err "SKILL.md not found"
	echo "Result: FAIL (${errors} errors, ${warnings} warnings)"
	exit 1
fi

# 2. Has frontmatter
if ! head -1 "$SKILL_MD" | grep -q '^---$'; then
	err "No YAML frontmatter (missing opening ---)"
fi

# 3. Frontmatter has name
if ! grep -q '^name:' "$SKILL_MD"; then
	err "Missing 'name' in frontmatter"
else
	name=$(grep '^name:' "$SKILL_MD" | head -1 | sed 's/^name: *//')
	dir_name=$(basename "$SKILL_DIR")
	# 4. Name matches directory
	if [[ $name != "$dir_name" ]]; then
		err "Name '${name}' doesn't match directory '${dir_name}'"
	fi
	# 5. Name format
	if ! echo "$name" | grep -qE '^[a-z][a-z0-9]*(-[a-z0-9]+)*$'; then
		err "Name '${name}' has invalid format (need lowercase-hyphens)"
	fi
fi

# 6. Frontmatter has description
if ! grep -q '^description:' "$SKILL_MD"; then
	err "Missing 'description' in frontmatter"
fi

# 7. Line count
lines=$(wc -l <"$SKILL_MD" | tr -d ' ')
if ((lines > MAX_LINES)); then
	warn "SKILL.md is ${lines} lines (max ${MAX_LINES})"
fi

# Summary
echo ""
if ((errors > 0)); then
	echo "Result: FAIL (${errors} errors, ${warnings} warnings)"
	exit 1
else
	echo "Result: PASS (${warnings} warnings)"
	exit 0
fi
