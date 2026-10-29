#!/usr/bin/env python3
"""Crawl Apple's design guidelines via the DocC JSON API and
convert every article into Markdown.

Outputs:
  .cache/apple-design/**.json       raw DocC JSON (re-used on re-run)
  build/apple-design-md/**.md       converted markdown, one file per article
  build/apple-design-md/_tree.json  hierarchy + metadata
  build/apple-design-md/_stats.json per-file size/token stats
"""
from __future__ import annotations

import concurrent.futures as cf
import json
import argparse
import os
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent
CACHE = REPO / ".cache" / "apple-design"
OUT = REPO / "build" / "apple-design-md"

BASE = "https://developer.apple.com/tutorials/data"
PREFIX = "/design/human-interface-guidelines"
MAX_WORKERS = 2

# ---------- crawler ----------

def fetch_json(path: str) -> dict | None:
    """Fetch one DocC JSON, caching on disk. Returns None on error."""
    cache_file = CACHE / (path.lstrip("/") + ".json")
    if cache_file.exists():
        return json.loads(cache_file.read_text())
    url = BASE + path + ".json"
    try:
        with urllib.request.urlopen(url, timeout=20) as r:
            body = r.read()
    except Exception as e:
        print(f"  ! fetch fail {path}: {e}", file=sys.stderr)
        return None
    cache_file.parent.mkdir(parents=True, exist_ok=True)
    cache_file.write_bytes(body)
    return json.loads(body)


def crawl_all() -> dict[str, dict]:
    """BFS from HIG root. Returns {path: doc}."""
    seen: set[str] = set()
    queue = [PREFIX]
    docs: dict[str, dict] = {}
    step = 0
    while queue:
        step += 1
        batch = [p for p in queue if p not in seen and "#" not in p]
        for p in batch:
            seen.add(p)
        queue = []
        with cf.ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
            for path, doc in zip(batch, ex.map(fetch_json, batch)):
                if not doc:
                    continue
                docs[path] = doc
                for v in doc.get("references", {}).values():
                    if v.get("type") != "topic":
                        continue
                    u = v.get("url", "")
                    if u.startswith(PREFIX) and "#" not in u and u not in seen:
                        queue.append(u)
        print(f"  step {step}: have {len(docs)} docs, {len(queue)} queued")
    return docs

# ---------- markdown conversion ----------

def _inline(nodes, refs) -> str:
    out = []
    for n in nodes or []:
        t = n.get("type")
        if t == "text":
            out.append(n.get("text", ""))
        elif t == "strong":
            out.append(f"**{_inline(n.get('inlineContent', []), refs)}**")
        elif t == "emphasis":
            out.append(f"*{_inline(n.get('inlineContent', []), refs)}*")
        elif t == "codeVoice":
            code = n.get("code") or _inline(n.get("inlineContent", []), refs)
            out.append(f"`{code}`")
        elif t == "reference":
            ident = n.get("identifier")
            ref = refs.get(ident, {})
            title = ref.get("title") or ident or ""
            url = ref.get("url") or ""
            if url and url.startswith("/"):
                url = f"https://developer.apple.com{url}"
            if url:
                out.append(f"[{title}]({url})")
            else:
                out.append(title)
        elif t == "image":
            # inline image — emit alt text only (images handled as block elsewhere)
            ident = n.get("identifier", "")
            ref = refs.get(ident, {})
            alt = ""
            for v in (ref.get("alt"), ref.get("title")):
                if v:
                    alt = v
                    break
            out.append(f"![{alt}]({ident})")
        elif t == "inlineHead":
            out.append(f"**{_inline(n.get('inlineContent', []), refs)}**")
        elif t == "superscript":
            out.append(_inline(n.get("inlineContent", []), refs))
        elif t == "subscript":
            out.append(_inline(n.get("inlineContent", []), refs))
        else:
            # fall back to extracting any text field
            if "text" in n:
                out.append(n["text"])
    return "".join(out)


