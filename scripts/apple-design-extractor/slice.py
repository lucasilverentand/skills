#!/usr/bin/env python3
"""Slice paraphrased design-guideline pages into per-platform variants.

For each source page we decide which platform plugins it belongs to, then emit
a scoped markdown file for each — dropping unrelated platform subsections and
keeping the universal body.

Plugin mapping:
  ios slice             → iOS + iPadOS content (merged)
  macos slice           → macOS
  watchos slice         → watchOS
  tvos slice            → tvOS
  visionos slice        → visionOS

Output: build/plugin-slices/{platform}/{slug}.md
"""
from __future__ import annotations

import json
import argparse
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
SRC = REPO / "build" / "apple-design-md-paraphrased"
OUT = REPO / "build" / "plugin-slices"

PLATFORMS = ["ios", "macos", "watchos", "tvos", "visionos"]
PLATFORM_LABEL = {
    "ios": "iOS & iPadOS",
    "macos": "macOS",
    "watchos": "watchOS",
    "tvos": "tvOS",
    "visionos": "visionOS",
}
# Which H4 subsection titles count as "this plugin's" content
PLATFORM_SUBSECTIONS: dict[str, list[str]] = {
    "ios":      ["iOS, iPadOS", "iOS", "iPadOS"],
    "macos":    ["macOS"],
    "watchos":  ["watchOS"],
    "tvos":     ["tvOS"],
    "visionos": ["visionOS"],
}
# Pages that should only exist in specific plugins (overrides detection)
EXCLUSIVE: dict[str, set[str]] = {
    "ios": {
        "home-screen-quick-actions",
        "tap-to-pay-on-iphone",
        "designing-for-ios",
        "designing-for-ipados",
        "apple-pencil-and-scribble",
        "carplay",
    },
    "macos": {
        "mac-catalyst",
        "the-menu-bar",
        "dock-menus",
        "panels",
        "column-views",
        "combo-boxes",
        "pop-up-buttons",
        "token-fields",
        "path-controls",
        "designing-for-macos",
    },
    "watchos": {
        "complications",
        "watch-faces",
        "digital-crown",
        "activity-rings",
        "workouts",
        "always-on",
        "designing-for-watchos",
    },
    "tvos": {
        "top-shelf",
        "remotes",
        "focus-and-selection",
        "designing-for-tvos",
    },
    "visionos": {
        "ornaments",
        "immersive-experiences",
        "eyes",
        "spatial-layout",
        "designing-for-visionos",
    },
}
# Pages with no platform variance — always universal across all 5 plugins
SKIP_UNIVERSAL_CHECK = {"index", "designing-for-games"}


def locate_exclusive(slug: str) -> str | None:
    for plat, pages in EXCLUSIVE.items():
        if slug in pages:
            return plat
    return None


def split_platform_considerations(body: str) -> tuple[str, dict[str, str], str]:
    """Return (pre_PC, subsections_by_platform, post_PC).

    pre_PC         — everything before "### Platform considerations"
    subsections    — map of subsection-name (e.g. "iOS, iPadOS") → content
    post_PC        — anything after the PC section (e.g. "### Resources")
    """
    # Locate PC section
    pc_match = re.search(r"(?m)^### Platform considerations\s*$", body)
    if not pc_match:
        return body, {}, ""
    pre = body[: pc_match.start()].rstrip()
    rest = body[pc_match.end():]
    # PC ends at next H3 (### foo) or end of doc
    end_match = re.search(r"(?m)^### (?!Platform considerations)", rest)
    if end_match:
        pc_body = rest[: end_match.start()]
        post = rest[end_match.start():]
    else:
        pc_body = rest
        post = ""
    # Split pc_body at H4 headings
    subs: dict[str, str] = {}
    current_name: str | None = None
    current_lines: list[str] = []
    for ln in pc_body.splitlines():
        m = re.match(r"^####\s+(.*?)\s*$", ln)
        if m:
            if current_name is not None:
                subs[current_name] = "\n".join(current_lines).strip()
            current_name = m.group(1).strip()
            current_lines = []
        else:
            if current_name is not None:
                current_lines.append(ln)
    if current_name is not None:
        subs[current_name] = "\n".join(current_lines).strip()
    return pre, subs, post.strip()


def page_platforms(subs: dict[str, str]) -> set[str]:
    """Which platform plugins claim this page based on its PC subsections."""
    claimed: set[str] = set()
    for sub_name in subs.keys():
        for plat, accepted in PLATFORM_SUBSECTIONS.items():
            if sub_name in accepted:
                claimed.add(plat)
                break
    return claimed


