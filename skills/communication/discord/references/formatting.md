# Discord Formatting Reference

Quick reference for Discord message formatting syntax.

## Text Formatting

| Syntax | Result | Example |
|--------|--------|---------|
| `**text**` | Bold | `**deploy ready**` → **deploy ready** |
| `*text*` | Italic | `*in progress*` → *in progress* |
| `***text***` | Bold + Italic | `***urgent***` → ***urgent*** |
| `__text__` | Underline | `__important__` → <u>important</u> |
| `~~text~~` | Strikethrough | `~~deprecated~~` → ~~deprecated~~ |
| `\|\|text\|\|` | Spoiler | `\|\|secret\|\|` → hidden until clicked |

## Code

### Inline Code
```
`const version = '1.0.0'`
```
Results in monospace: `const version = '1.0.0'`

### Code Blocks with Syntax Highlighting

````markdown
```typescript
interface DeployConfig {
  env: 'staging' | 'prod';
  version: string;
}
```
````

Common languages: `json`, `javascript`, `typescript`, `python`, `rust`, `bash`, `sql`, `go`, `java`

```json
{
  "status": "success",
  "version": "2.1.0"
}
```

## Block Quotes

```
> Single line quote
```

```
> Multi-line quote
> continues here
> and here
```

```
>>> Quoted block
spanning multiple
lines indented
```

## Headers

```
# Header 1
## Header 2
### Header 3
```

Only H1, H2, H3 render in Discord (max 3 levels)

## Lists

### Unordered
```
- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
```

### Ordered
```
1. First step
2. Second step
3. Third step
```

## Links & Mentions

| Syntax | Result |
|--------|--------|
| `[text](https://example.com)` | Masked link (text clickable) |
| `<https://example.com>` | Unmasked link (full URL shown) |
| `<@user_id>` | User mention (requires valid ID) |
| `<@&role_id>` | Role mention (requires valid ID) |
| `<#channel_id>` | Channel mention (requires valid ID) |
| `:emoji_name:` | Custom emoji (`:rocket:` → 🚀) |
| `<:emoji_name:emoji_id>` | Custom emoji with ID |
| `<a:emoji_name:emoji_id>` | Animated custom emoji |

## Timestamps

Unix timestamps render as user-local time.

| Syntax | Example | Result |
|--------|---------|--------|
| `<t:1708363800>` | Default format | Feb 19, 2025 |
| `<t:1708363800:t>` | Time only | 3:30 PM |
| `<t:1708363800:T>` | Long time | 3:30:00 PM |
| `<t:1708363800:d>` | Short date | 02/19/2025 |
| `<t:1708363800:D>` | Long date | February 19, 2025 |
| `<t:1708363800:f>` | Short datetime | Feb 19, 2025 3:30 PM |
| `<t:1708363800:F>` | Long datetime | Wednesday, Feb 19, 2025 3:30 PM |
| `<t:1708363800:R>` | Relative | 2 minutes ago |

Get Unix timestamp: `Math.floor(Date.now() / 1000)` or `Math.floor(new Date('2026-02-19T15:30:00Z').getTime() / 1000)`

## Common Patterns

### CI/CD Notification
```
**Deployment Complete** ✅
- **Service**: api-server
- **Version**: 1.2.3
- **Environment**: Production
- **Deployed at**: <t:1708363800:F>
[View Logs](https://logs.example.com)
```

### Error Alert
```
**Build Failed** ❌
```typescript
error TS2322: Type 'string' not assignable to 'number'
  at src/utils.ts:42
```
<@&role_admin_id> attention needed
```

### Changelog Entry
```
**v2.1.0** - Released
**Features:**
- New API endpoints
- Performance improvements (20% faster)

**Fixes:**
- [#123](https://github.com/org/repo/issues/123) Bug in auth flow
- [#124](https://github.com/org/repo/issues/124) Memory leak

**Breaking:** None
```

## Constraints & Notes

- Max 2000 chars per message (use embeds for more content)
- Newlines: use actual line breaks or `\n` in JSON
- Mentions only work with valid IDs
- Custom emojis require server emoji ID
- Timestamps automatically convert to user's timezone
- Spoilers work in all message contexts
