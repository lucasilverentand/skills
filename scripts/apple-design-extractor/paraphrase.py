#!/usr/bin/env python3
"""Paraphrase optimized Apple design-guideline markdown via LM Studio (Gemma 4).

Strategy:
- Split each page at H2/H3 boundaries so Gemma can work on coherent sections
- For each section, send the markdown + strict preservation rules
- Preserve headings (H1-H6), fenced code, tables, callouts, link URLs,
  backtick code, `apple:` URIs, `.md` links, and bolded lead-in phrases
- Write to build/apple-design-md-paraphrased/ with an on-disk cache keyed by
  the source-section hash so we can re-run cheaply

Usage: paraphrase.py [page-slug ...]    # default: all pages
"""
from __future__ import annotations

import hashlib
import json
import argparse
import os
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
SRC = REPO / "build" / "apple-design-md-opt"
DST_BASE = REPO / "build"
CACHE_BASE = REPO / ".cache" / "paraphrase"
LM_URL = "http://localhost:1234/v1/chat/completions"
MODEL = ""  # Selected explicitly with --model before any requests
MODEL_SLUG = MODEL.replace("/", "_")
DST = DST_BASE / f"apple-design-md-paraphrased-{MODEL_SLUG}"
CACHE = CACHE_BASE / MODEL_SLUG

SYSTEM = """You paraphrase Apple design-guideline prose to eliminate verbatim copying while preserving every instruction, constraint, and rule exactly.

Hard rules — do NOT violate any:
1. Preserve all markdown structure: headings (# ## ###), lists (- / 1.), tables (|), blockquotes (>), bold (**), italics (*), inline code (`), and fenced code blocks.
2. Preserve every link exactly: [label](url). You may change the label wording, but the URL is untouchable. That includes apple:... URIs and .md relative links.
3. Preserve inline code tokens verbatim (anything in backticks): API names, type names, property names.
4. Preserve the "bold lead-in" pattern: sentences that start with **Bolded imperative.** Keep that rhythm — the bolded sentence should stay first and bolded.
5. Keep callouts intact: > **Note**, > **Important**, etc. Paraphrase the body but keep the marker.
6. Do not add new rules, examples, or commentary. Do not omit rules.
7. Do not restructure headings or re-order sections.
8. Use different wording from the source. Vary sentence structure. Aim for concise, direct prose in an engineering-doc voice.

Output only the paraphrased markdown. No preamble, no explanation, no code fences around the whole thing."""


def call_lm(prompt: str, max_tokens: int = 8192) -> str:
    body = json.dumps({
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.3,
        "max_tokens": max_tokens,
    }).encode()
    req = urllib.request.Request(LM_URL, data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=900) as r:
        data = json.loads(r.read())
    msg = data["choices"][0]["message"]
    content = (msg.get("content") or "").strip()
    usage = data.get("usage", {})
    finish = data["choices"][0].get("finish_reason")
    # Warn if the model ran out of budget — truncated output means lost content
    if finish == "length":
        print(f"  WARNING: finish_reason=length, usage={usage}", file=sys.stderr)
    return content


def split_by_headings(md: str) -> list[tuple[str, str]]:
    """Split page body at every heading (##..#####). Each chunk = (heading_line or '', body_lines).
    Headings are preserved exactly and NEVER sent to the model."""
    lines = md.splitlines()
    chunks: list[tuple[str, list[str]]] = [("", [])]
    for ln in lines:
        if re.match(r"^#{2,6} ", ln):
            chunks.append((ln, []))
        else:
            chunks[-1][1].append(ln)
    return [(h, "\n".join(b).strip()) for h, b in chunks]


def cached_or_call(key: str, prompt: str) -> str:
    CACHE.mkdir(parents=True, exist_ok=True)
    cf = CACHE / f"{key}.md"
    if cf.exists():
        return cf.read_text()
    out = call_lm(prompt)
    cf.write_text(out)
    return out


def paraphrase_page(path: Path) -> tuple[Path, str]:
    md = path.read_text()
    # Keep H1 title verbatim
    m = re.match(r"(#\s+.+?)\n(.*)", md, re.S)
    if not m:
        return path, md
    title, rest = m.group(1), m.group(2)
    chunks = split_by_headings(rest)
    out_parts = [title]
    for heading, body in chunks:
        if heading:
            out_parts.append(heading)
        if not body.strip():
            continue
        key = hashlib.sha256(
            (path.name + "::" + heading + "::" + body).encode()
        ).hexdigest()[:16]
        out = cached_or_call(key, body)
        out_parts.append(out)
    return path, "\n\n".join(out_parts).rstrip() + "\n"


def main():
    global SRC, DST, CACHE, MODEL, LM_URL
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("slugs", nargs="*")
    parser.add_argument("--input-root", required=True, type=Path)
    parser.add_argument("--output-root", required=True, type=Path)
    parser.add_argument("--cache-root", required=True, type=Path)
    parser.add_argument("--model", required=True)
    parser.add_argument("--endpoint", default="http://localhost:1234/v1/chat/completions")
    parser.add_argument("--workers", type=int, default=1)
    args = parser.parse_args()
    if args.workers < 1 or args.workers > 4:
        parser.error("--workers must be between 1 and 4")
    SRC, DST = args.input_root.resolve(), args.output_root.resolve()
    MODEL, LM_URL = args.model, args.endpoint
    CACHE = args.cache_root.resolve() / MODEL.replace("/", "_")
    workers, slugs = args.workers, args.slugs
    DST.mkdir(parents=True, exist_ok=True)

    if slugs:
        files = [SRC / f"{s}.md" for s in slugs]
    else:
        files = sorted(SRC.rglob("*.md"))

    total = len(files)
    t0 = time.time()
    done = 0

    def process(f: Path):
        _, out = paraphrase_page(f)
        target = DST / f.relative_to(SRC)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(out)
        return f

    if workers <= 1:
        for f in files:
            process(f)
            done += 1
            dt = time.time() - t0
            print(f"[{done}/{total}] {f.name} — {dt:.1f}s elapsed, avg {dt/done:.1f}s/file", flush=True)
    else:
        print(f"Running with {workers} concurrent workers", flush=True)
        with ThreadPoolExecutor(max_workers=workers) as ex:
            futs = {ex.submit(process, f): f for f in files}
            for fut in as_completed(futs):
                f = fut.result()
                done += 1
                dt = time.time() - t0
                print(f"[{done}/{total}] {f.name} — {dt:.1f}s elapsed, avg {dt/done:.1f}s/file", flush=True)


if __name__ == "__main__":
    main()
