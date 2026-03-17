# Pattern Catalog

Recognizable patterns in conversations and git history, with detection heuristics and suggested skill actions.

## Struggle Patterns

### Corrections

**Signal**: User says "no", "wrong", "not that", "instead do X", "don't do Y".

**What it means**: Claude made a choice the user disagrees with. If this happens repeatedly for the same kind of choice, there's a missing convention or decision rule.

**Action**: Extract the correction into a skill convention or CLAUDE.md rule. Example: "User corrected framework choice 3x → add a preference rule to the relevant skill."

### Retries / Try Again

**Signal**: User asks to "try again", "redo this", or provides the same instruction a second time with more detail.

**What it means**: The first attempt didn't understand the intent. The gap is usually in how the skill interprets ambiguous requests.

**Action**: Add decision tree branches that disambiguate earlier, or add a "when in doubt, ask" instruction to the skill.

### Long Back-and-Forths

**Signal**: 8+ user turns in a single conversation on the same topic.

**What it means**: The task was either unclear, the skill was missing, or Claude kept getting blocked and needed course corrections.

**Action**: Review the conversation — if the task is repeatable, create a skill for it. If Claude kept hitting the same wall, add a reference or tool to unblock it.

### Tool Failures

**Signal**: Same tool called multiple times with errors, or user reports "it doesn't work" / "still broken".

**What it means**: The tool invocation pattern is wrong, or the tool itself has a gap.

**Action**: Fix the tool, or add error-handling guidance to the skill's conventions.

### Dissatisfaction

**Signal**: "doesn't work", "still failing", "broken", explicit frustration markers.

**What it means**: Something fundamental is off — wrong approach, wrong tool, or missing context.

**Action**: Root-cause the dissatisfaction. Often this points to a missing skill entirely rather than a tweak to an existing one.

## Taste Patterns

### Technology Preferences

**Signal**: "use X instead of Y", "we use X", "prefer X", "always X never Y".

**What it means**: The user has a technology stack preference that isn't codified.

**Action**: Add to CLAUDE.md tech preferences, or if it's domain-specific, add to the relevant skill's conventions.

### Style Preferences

**Signal**: "format it like", "keep it simple", "too verbose", "less boilerplate".

**What it means**: Output style doesn't match expectations.

**Action**: Add output formatting rules to the relevant skill, or save as a feedback memory.

### Process Preferences

**Signal**: "always test first", "commit after each change", "ask before doing X".

**What it means**: The user has a workflow preference.

**Action**: Add to CLAUDE.md workflow section, or if skill-specific, add as a convention in the skill.

### Naming / Convention Preferences

**Signal**: "use kebab-case", "name it like X", "the convention here is Y".

**What it means**: Project has naming conventions not yet captured.

**Action**: Add to CLAUDE.md or the relevant skill's conventions section.

## Git Rework Patterns

### File Churn

**Signal**: Same file changed in 3+ commits within a short window.

**What it means**: Trial-and-error development on that file. Could be lack of validation, unclear requirements, or missing patterns.

**Action**: Review what kept changing — if it's the same aspect (e.g., config format, API shape), a skill with validation or templates could help.

### Fix-After-Feat

**Signal**: `fix:` commit within 48 hours of a `feat:` commit, touching the same files.

**What it means**: The feature implementation had gaps — missed edge cases, wrong patterns, or insufficient testing.

**Action**: Strengthen the relevant skill with better conventions, add a testing step, or add a validation tool.

### Reverts

**Signal**: `revert:` or `Revert` commits.

**What it means**: An entire approach was wrong. This is the strongest signal that a skill is needed.

**Action**: Analyze what was reverted and why. Create a skill that guides toward the right approach, or add a decision tree branch that steers away from the reverted pattern.

### Rapid Iteration

**Signal**: 5+ commits within 1 hour touching the same files.

**What it means**: Tight feedback loop — possibly debugging, or incrementally getting something right.

**Action**: If the iteration was debugging, consider a debugging skill for that area. If it was incremental refinement, consider a template or scaffold skill.

## From Finding to Skill

When a pattern is confirmed, follow this decision process:

1. **Is it project-specific?** → Add to CLAUDE.md, not a skill
2. **Is it personal preference?** → Save as a memory (feedback or user type)
3. **Is it a single rule?** → Add as a convention to an existing skill
4. **Is it a repeatable workflow?** → Create a new skill with the lifecycle skill
5. **Is it a validation need?** → Add a tool to an existing or new skill
