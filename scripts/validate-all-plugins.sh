#!/usr/bin/env bash
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

errors=0
warnings=0

echo "🔍 Validating all plugins and marketplace..."
echo

# 1. Validate marketplace
echo "━━━ Validating Marketplace ━━━"
echo "Running: claude plugin validate ."
echo
if claude plugin validate . 2>&1; then
	echo -e "${GREEN}✔${NC} Marketplace validation passed"
else
	echo -e "${RED}✗${NC} Marketplace validation failed"
	errors=$((errors + 1))
fi
echo

# 2. Run custom metadata validation
echo "━━━ Running Custom Metadata Validation ━━━"
if ./scripts/validate-claude-metadata.sh 2>&1; then
	echo -e "${GREEN}✔${NC} Custom metadata validation passed"
else
	echo -e "${RED}✗${NC} Custom metadata validation failed"
	errors=$((errors + 1))
fi
echo

# 3. Run skill validation
echo "━━━ Running Skill Validation ━━━"
for skill_dir in skills/*/; do
	skill_name=$(basename "$skill_dir")
	if [[ ! -f "$skill_dir/SKILL.md" ]]; then
		echo -e "${RED}✗${NC} Skill '$skill_name' missing SKILL.md"
		errors=$((errors + 1))
	else
		echo -e "${GREEN}✔${NC} Skill '$skill_name' has SKILL.md"
	fi
done
echo

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [[ $errors -gt 0 ]]; then
	echo -e "${RED}✘ Validation failed: $errors error(s), $warnings warning(s)${NC}"
	exit 1
elif [[ $warnings -gt 0 ]]; then
	echo -e "${YELLOW}⚠ Validation passed with $warnings warning(s)${NC}"
	exit 0
else
	echo -e "${GREEN}✔ All validations passed${NC}"
	exit 0
fi
