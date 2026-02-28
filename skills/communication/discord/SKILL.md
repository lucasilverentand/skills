---
name: discord
description: Posts updates and notifications to Discord channels and reads channel context for task-aware responses. Formats messages with embeds, components, polls, and code blocks. Use when the user wants to send a deployment notification, post a status update, share a summary to a Discord channel, create a poll, manage threads, or read recent channel activity.
allowed-tools: Bash Read Write Edit
---

# Discord

## Decision Tree

- What do you need?
  - **Post a message or notification** → see "Posting a message" below
  - **Post a rich embed (deploy status, report, alert)** → see "Rich embeds" below
  - **Add interactive buttons or links** → see `references/components.md` for component structure
  - **Create a poll** → see `references/polls.md` for poll object structure
  - **Format message text (markdown, timestamps, mentions)** → see `references/formatting.md`
  - **Create or post to a thread** → see `references/threads.md`
  - **Create a forum post** → see `references/threads.md` for forum channel patterns
  - **Read channel context** → run `tools/channel-digest.ts`
  - **Set up a webhook for a new channel** → run `tools/webhook-setup.ts`
  - **Route channel mentions to a workflow** → see "Mention routing" below
  - **Combine embeds with components** → see "Composite messages" below
  - **Handle webhook errors or rate limits** → see "Error handling" below

## Posting a message

1. Confirm the target channel and webhook URL (from environment or config)
2. Format the message content — keep it concise and actionable
3. Run `tools/discord-post.ts --channel <name> --message "<text>"`
4. For code or diffs, wrap in triple backticks with a language tag inside the message

### Message formatting quick reference

- Bold: `**text**`, italic: `*text*`, strikethrough: `~~text~~`
- Inline code: `` `code` ``, code block: ` ```lang\ncode\n``` `
- User mention: `<@user_id>`, role mention: `<@&role_id>`, channel: `<#channel_id>`
- Timestamp: `<t:unix_seconds:format>` — `R` for relative, `F` for full datetime
- Max 2000 characters per message — use embeds for longer content
- Full reference: `references/formatting.md`

## Rich embeds

Embeds are better than plain text for structured content (deploy results, reports, alerts).

1. Build the embed payload with:
   - `title` — what this is about (max 256 chars)
   - `description` — detail text (max 2048 chars)
   - `color` — decimal int: green `3066993`, red `15158332`, yellow `16776960`, blue `5763719`
   - `fields` — key-value pairs, max 25 fields (name max 256, value max 1024 chars)
   - `url` — link to the PR, deployment, or dashboard
   - `timestamp` — ISO 8601 UTC string
   - `footer`, `author`, `image`, `thumbnail` — optional
2. Run `tools/discord-post.ts --channel <name> --embed '<json>'`
3. Full embed object structure and examples: `references/embeds.md`

### Common embed patterns

- **Deploy notification** → title: "Deployed to production", color: green, fields: branch + commit + duration
- **CI failure alert** → title: "Build failed", color: red, fields: failing tests + link to logs
- **Release changelog** → title: "Version X.Y.Z Released", fields: features + fixes + breaking changes
- **Weekly report** → title: "Weekly summary", fields: key metrics
- **Incident alert** → title: "Incident: service name", color: red, fields: status + severity + responders

## Composite messages

Combine content, embeds, and components in a single webhook payload:

```json
{
  "content": "Deployment complete",
  "embeds": [
    {
      "title": "v1.2.3 deployed to production",
      "color": 3066993,
      "fields": [
        { "name": "Branch", "value": "main", "inline": true },
        { "name": "Duration", "value": "2m 14s", "inline": true }
      ]
    }
  ],
  "components": [
    {
      "type": 1,
      "components": [
        {
          "type": 2,
          "style": 5,
          "label": "View Logs",
          "url": "https://logs.example.com/deploy-123"
        },
        {
          "type": 2,
          "style": 5,
          "label": "Open PR",
          "url": "https://github.com/org/repo/pull/456"
        }
      ]
    }
  ]
}
```