def _block(nodes, refs, depth=0) -> list[str]:
    lines: list[str] = []
    for n in nodes or []:
        t = n.get("type") or n.get("kind")
        if t == "paragraph":
            inline = _inline(n.get("inlineContent", []), refs).strip()
            if inline:
                lines.append(inline)
        elif t == "heading":
            level = max(2, min(int(n.get("level", 2)) + 1, 6))  # shift: page title is H1
            lines.append(f"{'#' * level} {n.get('text', '')}")
        elif t == "aside":
            name = n.get("name") or n.get("style") or "Note"
            body = _block(n.get("content", []), refs, depth + 1)
            quoted = "\n".join(f"> {ln}" for ln in ("\n".join(body)).split("\n"))
            lines.append(f"> **{name}**\n{quoted}")
        elif t == "unorderedList":
            for item in n.get("items", []):
                body = _block(item.get("content", []), refs, depth + 1)
                if not body:
                    continue
                first, *rest = ("\n".join(body)).split("\n")
                lines.append(f"- {first}")
                for r in rest:
                    lines.append(f"  {r}" if r else "")
        elif t == "orderedList":
            for i, item in enumerate(n.get("items", []), 1):
                body = _block(item.get("content", []), refs, depth + 1)
                if not body:
                    continue
                first, *rest = ("\n".join(body)).split("\n")
                lines.append(f"{i}. {first}")
                for r in rest:
                    lines.append(f"   {r}" if r else "")
        elif t == "termList":
            for item in n.get("items", []):
                term = _inline(item.get("term", {}).get("inlineContent", []), refs).strip()
                body = _block(item.get("definition", {}).get("content", []), refs, depth + 1)
                lines.append(f"**{term}**")
                for b in body:
                    lines.append(b)
        elif t == "codeListing":
            code = "\n".join(n.get("code", []))
            syntax = n.get("syntax", "") or ""
            lines.append(f"```{syntax}\n{code}\n```")
        elif t == "image":
            ident = n.get("identifier", "")
            ref = refs.get(ident, {})
            alt = (ref.get("alt") or "").strip() or ident
            lines.append(f"![{alt}]({ident})")
        elif t == "video":
            ident = n.get("identifier", "")
            lines.append(f"[video: {ident}]")
        elif t == "row":
            cols = n.get("columns", [])
            parts = []
            for c in cols:
                body = _block(c.get("content", []), refs, depth + 1)
                parts.append("\n".join(body))
            # Apple often uses 2-column rows for do/don't or before/after — render stacked
            lines.append("\n\n".join(parts))
        elif t == "table":
            header_rows = n.get("header", [])
            rows = n.get("rows", [])
            # Normalize: each cell is list of blocks → join inline-ish
            def cell(c):
                return " ".join(_block(c, refs, depth + 1)).replace("\n", " ").strip() or " "
            all_rows = rows if not header_rows else rows
            if not all_rows:
                continue
            ncol = max(len(r) for r in all_rows)
            if header_rows is True or (rows and isinstance(rows[0][0], list)):
                # first row is header
                head = [cell(c) for c in all_rows[0]]
                body_rows = all_rows[1:]
            else:
                head = [f"col{i+1}" for i in range(ncol)]
                body_rows = all_rows
            lines.append("| " + " | ".join(head) + " |")
            lines.append("|" + "|".join(["---"] * len(head)) + "|")
            for r in body_rows:
                lines.append("| " + " | ".join(cell(c) for c in r) + " |")
        elif t == "links":
            for ident in n.get("identifiers", []):
                ref = refs.get(ident, {})
                title = ref.get("title") or ident
                url = ref.get("url") or ""
                if url.startswith("/"):
                    url = f"https://developer.apple.com{url}"
                lines.append(f"- [{title}]({url})")
        elif t == "content":
            lines.extend(_block(n.get("content", []), refs, depth))
        else:
            # unknown: try to descend
            if isinstance(n.get("content"), list):
                lines.extend(_block(n["content"], refs, depth))
    return lines


def doc_to_markdown(doc: dict) -> str:
    refs = doc.get("references", {})
    meta = doc.get("metadata", {})
    title = meta.get("title") or "Untitled"
    abstract = _inline(doc.get("abstract", []), refs).strip()

    out = [f"# {title}"]
    if abstract:
        out.append("")
        out.append(abstract)

    for sec in doc.get("primaryContentSections", []):
        if sec.get("kind") != "content":
            continue
        for block in _block(sec.get("content", []), refs):
            out.append("")
            out.append(block)

    # Child topics (navigation)
    topics = doc.get("topicSections", [])
    if topics:
        out.append("")
        out.append("## Topics")
        for sec in topics:
            if sec.get("title"):
                out.append("")
                out.append(f"### {sec['title']}")
            for ident in sec.get("identifiers", []):
                ref = refs.get(ident, {})
                t = ref.get("title") or ident
                u = ref.get("url") or ""
                if u.startswith("/"):
                    u = f"https://developer.apple.com{u}"
                ab = _inline(ref.get("abstract", []), refs).strip()
                line = f"- [{t}]({u})"
                if ab:
                    line += f" — {ab}"
                out.append(line)

    return "\n".join(out).rstrip() + "\n"

# ---------- driver ----------

def main():
    global OUT, CACHE, MAX_WORKERS
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-root", required=True, type=Path)
    parser.add_argument("--cache-root", required=True, type=Path)
    parser.add_argument("--workers", type=int, default=2)
    args = parser.parse_args()
    if not 1 <= args.workers <= 4:
        parser.error("--workers must be between 1 and 4")
    MAX_WORKERS = args.workers
    OUT, CACHE = args.output_root.resolve(), args.cache_root.resolve()
    CACHE.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    print("Crawling…")
    t0 = time.time()
    docs = crawl_all()
    print(f"  got {len(docs)} docs in {time.time()-t0:.1f}s")

    print("Converting…")
    tree = []
    stats = []
    for path, doc in sorted(docs.items()):
        rel = path[len(PREFIX):].lstrip("/") or "index"
        md_path = OUT / (rel + ".md")
        md_path.parent.mkdir(parents=True, exist_ok=True)
        md = doc_to_markdown(doc)
        md_path.write_text(md)
        tree.append({
            "path": path,
            "title": doc.get("metadata", {}).get("title"),
            "file": str(md_path.relative_to(OUT)),
            "bytes": len(md.encode("utf-8")),
            "words": len(md.split()),
        })
        stats.append((md_path.name, len(md)))

    (OUT / "_tree.json").write_text(json.dumps(tree, indent=2))
    total = sum(s[1] for s in stats)
    (OUT / "_stats.json").write_text(json.dumps({
        "files": len(stats),
        "total_bytes": total,
        "avg_bytes": total // max(1, len(stats)),
    }, indent=2))
    print(f"  wrote {len(stats)} markdown files, {total/1024:.1f} KB total")


if __name__ == "__main__":
    main()
