#!/usr/bin/env bash
# Validates a SKILL.md file against the specification
# Usage: validate-skill.sh [path-to-SKILL.md or skill-name]

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

error() {
	echo -e "${RED}ERROR:${NC} $1"
	((ERRORS++))
}
warn() {
	echo -e "${YELLOW}WARN:${NC} $1"
	((WARNINGS++))
}

# Find the SKILL.md file
find_skill() {
	local input="$1"

	# Direct path
	if [[ -f $input ]]; then
		echo "$input"
		return 0
	fi

	# Path to directory containing SKILL.md
	if [[ -f "$input/SKILL.md" ]]; then
		echo "$input/SKILL.md"
		return 0
	fi

	# Search by skill name
	local found
	found=$(find . -path "*/$input/SKILL.md" 2>/dev/null | head -1)
	if [[ -n $found ]]; then
		echo "$found"
		return 0
	fi

	return 1
}

# Extract YAML frontmatter value
get_frontmatter() {
	local file="$1"
	local field="$2"
	sed -n '/^---$/,/^---$/p' "$file" | grep -m1 "^${field}:" | sed "s/^${field}: *//"
}

# Validate name field
validate_name() {
	local name="$1"
	local dir_name="$2"

	if [[ -z $name ]]; then
		error "name field is empty"
		return
	fi

	if [[ ${#name} -gt 64 ]]; then
		error "name exceeds 64 characters (${#name})"
	fi

	if [[ ! $name =~ ^[a-z][a-z0-9]*(-[a-z0-9]+)*$ ]]; then
		error "name has invalid format (must be lowercase, hyphens, no --)"
	fi

	if [[ $name =~ ^- ]] || [[ $name =~ -$ ]]; then
		error "name cannot start or end with hyphen"
	fi

	if [[ $name =~ -- ]]; then
		error "name cannot have consecutive hyphens"
	fi

	if [[ $name != "$dir_name" ]]; then
		warn "name '$name' doesn't match directory '$dir_name'"
	fi

	# Check for gerund form
	if [[ ! $name =~ -ing(-|$) ]] && [[ ! $name =~ ^[a-z]+ing(-|$) ]]; then
		warn "name should use gerund form (verb + -ing)"
	fi
}

# Validate description field
validate_description() {
	local desc="$1"

	if [[ -z $desc ]]; then
		error "description field is empty"
		return
	fi

	if [[ ${#desc} -gt 1024 ]]; then
		error "description exceeds 1024 characters (${#desc})"
	fi

	# Check for first/second person
	if [[ $desc =~ ^(I |I\'|You |Your ) ]]; then
		error "description must be third person (not 'I' or 'You')"
	fi

	# Check for "Use when" trigger
	if [[ ! $desc =~ [Uu]se\ when ]]; then
		warn "description should include 'Use when' trigger phrase"
	fi
}

# Validate content structure
validate_content() {
	local file="$1"

	# Check for H1 title
	if ! grep -q '^# ' "$file"; then
		error "missing H1 title"
	fi

	# Check for Your Task section
	if ! grep -q '^## Your Task' "$file"; then
		error "missing '## Your Task' section"
	fi

	# Check for examples
	if ! grep -qi '^## Example' "$file"; then
		warn "missing examples section"
	fi

	# Check for error handling
	if ! grep -qi '^## Error' "$file"; then
		warn "missing error handling section"
	fi

	# Check line count
	local lines
	lines=$(wc -l <"$file" | tr -d ' ')
	if [[ $lines -gt 500 ]]; then
		error "SKILL.md exceeds 500 lines ($lines)"
	elif [[ $lines -gt 300 ]]; then
		warn "SKILL.md exceeds recommended 300 lines ($lines)"
	fi
}

# Validate optional fields
validate_optional() {
	local file="$1"

	local context
	context=$(get_frontmatter "$file" "context")
	if [[ -n $context ]] && [[ $context != "main" ]] && [[ $context != "fork" ]]; then
		error "invalid context value '$context' (must be 'main' or 'fork')"
	fi

	local agent
	agent=$(get_frontmatter "$file" "agent")
	if [[ -n $agent ]]; then
		case "$agent" in
		general-purpose | Explore | Bash | Plan) ;;
		*) error "invalid agent value '$agent'" ;;
		esac
	fi
}

# Main
main() {
	if [[ $# -lt 1 ]]; then
		echo "Usage: $0 <skill-path-or-name>"
		echo "       $0 --all"
		exit 1
	fi

	if [[ $1 == "--all" ]]; then
		# Validate all skills
		local total=0
		local failed=0

		while IFS= read -r skill_file; do
			((total++))
			ERRORS=0
			WARNINGS=0

			echo "Validating: $skill_file"
			validate_single "$skill_file"

			if [[ $ERRORS -gt 0 ]]; then
				((failed++))
			fi
			echo ""
		done < <(find . -name "SKILL.md" -type f 2>/dev/null | sort)

		echo "================================"
		echo "Total: $total skills"
		echo "Passed: $((total - failed))"
		echo "Failed: $failed"
		if [[ $failed -eq 0 ]]; then
			exit 0
		else
			exit 1
		fi
	fi

	local skill_file
	if ! skill_file=$(find_skill "$1"); then
		echo "Could not find skill: $1"
		exit 1
	fi

	validate_single "$skill_file"

	echo ""
	if [[ $ERRORS -eq 0 ]] && [[ $WARNINGS -eq 0 ]]; then
		echo -e "${GREEN}Validation passed!${NC}"
		exit 0
	elif [[ $ERRORS -eq 0 ]]; then
		echo -e "${YELLOW}Validation passed with $WARNINGS warning(s)${NC}"
		exit 0
	else
		echo -e "${RED}Validation failed: $ERRORS error(s), $WARNINGS warning(s)${NC}"
		exit 1
	fi
}

validate_single() {
	local skill_file="$1"
	local dir_name
	dir_name=$(basename "$(dirname "$skill_file")")

	echo "Checking: $skill_file"
	echo ""

	# Check YAML frontmatter exists
	if ! head -1 "$skill_file" | grep -q '^---$'; then
		error "missing YAML frontmatter"
		return
	fi

	local name desc
	name=$(get_frontmatter "$skill_file" "name")
	desc=$(get_frontmatter "$skill_file" "description")

	echo "Name: $name"
	validate_name "$name" "$dir_name"

	echo ""
	echo "Description: ${desc:0:80}..."
	validate_description "$desc"

	echo ""
	echo "Content:"
	validate_content "$skill_file"

	echo ""
	echo "Optional fields:"
	validate_optional "$skill_file"
}

main "$@"
