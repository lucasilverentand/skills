#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo "🔍 Validating skills plugin..."
echo

# 1. Validate plugin.json
echo "Checking plugin.json..."
if claude plugin validate . >/dev/null 2>&1; then
	echo -e "  ${GREEN}✔${NC} plugin.json is valid"
else
	echo -e "  ${RED}✘${NC} plugin.json validation failed"
	claude plugin validate . 2>&1 | sed 's/^/    /'
	ERRORS=$((ERRORS + 1))
fi

# 2. Check each skill directory has SKILL.md
echo
echo "Checking skill directories..."
for dir in skills/*/; do
	skill_name=$(basename "$dir")
	skill_file="$dir/SKILL.md"

	if [[ ! -f $skill_file ]]; then
		echo -e "  ${RED}✘${NC} $skill_name: Missing SKILL.md"
		ERRORS=$((ERRORS + 1))
		continue
	fi

	# 3. Check SKILL.md has description in frontmatter
	if grep -q "^description:" "$skill_file"; then
		desc=$(grep "^description:" "$skill_file" | head -1 | sed 's/description: *//')
		if [[ -z $desc ]]; then
			echo -e "  ${YELLOW}⚠${NC} $skill_name: Empty description"
			WARNINGS=$((WARNINGS + 1))
		else
			echo -e "  ${GREEN}✔${NC} $skill_name"
		fi
	else
		echo -e "  ${YELLOW}⚠${NC} $skill_name: Missing description (recommended for auto-invocation)"
		WARNINGS=$((WARNINGS + 1))
	fi
done

# 4. Check for orphaned SKILL.md files outside skills/
echo
echo "Checking for misplaced skills..."
orphans=$(find . -name "SKILL.md" -not -path "./skills/*" -not -path "./.git/*" 2>/dev/null)
if [[ -n $orphans ]]; then
	echo -e "  ${YELLOW}⚠${NC} Found SKILL.md outside skills/ directory:"
	echo "$orphans" | sed 's/^/    /'
	WARNINGS=$((WARNINGS + 1))
else
	echo -e "  ${GREEN}✔${NC} No misplaced skills"
fi

# Summary
echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [[ $ERRORS -gt 0 ]]; then
	echo -e "${RED}✘ Validation failed: $ERRORS error(s), $WARNINGS warning(s)${NC}"
	exit 1
elif [[ $WARNINGS -gt 0 ]]; then
	echo -e "${YELLOW}⚠ Validation passed with $WARNINGS warning(s)${NC}"
	exit 0
else
	echo -e "${GREEN}✔ Validation passed${NC}"
	exit 0
fi
