# Skills Audit Report

**Date:** March 19, 2026
**Scope:** All 9 skills across core skills and plugin management

---

## Executive Summary

You have 9 skills total: 7 core skills (schedule, doc-coauthoring, xlsx, pdf, pptx, docx, skill-creator) and 2 plugin management skills (create-cowork-plugin, cowork-plugin-customizer). After reviewing every line of every skill, here's the breakdown.

**Top-line findings:**

- The **document format skills** (docx, pdf, pptx, xlsx) are high-quality and well-structured but have no cross-referencing or shared utilities between them
- **doc-coauthoring** is a workflow skill that overlaps conceptually with docx but serves a different purpose
- **schedule** is extremely thin — barely a skill at all
- **skill-creator** is massive and tries to do too much in a single skill
- The two **plugin management** skills are well-scoped and complementary

---

## Individual Skill Reports

### 1. schedule

| Metric | Value |
|--------|-------|
| **Total size** | 40 lines (SKILL.md only) |
| **Supporting files** | None |
| **Quality** | Low |

**What it does:** Creates scheduled tasks by analyzing the current session, drafting a prompt, and calling `create_scheduled_task`.

**Strengths:**
- Clear, concise instructions
- Good coverage of scheduling types (recurring, one-time, ad-hoc)
- Correct cron/ISO 8601 guidance

**Weaknesses:**
- Extremely thin — this is barely more than a prompt template
- No examples of good vs. bad task descriptions
- No reference material, no scripts, no error handling guidance
- Doesn't address edge cases (what if the session had multiple tasks? What if the task requires files that won't exist later?)

**Verdict: Too small.** This reads more like a system prompt snippet than a full skill. It could either be expanded with examples, templates, and common patterns — or it could be folded into a broader "automation" or "task management" skill if one existed. As-is, it's the weakest skill in the set.

---

### 2. doc-coauthoring

| Metric | Value |
|--------|-------|
| **Total size** | 375 lines (SKILL.md only) |
| **Supporting files** | None |
| **Quality** | Medium-High |

**What it does:** Guides users through a 3-stage collaborative document writing workflow: Context Gathering → Refinement & Structure → Reader Testing.

**Strengths:**
- Well-structured workflow with clear stages and exit conditions
- Smart "Reader Testing" stage using sub-agents to catch blind spots
- Good fallback paths (with/without sub-agents, with/without artifacts)
- Handles integration with Slack, Teams, Google Drive gracefully
- Encourages user agency ("skip if you want", "adjust the process")

**Weaknesses:**
- No supporting reference files despite being 375 lines — everything is in the SKILL.md
- Overlap with docx skill in terms of document creation, but no cross-reference between them
- The brainstorming step ("5-20 options") feels arbitrary and could lead to filler
- No templates or examples of good section structures for common doc types (RFC, PRD, design doc)
- Doesn't mention what file format the output should be (markdown? docx? Google Doc?)

**Verdict: Well-sized but missing supporting material.** The workflow design is strong. It would benefit from a `references/` folder with templates for common doc types and examples of good brainstorming outputs. The lack of connection to docx is a missed opportunity.

---

### 3. xlsx

| Metric | Value |
|--------|-------|
| **Total size** | 291 lines (SKILL.md) + recalc script |
| **Supporting files** | `scripts/recalc.py` |
| **Quality** | High |

**What it does:** Creates, edits, and analyzes Excel spreadsheets using openpyxl and pandas.

**Strengths:**
- Excellent financial modeling standards (color coding, number formatting, formula rules)
- Critical "use formulas, not hardcoded values" instruction with clear good/bad examples
- Smart recalc workflow using LibreOffice with JSON error reporting
- Good verification checklist for formula errors
- Clear library selection guidance (pandas vs. openpyxl)

**Weaknesses:**
- No charting guidance (how to create charts with openpyxl or other tools)
- The financial model section is very investment-banking specific — may not match all users' needs
- No examples of common spreadsheet types (budget, tracker, dashboard)
- Missing guidance on conditional formatting, data validation, pivot tables

**Verdict: Well-sized and high-quality.** The financial modeling standards are a standout. Could benefit from charting examples and broader use-case templates, but the core is solid.

---

### 4. pdf

| Metric | Value |
|--------|-------|
| **Total size** | 314 lines (SKILL.md) + 611 lines (REFERENCE.md) + 294 lines (FORMS.md) = ~1,219 lines |
| **Supporting files** | REFERENCE.md, FORMS.md, multiple scripts |
| **Quality** | High |

**What it does:** Full PDF processing — read, create, merge, split, fill forms, OCR, encrypt, extract images.

**Strengths:**
- Excellent progressive disclosure: SKILL.md → REFERENCE.md → FORMS.md
- Covers both Python (pypdf, pdfplumber, reportlab) and CLI tools (qpdf, pdftotext)
- FORMS.md is exceptionally thorough with fillable/non-fillable/hybrid approaches
- Good quick reference table mapping tasks to tools
- Multiple scripts for form handling, image conversion, structure extraction

