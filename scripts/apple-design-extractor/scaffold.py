#!/usr/bin/env python3
"""Stage platform slices under the current Apple plugin reference contract.

Output is an explicitly selected repository-shaped staging root. This command
never regenerates plugin manifests or replaces the curated platforms SKILL.md.
"""
from __future__ import annotations

import argparse
from pathlib import Path

PLATFORMS = ("ios", "macos", "watchos", "tvos", "visionos")


def stage_references(input_root: Path, output_root: Path, platforms: list[str], replace: bool = False) -> list[Path]:
    input_root, output_root = input_root.resolve(), output_root.resolve()
    if not input_root.is_dir():
        raise ValueError("input directory does not exist")
    if not platforms or any(platform not in PLATFORMS for platform in platforms):
        raise ValueError("select a known Apple platform")
    planned: list[tuple[Path, str]] = []
    for platform in platforms:
        source = input_root / platform
        if not source.is_dir():
            raise ValueError(f"missing platform slice directory: {platform}")
        for item in sorted(source.rglob("*.md")):
            target = output_root / "plugins/apple/skills/platforms/references" / platform / item.relative_to(source)
            if not target.resolve().is_relative_to(output_root):
                raise ValueError("output path escapes the staging root")
            if target.exists() and not replace:
                raise FileExistsError(f"refusing to overwrite {target}; select a new staging root")
            planned.append((target, item.read_text()))
    if not planned:
        raise ValueError("no Markdown slices found")
    for target, content in planned:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content)
    return [target for target, _ in planned]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-root", required=True, type=Path)
    parser.add_argument("--output-root", required=True, type=Path)
    parser.add_argument("--platform", action="append", choices=PLATFORMS)
    parser.add_argument("--replace", action="store_true", help="Explicitly permit replacement inside the chosen staging root")
    args = parser.parse_args()
    try:
        outputs = stage_references(args.input_root, args.output_root, args.platform or list(PLATFORMS), args.replace)
    except (ValueError, FileExistsError) as error:
        parser.error(str(error))
    print(f"Staged {len(outputs)} platform references. Review the diff before copying into the repository.")


if __name__ == "__main__":
    main()
