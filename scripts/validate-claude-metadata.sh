#!/usr/bin/env bash
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0

echo "🔍 Validating Claude Code metadata files..."
echo

# Check if jq is available
if ! command -v jq &>/dev/null; then
	echo -e "${YELLOW}⚠${NC} jq not found, skipping JSON schema validation"
	echo "  Install jq for full validation: brew install jq (macOS) or apt install jq (Linux)"
	echo
fi

# Validate plugin.json
if [ -f ".claude-plugin/plugin.json" ]; then
	echo "Checking plugin.json..."

	# Check if file is valid JSON
	if command -v jq &>/dev/null; then
		if ! jq empty .claude-plugin/plugin.json 2>/dev/null; then
			echo -e "  ${RED}✗${NC} Invalid JSON syntax"
			errors=$((errors + 1))
		else
			echo -e "  ${GREEN}✔${NC} Valid JSON syntax"

			# Validate required fields
			name=$(jq -r '.name // empty' .claude-plugin/plugin.json)
			description=$(jq -r '.description // empty' .claude-plugin/plugin.json)
			version=$(jq -r '.version // empty' .claude-plugin/plugin.json)

			# Check name is kebab-case (no spaces)
			if [ -n "$name" ]; then
				if [[ "$name" =~ [[:space:]] ]]; then
					echo -e "  ${RED}✗${NC} name contains spaces, must be kebab-case (e.g., 'my-plugin')"
					errors=$((errors + 1))
				else
					echo -e "  ${GREEN}✔${NC} name is valid: $name"
				fi
			else
				echo -e "  ${RED}✗${NC} Missing required field: name"
				errors=$((errors + 1))
			fi

			# Check description exists
			if [ -n "$description" ]; then
				echo -e "  ${GREEN}✔${NC} description is present"
			else
				echo -e "  ${RED}✗${NC} Missing required field: description"
				errors=$((errors + 1))
			fi

			# Check version exists and is valid semver
			if [ -n "$version" ]; then
				if [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
					echo -e "  ${GREEN}✔${NC} version is valid semver: $version"
				else
					echo -e "  ${YELLOW}⚠${NC} version should follow semver (X.Y.Z): $version"
				fi
			else
				echo -e "  ${RED}✗${NC} Missing required field: version"
				errors=$((errors + 1))
			fi

			# Check author field
			author_name=$(jq -r '.author.name // empty' .claude-plugin/plugin.json)
			if [ -n "$author_name" ]; then
				echo -e "  ${GREEN}✔${NC} author.name is present: $author_name"
			else
				echo -e "  ${YELLOW}⚠${NC} author.name is recommended"
			fi
		fi
	else
		echo -e "  ${YELLOW}⚠${NC} Skipping JSON validation (jq not installed)"
	fi
	echo
else
	echo -e "${YELLOW}⚠${NC} plugin.json not found at .claude-plugin/plugin.json"
	echo
fi

# Validate marketplace.json
if [ -f ".claude-plugin/marketplace.json" ]; then
	echo "Checking marketplace.json..."

	# Check if file is valid JSON
	if command -v jq &>/dev/null; then
		if ! jq empty .claude-plugin/marketplace.json 2>/dev/null; then
			echo -e "  ${RED}✗${NC} Invalid JSON syntax"
			errors=$((errors + 1))
		else
			echo -e "  ${GREEN}✔${NC} Valid JSON syntax"

			# Validate required fields
			name=$(jq -r '.name // empty' .claude-plugin/marketplace.json)
			description=$(jq -r '.description // empty' .claude-plugin/marketplace.json)
			version=$(jq -r '.version // empty' .claude-plugin/marketplace.json)
			owner=$(jq -r '.owner // empty' .claude-plugin/marketplace.json)
			plugins=$(jq -r '.plugins // empty' .claude-plugin/marketplace.json)

			# Check name is kebab-case (no spaces)
			if [ -n "$name" ]; then
				if [[ "$name" =~ [[:space:]] ]]; then
					echo -e "  ${RED}✗${NC} name contains spaces, must be kebab-case (e.g., 'my-marketplace')"
					errors=$((errors + 1))
				else
					echo -e "  ${GREEN}✔${NC} name is valid: $name"
				fi
			else
				echo -e "  ${RED}✗${NC} Missing required field: name"
				errors=$((errors + 1))
			fi

			# Check description exists
			if [ -n "$description" ]; then
				echo -e "  ${GREEN}✔${NC} description is present"
			else
				echo -e "  ${RED}✗${NC} Missing required field: description"
				errors=$((errors + 1))
			fi

			# Check version exists
			if [ -n "$version" ]; then
				if [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
					echo -e "  ${GREEN}✔${NC} version is valid semver: $version"
				else
					echo -e "  ${YELLOW}⚠${NC} version should follow semver (X.Y.Z): $version"
				fi
			else
				echo -e "  ${RED}✗${NC} Missing required field: version"
				errors=$((errors + 1))
			fi

			# Check owner is an object
			if [ "$owner" = "null" ] || [ -z "$owner" ]; then
				echo -e "  ${RED}✗${NC} Missing required field: owner (must be an object)"
				errors=$((errors + 1))
			else
				owner_name=$(jq -r '.owner.name // empty' .claude-plugin/marketplace.json)
				if [ -n "$owner_name" ]; then
					echo -e "  ${GREEN}✔${NC} owner.name is present: $owner_name"
				else
					echo -e "  ${RED}✗${NC} owner.name is required"
					errors=$((errors + 1))
				fi
			fi

			# Check plugins is an array
			if [ "$plugins" = "null" ] || [ -z "$plugins" ]; then
				echo -e "  ${RED}✗${NC} Missing required field: plugins (must be an array)"
				errors=$((errors + 1))
			else
				plugins_count=$(jq -r '.plugins | length' .claude-plugin/marketplace.json)
				echo -e "  ${GREEN}✔${NC} plugins array has $plugins_count items"

				# Validate each plugin entry
				for i in $(seq 0 $((plugins_count - 1))); do
					plugin_name=$(jq -r ".plugins[$i].name // empty" .claude-plugin/marketplace.json)
					plugin_source=$(jq -r ".plugins[$i].source // empty" .claude-plugin/marketplace.json)

					if [ -z "$plugin_name" ]; then
						echo -e "  ${RED}✗${NC} Plugin at index $i is missing 'name'"
						errors=$((errors + 1))
					fi

					if [ -z "$plugin_source" ]; then
						echo -e "  ${RED}✗${NC} Plugin at index $i is missing 'source'"
						errors=$((errors + 1))
					elif [ ! -d "$plugin_source" ]; then
						echo -e "  ${RED}✗${NC} Plugin source directory does not exist: $plugin_source"
						errors=$((errors + 1))
					fi
				done
			fi
		fi
	else
		echo -e "  ${YELLOW}⚠${NC} Skipping JSON validation (jq not installed)"
	fi
	echo
else
	echo -e "${YELLOW}⚠${NC} marketplace.json not found at .claude-plugin/marketplace.json"
	echo
fi

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $errors -eq 0 ]; then
	echo -e "${GREEN}✔ Validation passed${NC}"
	exit 0
else
	echo -e "${RED}✗ Validation failed with $errors error(s)${NC}"
	exit 1
fi
