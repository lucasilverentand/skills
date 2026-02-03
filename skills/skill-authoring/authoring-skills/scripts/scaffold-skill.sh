#!/usr/bin/env bash
# Scaffolds a new skill with proper structure
# Usage: scaffold-skill.sh <skill-name> <category> [skill-type]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES_DIR="$SCRIPT_DIR/../references/templates"

usage() {
	cat <<EOF
Usage: $0 <skill-name> <category> [skill-type]

Arguments:
  skill-name    Name in gerund form (e.g., searching-jira, processing-pdfs)
  category      Category directory (e.g., integrations, devtools, quality)
  skill-type    Template type (default: mcp-caller)
                Options: mcp-caller, code-generator, config-manager,
                         workflow, analyzer, investigator

Examples:
  $0 searching-jira integrations mcp-caller
  $0 generating-tests quality code-generator
  $0 debugging-auth debugging investigator
EOF
	exit 1
}

validate_name() {
	local name="$1"

	if [[ ${#name} -gt 64 ]]; then
		echo "Error: name exceeds 64 characters"
		exit 1
	fi

	if [[ ! $name =~ ^[a-z][a-z0-9]*(-[a-z0-9]+)*$ ]]; then
		echo "Error: name must be lowercase letters, numbers, and hyphens"
		exit 1
	fi

	if [[ $name =~ -- ]]; then
		echo "Error: name cannot have consecutive hyphens"
		exit 1
	fi

	# Warn if not gerund
	if [[ ! $name =~ -ing(-|$) ]] && [[ ! $name =~ ^[a-z]+ing(-|$) ]]; then
		echo "Warning: name should use gerund form (verb + -ing)"
		echo "  Suggested: $(suggest_gerund "$name")"
	fi
}

suggest_gerund() {
	local name="$1"
	# Common transformations
	echo "$name" | sed -E '
        s/^(.+)-processor$/processing-\1s/
        s/^(.+)-generator$/generating-\1s/
        s/^(.+)-analyzer$/analyzing-\1/
        s/^(.+)-validator$/validating-\1/
        s/^(.+)-manager$/managing-\1/
        s/^(.+)-runner$/running-\1/
    '
}

get_template() {
	local skill_type="$1"
	local template_file="$TEMPLATES_DIR/${skill_type}.md"

	if [[ -f $template_file ]]; then
		cat "$template_file"
	else
		echo "Error: Template not found: $template_file"
		echo "Available templates:"
		find "$TEMPLATES_DIR" -name "*.md" -print0 2>/dev/null | xargs -0 -n1 basename | sed 's/\.md$//'
		exit 1
	fi
}

main() {
	if [[ $# -lt 2 ]]; then
		usage
	fi

	local skill_name="$1"
	local category="$2"
	local skill_type="${3:-mcp-caller}"

	validate_name "$skill_name"

	# Find skills directory (go up from scripts to skill-authoring, then to skills root)
	local skills_root
	skills_root="$(cd "$SCRIPT_DIR/../.." && pwd)"

	local skill_dir="$skills_root/$category/$skill_name"

	if [[ -d $skill_dir ]]; then
		echo "Error: Skill already exists at $skill_dir"
		exit 1
	fi

	echo "Creating skill: $skill_name"
	echo "  Category: $category"
	echo "  Type: $skill_type"
	echo "  Path: $skill_dir"
	echo ""

	# Create directory
	mkdir -p "$skill_dir"

	# Get template and customize
	local template
	template=$(get_template "$skill_type")

	# Replace placeholders
	# Convert skill-name to Title Case for heading
	local title
	title=$(echo "$skill_name" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')

	echo "$template" | sed "
        s/{skill-name}/$skill_name/g
        s/{Skill Title}/$title/g
        s/{category}/$category/g
    " >"$skill_dir/SKILL.md"

	echo "Created: $skill_dir/SKILL.md"
	echo ""
	echo "Next steps:"
	echo "  1. Edit $skill_dir/SKILL.md to customize"
	echo "  2. Update the description with specific 'Use when' triggers"
	echo "  3. Add realistic examples"
	echo "  4. Run: ./scripts/validate-skill.sh $skill_name"
}

main "$@"