Note: Webhooks can only send link buttons (style 5). Interactive buttons (styles 1-4) and select menus require a bot application.

## Threads and forums

Use threads to keep discussions organized without cluttering the main channel. See `references/threads.md` for full API payloads.

### Posting to a thread via webhook

Add `thread_id` as a query parameter to the webhook URL:

```
POST https://discord.com/api/webhooks/{id}/{token}?thread_id={thread_id}
```

### Common thread patterns

- **Incident thread**: post alert embed → create thread from that message → post updates in thread
- **Release discussion**: post changelog → create thread for feedback
- **Support forum**: forum channel with tags (Bug, Question, Feature Request, Resolved)

## Reading channel context

1. Run `tools/channel-digest.ts --channel <name> --limit 50` to fetch recent messages
2. The tool summarizes the conversation — use it to understand ongoing discussions before posting
3. Check for open questions or action items before adding noise to the channel

## Mention routing

- Monitor channels for bot mentions using a webhook listener
- Parse mention text to determine intent (deploy request, status check, etc.)
- Route to the appropriate workflow based on matched keywords

## Webhook setup

1. Run `tools/webhook-setup.ts --channel <name>` to create and configure a webhook
2. Store the webhook URL in the project's secrets manager — never hardcode it
3. Add `DISCORD_WEBHOOK_<CHANNEL>` to `.env.example` with a description
4. One webhook per channel is sufficient — reuse it for all message types

### Webhook URL format

```
https://discord.com/api/webhooks/{webhook_id}/{webhook_token}
```

### Customizing webhook identity

Override the webhook's display name and avatar per message:

```json
{
  "username": "Deploy Bot",
  "avatar_url": "https://example.com/bot-avatar.png",
  "content": "Deployment started"
}
```

## Error handling

### Rate limits

Discord webhooks are rate-limited to 30 requests per 60 seconds per webhook.

When rate-limited, the API returns `429 Too Many Requests` with:

```json
{
  "message": "You are being rate limited.",
  "retry_after": 1.234,
  "global": false
}
```

Handle it:
1. Read the `retry_after` value (seconds)
2. Wait that duration before retrying
3. Implement exponential backoff for repeated 429s
4. For high-volume channels, batch messages or use a queue

### Common error codes

| Status | Meaning | Action |
|---|---|---|
| `204` | Success (no content) | Message sent |
| `400` | Invalid payload | Check embed structure and field lengths |
| `401` | Invalid webhook token | Regenerate webhook |
| `404` | Webhook deleted or channel gone | Re-create webhook |
| `429` | Rate limited | Wait `retry_after` seconds |
| `413` | Payload too large | Reduce embed count or field sizes |

### Validation before sending

- Total content: max 2000 chars
- Embeds: max 10 per message, ~6000 chars total across all embeds
- Components: max 5 action rows, max 5 buttons per row
- All URLs must be HTTPS
- Timestamps use Unix seconds, not milliseconds

## Constraints

- Max 2000 chars per message content
- Max 10 embeds per message, ~6000 chars total across embeds
- Max 5 action rows per message, max 5 buttons per row
- Webhook rate limit: 30 requests per 60 seconds per webhook
- All URLs in embeds/components must be HTTPS
- Timestamps use Unix seconds, not milliseconds
- Thread names: max 100 characters
- Forum posts must include an initial message

## Key references

| File | What it covers |
|---|---|
| `references/embeds.md` | Embed object structure, fields, color values, and examples |
| `references/components.md` | Action rows, button styles, link vs interactive buttons, select menus |
| `references/formatting.md` | Discord markdown syntax, timestamps, mentions, code blocks |
| `references/polls.md` | Poll create request structure, answers, duration, examples |
| `references/threads.md` | Thread creation, forum channels, auto-archive, posting to threads |
| `tools/discord-post.ts` | Send formatted messages or embeds via webhook |
| `tools/channel-digest.ts` | Fetch and summarize recent channel messages |
| `tools/webhook-setup.ts` | Create and configure Discord webhooks |
