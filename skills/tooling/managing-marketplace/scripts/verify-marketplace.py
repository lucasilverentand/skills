#!/usr/bin/env python3
"""Verify marketplace.json integrity and skill compliance.

Standalone script (stdlib only) for CI or local use.
Checks marketplace structure, skill paths, frontmatter, naming, and orphans.

Usage:
    python verify-marketplace.py [--json] [--fix] [marketplace.json]
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path


# --- Constants ---

REQUIRED_MARKETPLACE_FIELDS = {"name", "plugins"}
REQUIRED_PLUGIN_FIELDS = {"name", "source"}
RECOMMENDED_PLUGIN_FIELDS = {"description", "category"}
REQUIRED_FRONTMATTER_FIELDS = {"name", "description"}
MAX_NAME_LENGTH = 64
MAX_DESCRIPTION_LENGTH = 1024
MAX_SKILL_LINES = 500
NAME_PATTERN = re.compile(r"^[a-z][a-z0-9]*(-[a-z0-9]+)*$")
GERUND_SUFFIXES = ("ing", "ment", "tion", "sion")
FIRST_PERSON_STARTS = ("i ", "we ", "my ", "our ")


# --- Report data ---

class Report:
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.info = []
        self.stats = {
            "plugins_checked": 0,
            "skills_checked": 0,
            "skills_missing": 0,
            "orphans_found": 0,
        }

    def error(self, rule, message, path=None, fix=None):
        entry = {"severity": "error", "rule": rule, "message": message}
        if path:
            entry["path"] = str(path)
        if fix:
            entry["fix"] = fix
        self.errors.append(entry)

    def warning(self, rule, message, path=None, fix=None):
        entry = {"severity": "warning", "rule": rule, "message": message}
        if path:
            entry["path"] = str(path)
        if fix:
            entry["fix"] = fix
        self.warnings.append(entry)

    def passed(self):
        return len(self.errors) == 0

    def to_dict(self):
        return {
            "status": "PASS" if self.passed() else "FAIL",
            "errors": self.errors,
            "warnings": self.warnings,
            "stats": self.stats,
        }

    def to_table(self):
        lines = []
        status = "PASS" if self.passed() else "FAIL"
        lines.append(f"## Marketplace Validation Report")
        lines.append(f"")
        lines.append(f"Status: {status}")
        lines.append(f"")

        if self.errors:
            lines.append(f"### Errors ({len(self.errors)})")
            for e in self.errors:
                path_str = f" {e['path']}" if e.get("path") else ""
                fix_str = f"\n  Fix: {e['fix']}" if e.get("fix") else ""
                lines.append(f"- [{e['rule']}]{path_str} - {e['message']}{fix_str}")
            lines.append("")

        if self.warnings:
            lines.append(f"### Warnings ({len(self.warnings)})")
            for w in self.warnings:
                path_str = f" {w['path']}" if w.get("path") else ""
                fix_str = f"\n  Fix: {w['fix']}" if w.get("fix") else ""
                lines.append(f"- [{w['rule']}]{path_str} - {w['message']}{fix_str}")
            lines.append("")

        lines.append(f"### Summary")
        lines.append(f"- Plugins checked: {self.stats['plugins_checked']}")
        lines.append(f"- Skills checked: {self.stats['skills_checked']}")
        lines.append(f"- Skills missing: {self.stats['skills_missing']}")
        lines.append(f"- Orphans found: {self.stats['orphans_found']}")
        lines.append(f"- Errors: {len(self.errors)}")
        lines.append(f"- Warnings: {len(self.warnings)}")

        return "\n".join(lines)


# --- Frontmatter parser ---

def parse_frontmatter(content):
    """Parse YAML frontmatter from SKILL.md content. Returns (dict, error)."""
    lines = content.split("\n")
    if not lines or lines[0].strip() != "---":
        return None, "No YAML frontmatter found (missing opening ---)"

    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break

    if end_idx is None:
        return None, "Unclosed YAML frontmatter (missing closing ---)"

    fm = {}
    current_key = None
    current_list = None

    for line in lines[1:end_idx]:
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue

        # List item
        if stripped.startswith("- "):
            if current_key and current_list is not None:
                current_list.append(stripped[2:].strip())
            continue

        # Key-value pair
        if ":" in stripped:
            key, _, value = stripped.partition(":")
            key = key.strip()
            value = value.strip()

            # Save previous list if any
            if current_key and current_list is not None:
                fm[current_key] = current_list

            current_key = key
            if value:
                fm[key] = value
                current_list = None
            else:
                current_list = []

    # Save final list
    if current_key and current_list is not None:
        fm[current_key] = current_list

    return fm, None


# --- Validators ---

def validate_marketplace_structure(data, report):
    """Check marketplace.json top-level structure."""
    for field in REQUIRED_MARKETPLACE_FIELDS:
        if field not in data:
            report.error("required-field", f"Missing required field: {field}")

    if "plugins" in data and not isinstance(data["plugins"], list):
        report.error("invalid-type", "Field 'plugins' must be an array")


def validate_plugin(plugin, idx, all_skill_paths, report, repo_root):
    """Validate a single plugin entry."""
    report.stats["plugins_checked"] += 1
    plugin_name = plugin.get("name", f"plugin[{idx}]")

    for field in REQUIRED_PLUGIN_FIELDS:
        if field not in plugin:
            report.error("required-field", f"Plugin '{plugin_name}': missing required field '{field}'")

    for field in RECOMMENDED_PLUGIN_FIELDS:
        if field not in plugin:
            report.warning("recommended-field", f"Plugin '{plugin_name}': missing recommended field '{field}'")

    skills = plugin.get("skills", [])
    if not isinstance(skills, list):
        report.error("invalid-type", f"Plugin '{plugin_name}': 'skills' must be an array")
        return

    for skill_path in skills:
        report.stats["skills_checked"] += 1
        normalized = skill_path.lstrip("./")
        skill_md = repo_root / normalized / "SKILL.md"

        if not skill_md.is_file():
            report.stats["skills_missing"] += 1
            report.error(
                "missing-skill",
                f"Skill path does not exist: {skill_path}",
                path=str(skill_md),
                fix=f"Remove '{skill_path}' from plugin '{plugin_name}' or create {skill_md}",
            )
            continue

        # Check for duplicate paths across plugins
        if normalized in all_skill_paths:
            report.error(
                "duplicate-path",
                f"Skill path '{skill_path}' appears in both '{all_skill_paths[normalized]}' and '{plugin_name}'",
            )
        all_skill_paths[normalized] = plugin_name

        # Validate SKILL.md content
        validate_skill_md(skill_md, normalized, report)


def validate_skill_md(skill_md, skill_path, report):
    """Validate individual SKILL.md file."""
    try:
        content = skill_md.read_text(encoding="utf-8")
    except Exception as e:
        report.error("read-error", f"Cannot read {skill_md}: {e}", path=str(skill_md))
        return

    line_count = len(content.split("\n"))
    if line_count > MAX_SKILL_LINES:
        report.warning(
            "skill-too-large",
            f"SKILL.md is {line_count} lines (max {MAX_SKILL_LINES})",
            path=str(skill_md),
        )

    fm, err = parse_frontmatter(content)
    if err:
        report.error("invalid-frontmatter", err, path=str(skill_md))
        return

    if fm is None:
        report.error("missing-frontmatter", "No frontmatter found", path=str(skill_md))
        return

    # Check required frontmatter fields
    for field in REQUIRED_FRONTMATTER_FIELDS:
        if field not in fm:
            report.error(
                "missing-frontmatter-field",
                f"Missing required frontmatter field: {field}",
                path=str(skill_md),
            )

    # Validate name
    name = fm.get("name", "")
    if name:
        validate_name(name, skill_path, skill_md, report)

    # Validate description
    desc = fm.get("description", "")
    if desc:
        validate_description(desc, skill_md, report)


def validate_name(name, skill_path, skill_md, report):
    """Validate skill name against naming conventions."""
    if len(name) > MAX_NAME_LENGTH:
        report.error(
            "name-too-long",
            f"Name '{name}' exceeds {MAX_NAME_LENGTH} chars ({len(name)})",
            path=str(skill_md),
        )

    if not NAME_PATTERN.match(name):
        report.error(
            "invalid-name-format",
            f"Name '{name}' must be lowercase letters, numbers, and hyphens only",
            path=str(skill_md),
        )

    if "--" in name:
        report.error(
            "consecutive-hyphens",
            f"Name '{name}' contains consecutive hyphens",
            path=str(skill_md),
        )

    # Check gerund form (first word should end in common gerund suffixes)
    first_word = name.split("-")[0]
    if not any(first_word.endswith(s) for s in GERUND_SUFFIXES):
        report.warning(
            "non-gerund-name",
            f"Name '{name}' first word '{first_word}' doesn't appear to be gerund form",
            path=str(skill_md),
        )

    # Check name matches directory (allow parent-dir pattern for namespacing)
    parts = Path(skill_path).parts
    dir_name = parts[-1] if parts else ""
    parent_dir = parts[-2] if len(parts) >= 2 else ""
    parent_prefixed = f"{parent_dir}-{dir_name}" if parent_dir else ""
    if name != dir_name and name != parent_prefixed:
        report.warning(
            "name-mismatch",
            f"Frontmatter name '{name}' doesn't match directory name '{dir_name}' or '{parent_prefixed}'",
            path=str(skill_md),
        )


def validate_description(desc, skill_md, report):
    """Validate skill description."""
    if len(desc) > MAX_DESCRIPTION_LENGTH:
        report.error(
            "description-too-long",
            f"Description exceeds {MAX_DESCRIPTION_LENGTH} chars ({len(desc)})",
            path=str(skill_md),
        )

    lower = desc.lower().strip()
    if any(lower.startswith(p) for p in FIRST_PERSON_STARTS):
        report.warning(
            "first-person-description",
            "Description should be third-person (avoid 'I', 'We')",
            path=str(skill_md),
        )

    if "use when" not in lower:
        report.warning(
            "missing-use-when",
            "Description should include 'Use when' trigger clause",
            path=str(skill_md),
        )


def find_orphan_skills(repo_root, registered_paths, report):
    """Find SKILL.md files on disk not registered in marketplace.json."""
    skills_dir = repo_root / "skills"
    if not skills_dir.is_dir():
        return []

    orphans = []
    for skill_md in skills_dir.rglob("SKILL.md"):
        rel = skill_md.parent.relative_to(repo_root)
        normalized = str(rel)
        if normalized not in registered_paths:
            orphans.append(normalized)
            report.stats["orphans_found"] += 1
            report.warning(
                "orphan-skill",
                f"Skill exists on disk but not in marketplace.json: {normalized}",
                path=str(skill_md),
                fix=f"Add './{normalized}' to a plugin in marketplace.json",
            )

    return orphans


def check_unique_plugin_names(plugins, report):
    """Check that plugin names are unique."""
    seen = {}
    for i, plugin in enumerate(plugins):
        name = plugin.get("name", "")
        if not name:
            continue
        if name in seen:
            report.error(
                "duplicate-plugin-name",
                f"Plugin name '{name}' is used by plugins at index {seen[name]} and {i}",
            )
        seen[name] = i


# --- Fix mode ---

def apply_fixes(marketplace_path, data, repo_root, report):
    """Apply auto-fixes: remove missing skills, add orphans."""
    fixed = False

    # Remove missing skill paths
    for plugin in data.get("plugins", []):
        skills = plugin.get("skills", [])
        valid = []
        for sp in skills:
            normalized = sp.lstrip("./")
            skill_md = repo_root / normalized / "SKILL.md"
            if skill_md.is_file():
                valid.append(sp)
            else:
                print(f"  Removed missing: {sp} from {plugin.get('name', '?')}")
                fixed = True
        plugin["skills"] = valid

    # Remove plugins with no skills
    original_count = len(data["plugins"])
    data["plugins"] = [p for p in data["plugins"] if p.get("skills")]
    if len(data["plugins"]) < original_count:
        print(f"  Removed {original_count - len(data['plugins'])} empty plugins")
        fixed = True

    if fixed:
        with open(marketplace_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")
        print(f"\n  Fixed marketplace.json written to {marketplace_path}")

    return fixed


# --- Main ---

def verify(marketplace_path, output_json=False, fix=False):
    """Run all validations and produce report."""
    report = Report()
    marketplace_path = Path(marketplace_path).resolve()
    repo_root = marketplace_path.parent.parent  # .claude-plugin/ -> repo root

    # Parse marketplace.json
    if not marketplace_path.is_file():
        report.error("file-not-found", f"File not found: {marketplace_path}")
        return report

    try:
        with open(marketplace_path, encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        report.error("invalid-json", f"Invalid JSON: {e}")
        return report

    # Validate structure
    validate_marketplace_structure(data, report)

    plugins = data.get("plugins", [])
    if not isinstance(plugins, list):
        return report

    # Check unique names
    check_unique_plugin_names(plugins, report)

    # Validate each plugin and its skills
    all_skill_paths = {}
    for i, plugin in enumerate(plugins):
        validate_plugin(plugin, i, all_skill_paths, report, repo_root)

    # Find orphans
    find_orphan_skills(repo_root, all_skill_paths, report)

    # Apply fixes if requested
    if fix and not report.passed():
        apply_fixes(marketplace_path, data, repo_root, report)

    return report


def main():
    parser = argparse.ArgumentParser(description="Verify marketplace.json integrity")
    parser.add_argument("path", nargs="?", default=".claude-plugin/marketplace.json",
                        help="Path to marketplace.json (default: .claude-plugin/marketplace.json)")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--fix", action="store_true",
                        help="Auto-fix: remove missing skills, remove empty plugins")
    args = parser.parse_args()

    report = verify(args.path, output_json=args.json, fix=args.fix)

    if args.json:
        print(json.dumps(report.to_dict(), indent=2))
    else:
        print(report.to_table())

    sys.exit(0 if report.passed() else 1)


if __name__ == "__main__":
    main()