**Weaknesses:**
- REFERENCE.md includes JavaScript libraries (pdf-lib, pdfjs-dist) — are these actually usable in the Cowork environment?
- Some overlap between SKILL.md and REFERENCE.md (merge/split examples appear in both)
- The FORMS.md workflow is very long and complex — could benefit from a decision flowchart
- No guidance on PDF accessibility (tagged PDFs, alt text)

**Verdict: Well-sized with good progressive disclosure.** The largest skill by total content, but the 3-file split works well. The JS library inclusion in REFERENCE.md is questionable if it's not usable in practice.

---

### 5. pptx

| Metric | Value |
|--------|-------|
| **Total size** | 234 lines (SKILL.md) + 205 lines (editing.md) + 420 lines (pptxgenjs.md) = ~859 lines |
| **Supporting files** | editing.md, pptxgenjs.md, multiple scripts |
| **Quality** | High |

**What it does:** Creates and edits PowerPoint presentations using PptxGenJS (new) or XML manipulation (editing existing).

**Strengths:**
- Outstanding design guidance — color palettes, typography, layout patterns, spacing rules
- Strong "avoid common mistakes" section that prevents AI-looking slides
- Good QA workflow requiring sub-agent visual inspection
- Clear two-track approach: template editing vs. from-scratch creation
- Excellent common pitfalls section in pptxgenjs.md (hex colors, shadow corruption, object reuse)

**Weaknesses:**
- The icon workflow (react-icons → sharp → base64 → slide) is complex and fragile
- No guidance on speaker notes
- editing.md's XML manipulation approach is very technical — no higher-level abstraction
- Missing guidance on animations/transitions (even if just to say "skip them")

**Verdict: Well-sized and the strongest design-focused skill.** The design guidance alone is valuable. The progressive disclosure across three files works well.

---

### 6. docx

| Metric | Value |
|--------|-------|
| **Total size** | 590 lines (SKILL.md only) |
| **Supporting files** | Multiple scripts (unpack.py, pack.py, validate.py, comment.py, accept_changes.py) |
| **Quality** | High |

**What it does:** Creates and edits Word documents using docx-js (new) or XML manipulation (editing existing).

**Strengths:**
- Comprehensive API reference for docx-js covering all major features
- Excellent tracked changes and comments workflow
- Smart quote handling is well thought out
- Good critical rules section preventing common bugs
- XML reference section is thorough for editing

**Weaknesses:**
- At 590 lines, the SKILL.md exceeds the recommended 500-line limit from skill-creator
- No progressive disclosure — everything is in one file unlike pptx's 3-file split
- No design guidance (unlike pptx which has color palettes and typography)
- The "Creating" and "Editing" sections use completely different tech stacks (JS vs. XML) with no guidance on when to use which beyond the quick reference table
- Missing examples of common document types (letter, report, memo)

**Verdict: Slightly too big for a single file.** The content is high-quality but would benefit from being split into separate reference files (e.g., `creating.md` and `editing.md` like pptx does). No design guidance is a notable gap compared to pptx.

---

### 7. skill-creator

| Metric | Value |
|--------|-------|
| **Total size** | 485 lines (SKILL.md) + 430 lines (schemas.md) + 274 lines (analyzer.md) + 223 lines (grader.md) + 202 lines (comparator.md) = ~1,614 lines |
| **Supporting files** | 3 agent files, schemas reference, scripts, eval viewer, assets |
| **Quality** | Medium-High |

**What it does:** Creates new skills, runs evaluations, benchmarks performance, optimizes descriptions.

**Strengths:**
- Comprehensive eval/benchmark workflow with viewer
- Thoughtful "how to think about improvements" section with great advice on generalization
- Good progressive disclosure with agent files loaded only when needed
- Description optimization loop is a unique and valuable feature
- Adaptive to different environments (Claude Code, Claude.ai, Cowork)

**Weaknesses:**
- Tries to do too much: skill creation + eval running + benchmarking + description optimization + blind comparison
- SKILL.md at 485 lines is near the limit, and the total footprint is massive (~1,614 lines)
- The tone is inconsistent — shifts between formal documentation and casual ("Cool? Cool.", "Sorry in advance but I'm gonna go all caps here")
- Environment-specific sections (Claude.ai, Cowork) add complexity and could be separate reference files
- The eval viewer workflow is complex and brittle (browser detection, static fallback, feedback JSON downloads)

**Verdict: Too big and tries to do too much.** This could be split into two skills: "skill-creator" (creating and iterating on skills) and "skill-evaluator" (running benchmarks, blind comparisons, description optimization). The environment-specific sections should be reference files, not inline.

---

### 8. cowork-plugin-customizer