def build_slice(title: str, abstract: str, pre: str, subs: dict[str, str], post: str, platform: str) -> str:
    """Assemble the markdown file for one (page, platform) pair."""
    parts: list[str] = [title]
    if abstract.strip():
        parts.append(abstract.strip())
    if pre.strip():
        parts.append(pre.strip())
    # Emit only this platform's PC subsections
    wanted = PLATFORM_SUBSECTIONS[platform]
    matching = [(name, body) for name, body in subs.items() if name in wanted]
    if matching:
        parts.append(f"## Platform guidance — {PLATFORM_LABEL[platform]}")
        for name, body in matching:
            if len([m for m in matching]) > 1:
                parts.append(f"### {name}")
            if body.strip():
                parts.append(body.strip())
    if post.strip():
        parts.append(post.strip())
    return "\n\n".join(p for p in parts if p.strip()).rstrip() + "\n"


def extract_title_and_abstract(text: str) -> tuple[str, str, str]:
    """Return (title_line, abstract_paragraph, remaining_body)."""
    m = re.match(r"(#\s+.+?)\n+(.*)", text, re.S)
    if not m:
        return "# Untitled", "", text
    title = m.group(1).strip()
    rest = m.group(2)
    # Abstract = first paragraph before a blank-line break that ISN'T immediately
    # followed by a heading. Actually simpler: first non-heading paragraph.
    paras = re.split(r"\n\s*\n", rest, maxsplit=1)
    if len(paras) == 2:
        first, remainder = paras
    else:
        first, remainder = paras[0], ""
    # If the first "para" starts with a heading, there's no abstract
    if first.lstrip().startswith("#"):
        return title, "", rest
    return title, first.strip(), remainder


def main():
    global SRC, OUT
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-root", type=Path)
    parser.add_argument("--model", help="Model used by the paraphrase stage")
    parser.add_argument("--workspace-root", type=Path, default=REPO / "build")
    parser.add_argument("--output-root", required=True, type=Path)
    args = parser.parse_args()
    if args.input_root is None and not args.model:
        parser.error("provide --input-root or --model")
    SRC = args.input_root.resolve() if args.input_root else args.workspace_root.resolve() / ("apple-design-md-paraphrased-" + args.model.replace("/", "_"))
    if not SRC.is_dir():
        parser.error("input directory does not exist")
    OUT = args.output_root.resolve()
    OUT.mkdir(parents=True, exist_ok=True)
    for p in PLATFORMS:
        (OUT / p).mkdir(parents=True, exist_ok=True)

    files = sorted(SRC.rglob("*.md"))
    tree: dict[str, list[dict]] = {p: [] for p in PLATFORMS}
    for f in files:
        slug = f.stem
        text = f.read_text()
        title, abstract, rest = extract_title_and_abstract(text)
        pre, subs, post = split_platform_considerations(rest)

        exclusive = locate_exclusive(slug)
        if exclusive:
            targets = {exclusive}
        else:
            claimed = page_platforms(subs)
            if not claimed:
                # Universal page — copy to all
                targets = set(PLATFORMS)
            else:
                # Universal base content + claimed platforms
                # Most "components" fall here (buttons has iOS/macOS/watchOS/...)
                # Any platform that DIDN'T claim still gets the universal content
                # since the guidance usually applies broadly.
                # Exception: if only 1-2 platforms claimed, page is narrow — only ship to claimed.
                if len(claimed) >= 3:
                    targets = set(PLATFORMS)
                else:
                    targets = claimed

        for plat in sorted(targets):
            md = build_slice(title, abstract, pre, subs, post, plat)
            target = OUT / plat / f.relative_to(SRC)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(md)
            tree[plat].append({
                "slug": slug,
                "title": title.lstrip("# ").strip(),
                "abstract": abstract,
                "size_bytes": len(md.encode()),
                "est_tokens": len(md) // 4,
            })

    # Stats
    for p in PLATFORMS:
        n = len(tree[p])
        toks = sum(e["est_tokens"] for e in tree[p])
        print(f"  {p:9s}  {n:3d} skills  ~{toks:,} tokens")
    (OUT / "_tree.json").write_text(json.dumps(tree, indent=2))
    print(f"\ntotal platform references: {sum(len(v) for v in tree.values())}")


if __name__ == "__main__":
    main()
