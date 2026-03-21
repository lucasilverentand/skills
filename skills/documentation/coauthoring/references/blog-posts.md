# Blog Posts

## When to use

Writing technical blog posts, engineering blog entries, project announcements, or thought leadership pieces. Blog posts are typically published on a company blog, personal site, or platform like dev.to.

## Template

```markdown
# <Title — clear, specific, searchable>

<Subtitle or tagline — optional, adds context>

## The hook

<!-- 1-2 paragraphs: what problem does this solve? Why should the reader care? Start with the reader's pain point, not your solution. -->

## <Core content sections>

<!-- Varies by post type. See structure options below. -->

## Key takeaways

<!-- 3-5 bullet points summarizing what the reader learned -->

## What's next

<!-- Call to action: try the tool, read the docs, join the discussion -->
```

## Structure Options

### Tutorial / How-to
1. What you'll build / learn
2. Prerequisites
3. Step-by-step walkthrough (with code)
4. Complete example
5. Next steps / further reading

### Technical Deep-dive
1. The problem / question
2. Background (what you need to know)
3. Investigation / analysis
4. Findings
5. Implications

### Announcement
1. What shipped
2. Why it matters (to the reader)
3. How to use it (quick example)
4. What's coming next

### Lessons Learned
1. The situation
2. What happened
3. What we learned
4. How we changed our approach

## Writing Guidance

### Title
- Be specific: "How We Cut API Latency 80% with Connection Pooling" beats "Improving API Performance"
- Include the key technology or concept for searchability
- Keep under 70 characters for social sharing

### Hook
Start with the reader's problem, not your solution. "If your API responses are taking 2+ seconds, your users are leaving" hooks better than "We built a new caching layer."

### Code examples
- Every code example must be runnable
- Show the before/after when demonstrating improvements
- Use language-specific code blocks with syntax highlighting
- Keep examples focused — don't include irrelevant setup code

### Length
- Tutorials: 1000-2000 words — enough detail to follow, not so much they lose interest
- Deep-dives: 1500-3000 words — depth is the point
- Announcements: 500-1000 words — get to the point quickly
- Lessons learned: 1000-1500 words — story + insight

## Anti-patterns

- **Burying the value** — don't make readers scroll past 5 paragraphs of background to reach the useful content
- **"We're excited to announce"** — skip the corporate enthusiasm. Just say what shipped and why it matters
- **No code examples** — technical blog posts need runnable examples. Prose descriptions of code are not enough
- **Wall of text** — use headings, code blocks, and bullet points. Scannable posts get read
- **Missing call to action** — tell the reader what to do next: try it, read the docs, give feedback
- **Writing for yourself** — write for the reader's knowledge level, not yours. Define jargon, link prerequisites