| Metric | Value |
|--------|-------|
| **Total size** | 140 lines (SKILL.md) + 90 lines (mcp-servers.md) + 51 lines (search-strategies.md) = ~281 lines |
| **Supporting files** | 2 reference files |
| **Quality** | Medium-High |

**What it does:** Customizes existing plugins for specific organizations by replacing placeholders and connecting MCPs.

**Strengths:**
- Clear 3-mode detection (generic setup, scoped, general customization)
- Smart use of knowledge MCPs to auto-discover org context
- Good packaging workflow
- Clean phase-based structure

**Weaknesses:**
- Relies heavily on `~~` placeholder convention which is somewhat fragile
- The MCP connection phase could fail silently if registry search returns nothing
- No rollback or undo guidance if customization goes wrong
- Summary output template at the end is nice but could be more structured

**Verdict: Well-sized and focused.** Does one thing well. The reference files are appropriately separated.

---

### 9. create-cowork-plugin

| Metric | Value |
|--------|-------|
| **Total size** | 262 lines (SKILL.md) + 382 lines (component-schemas.md) + 335 lines (example-plugins.md) = ~979 lines |
| **Supporting files** | 2 reference files |
| **Quality** | High |

**What it does:** Guides users through creating a new plugin from scratch with a 5-phase workflow.

**Strengths:**
- Well-structured 5-phase workflow (Discovery → Planning → Design → Implementation → Package)
- Complete plugin architecture documentation
- Good component planning table format
- Smart progressive disclosure with schemas and examples in reference files
- Clear best practices section

**Weaknesses:**
- The component schemas reference (382 lines) is dense and could be split by component type
- No validation beyond `claude plugin validate` — no guidance on testing the plugin works
- Missing guidance on versioning/updating plugins after initial creation

**Verdict: Well-sized with good structure.** The reference files carry most of the weight appropriately. Pairs well with cowork-plugin-customizer.

---

## Consolidation Opportunities

### 1. Document Format Skills → Shared Utilities

**docx, pptx, xlsx, pdf** all share:
- LibreOffice integration (`scripts/office/soffice.py`, `scripts/office/unpack.py`, `scripts/office/pack.py`)
- Image conversion workflows (`pdftoppm`)
- Similar "create vs. edit existing" patterns

These don't need to be merged into one skill (they're correctly separate for triggering), but they could benefit from a shared `office-common/` reference covering LibreOffice setup, image conversion, and the pack/unpack pattern. This would reduce duplication across skills.

### 2. doc-coauthoring + docx

These skills don't overlap in content, but they have a gap: doc-coauthoring never mentions what format the output should be, and docx never mentions a collaborative workflow. A cross-reference would help — doc-coauthoring should point to docx when the output needs to be a Word document.

### 3. Plugin Management Skills — Keep Separate

**create-cowork-plugin** and **cowork-plugin-customizer** are correctly split. One creates, the other customizes. They share the `~~` placeholder convention and `.plugin` packaging format, which is appropriate coupling.

### 4. skill-creator — Split Recommended

This skill should be split into:
- **skill-creator**: Creating and iterating on skills (phases 1-3 of current skill)
- **skill-evaluator**: Running benchmarks, eval viewer, blind comparison, description optimization

This would bring both under the 500-line SKILL.md target and make each more focused.

---

## Skills to Consider Removing or Reworking

### schedule — Rework or Remove

At 40 lines, this barely qualifies as a skill. Options:
1. **Expand** it with examples, common patterns, and error handling to make it worthwhile
2. **Remove** it — the `create_scheduled_task` tool is straightforward enough that Claude can use it without a skill

### No other skills should be removed

The remaining 8 skills all serve distinct, valuable purposes.

---

## Quality Ranking

| Rank | Skill | Quality | Key Issue |
|------|-------|---------|-----------|
| 1 | **pptx** | High | Strongest design guidance of any skill |
| 2 | **pdf** | High | Best progressive disclosure |
| 3 | **xlsx** | High | Excellent financial standards |
| 4 | **docx** | High | Needs splitting into multiple files |
| 5 | **create-cowork-plugin** | High | Solid workflow |
| 6 | **doc-coauthoring** | Medium-High | Needs templates and format guidance |
| 7 | **cowork-plugin-customizer** | Medium-High | Clean but narrow |
| 8 | **skill-creator** | Medium-High | Too big, needs splitting |
| 9 | **schedule** | Low | Too thin to be useful |

---

## Recommended Actions

1. **Split skill-creator** into skill-creator + skill-evaluator
2. **Split docx SKILL.md** into SKILL.md + creating.md + editing.md (like pptx does)
3. **Expand or remove schedule** — either make it a real skill or drop it
4. **Add cross-references** between doc-coauthoring and docx
5. **Add design guidance to docx** — pptx has it, docx should too
6. **Audit PDF REFERENCE.md** for JS libraries that aren't usable in the environment
7. **Add charting guidance to xlsx**
