#!/usr/bin/env python3
"""Post-process the raw HIG markdown to cut tokens without losing guidance.

Reductions applied:
  1. Strip "### Change log" sections (historical revisions, not design guidance)
  2. Strip "### Resources" sections (we keep topicSections separately)
  3. Replace decorative ![checkmark]/![crossout] images with ✓/✗ glyphs
  4. Collapse verbose image alt text to first clause (or drop figure entirely)
  5. Make internal HIG links relative:
       [Color](https://developer.apple.com/design/human-interface-guidelines/color)
       → [Color](color.md)
  6. Compress developer-doc links:
       [UIBlurEffect](https://developer.apple.com/documentation/UIKit/UIBlurEffect)
       → [UIBlurEffect](apple:UIKit/UIBlurEffect)
  7. Remove empty sections (heading with no content before next heading)
  8. Remove standalone image lines (they reference assets we don't ship)
  9. Fix blank-line-between-table-rows bug

Reads build/apple-design-md/*.md, writes build/apple-design-md-opt/*.md.
"""
from __future__ import annotations

import re
import json
import argparse
from pathlib import Path

SRC = Path(__file__).resolve().parent.parent.parent / "build" / "apple-design-md"
DST = Path(__file__).resolve().parent.parent.parent / "build" / "apple-design-md-opt"

DESIGN_BASE = "https://developer.apple.com/design/human-interface-guidelines/"
DOC_BASE = "https://developer.apple.com/documentation/"


def compress_links(text: str, current_slug: str | None = None) -> str:
    # 1. Design-guidelines URL → relative .md; preserve anchors; collapse self-refs
    def design_sub(m):
        label = m.group(1)
        raw = m.group(2).rstrip("/")
        slug, _, anchor = raw.partition("#")
        if current_slug and slug == current_slug:
            # self-link — keep anchor only, drop redundant slug
            return f"[{label}](#{anchor})" if anchor else label
        target = f"{slug}.md" + (f"#{anchor}" if anchor else "")
        return f"[{label}]({target})"

    text = re.sub(
        r"\[([^\]]+)\]\(" + re.escape(DESIGN_BASE) + r"([^)\s]+)\)",
        design_sub,
        text,
    )
    # 2. Developer docs → apple: URI
    text = re.sub(
        r"\]\(" + re.escape(DOC_BASE) + r"([^)\s]+)\)",
        r"](apple:\1)",
        text,
    )
    return text


def strip_trailing_sections(text: str) -> str:
    """Drop Change log and Resources trailing sections."""
    text = re.sub(r"\n### Change log.*\Z", "\n", text, flags=re.S)
    text = re.sub(r"\n### Resources.*?(?=\n### |\Z)", "\n", text, flags=re.S)
    return text


def replace_decorative_images(text: str) -> str:
    # Collapse checkmark/crossout images to glyph markers on the preceding line.
    # Apple emits them right after the image illustrating the good/bad example.
    text = re.sub(r"\n?!\[[^\]]*?correct usage\]\(checkmark\.png\)\n?", " ✓\n", text)
    text = re.sub(r"\n?!\[[^\]]*?incorrect usage\]\(crossout\.png\)\n?", " ✗\n", text)
    # Also catch any lingering
    text = re.sub(r"!\[[^\]]*\]\(checkmark\.png\)", "✓", text)
    text = re.sub(r"!\[[^\]]*\]\(crossout\.png\)", "✗", text)
    return text


def strip_all_images(text: str) -> str:
    """Drop all remaining standalone image lines — we don't ship the assets.
    Retains ✓/✗ glyphs already substituted, and any inline image references in prose."""
    # standalone image line
    text = re.sub(r"(?m)^!\[[^\]]*\]\([^)]+\)\s*$\n?", "", text)
    # inline stray image refs within a paragraph — replace with empty
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)", "", text)
    return text


def strip_video_placeholders(text: str) -> str:
    return re.sub(r"(?m)^\[video: [^\]]+\]\s*$\n?", "", text)


def strip_orphan_marks(text: str) -> str:
    """After image removal, lone ✓/✗ lines with no surrounding context are noise."""
    # Collapse isolated ✓ or ✗ (possibly with leading spaces) lines
    return re.sub(r"(?m)^\s*[✓✗]\s*$\n?", "", text)


def strip_empty_sections(text: str) -> str:
    """Remove headings that have no body before the next heading (any level)."""
    lines = text.split("\n")
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        m = re.match(r"^(#+)\s+(.*)$", line)
        if m:
            level = len(m.group(1))
            # peek ahead: is there any non-blank, non-heading content before the next heading at <= level?
            has_content = False
            j = i + 1
            while j < len(lines):
                nxt = lines[j]
                nm = re.match(r"^(#+)\s+", nxt)
                if nm and len(nm.group(1)) <= level:
                    break
                if nxt.strip():
                    has_content = True
                    break
                j += 1
            if not has_content:
                # skip this heading and any blank lines until next heading
                i = j
                continue
        out.append(line)
        i += 1
    return "\n".join(out)


def fix_tables(text: str) -> str:
    """Remove blank lines between consecutive table rows."""
    return re.sub(r"(\|[^\n]*\|)\n\n(?=\|)", r"\1\n", text)


def collapse_blank_lines(text: str) -> str:
    return re.sub(r"\n{3,}", "\n\n", text).strip() + "\n"


def optimize(text: str, slug: str | None = None) -> str:
    text = strip_trailing_sections(text)
    text = replace_decorative_images(text)
    text = strip_all_images(text)
    text = strip_video_placeholders(text)
    text = strip_orphan_marks(text)
    text = compress_links(text, current_slug=slug)
    text = fix_tables(text)
    text = strip_empty_sections(text)
    text = collapse_blank_lines(text)
    return text


def est_tokens(s: str) -> int:
    return len(s) // 4


def main():
    global SRC, DST
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-root", required=True, type=Path)
    parser.add_argument("--output-root", required=True, type=Path)
    args = parser.parse_args()
    SRC, DST = args.input_root.resolve(), args.output_root.resolve()
    DST.mkdir(parents=True, exist_ok=True)
    before = 0
    after = 0
    files = sorted(SRC.rglob("*.md"))
    stats = []
    for f in files:
        t = f.read_text()
        o = optimize(t, slug=f.stem)
        target = DST / f.relative_to(SRC)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(o)
        before += est_tokens(t)
        after += est_tokens(o)
        stats.append({
            "file": f.name,
            "before_tokens": est_tokens(t),
            "after_tokens": est_tokens(o),
        })
    (DST / "_stats.json").write_text(json.dumps(stats, indent=2))
    print(f"Files: {len(files)}")
    print(f"Before: ~{before:,} tokens")
    print(f"After:  ~{after:,} tokens")
    print(f"Saved:  ~{before-after:,} tokens ({(before-after)*100/max(1,before):.1f}%)")


if __name__ == "__main__":
    main()
