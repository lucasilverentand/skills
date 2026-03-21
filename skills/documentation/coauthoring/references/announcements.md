# Announcements

## When to use

Communicating a significant event to an external audience — product launches, major updates, partnerships, migrations, or breaking changes. Announcements are typically shorter than blog posts and focused on a single message.

## Template

```markdown
# <Clear, specific title>

<1-2 sentences: what's happening and when>

## What's changing

<!-- Concrete description of what's new or different -->

## Why

<!-- Brief motivation — what problem this solves or what opportunity it creates -->

## What you need to do

<!-- Specific actions the reader should take, if any -->

1. <Action step>
2. <Action step>

## Timeline

| Date | What happens |
|---|---|
| <date> | <event> |
| <date> | <event> |

## Questions?

<!-- Where to get help: support email, Discord, docs link -->
```

## Channel-Specific Formatting

### Email / Newsletter
- Subject line under 50 characters
- Lead with the single most important thing
- Bold key dates and actions
- Keep under 300 words — link to full details

### GitHub Discussion / Issue
- Use the full template above
- Pin the discussion or issue
- Link to relevant PRs, docs, or migration guides

### Discord / Slack
- 2-3 sentences max for the announcement itself
- Link to the full announcement for details
- Use formatting: bold for dates, code blocks for commands

### Social media
- One clear sentence about what changed
- Link to the full post
- No thread needed for simple announcements

## Writing Guidance

### Lead with impact
"Starting April 1, the free tier includes 10K API calls/month (up from 1K)" is better than "We've been working hard on making our platform more accessible."

### Be specific about timing
Always include when the change takes effect. "Starting March 25" or "Effective immediately" — never leave timing ambiguous.

### Action-oriented
If the reader needs to do something, make it unmissable. Use a numbered list, bold the deadline, and repeat it at the end.

### Tone
Direct and respectful. Don't oversell ("game-changing!") or apologize excessively ("we're so sorry for any inconvenience"). State what's happening and what it means.

## Anti-patterns

- **Burying the change** — lead with what's changing, not 3 paragraphs of context
- **No timeline** — when does this happen? Users need dates
- **No action items** — if users need to do something, spell it out clearly
- **Marketing-speak** — "We're thrilled to announce" adds zero information. Just announce it
- **Missing support channel** — always tell people where to get help
