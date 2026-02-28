# Discord Threads and Forum Channels Reference

Threads and forum posts keep conversations organized without cluttering main channels.

## Thread Types

| Type | Created from | Use case |
|---|---|---|
| Public thread | Message in a text channel | Discuss a specific topic |
| Private thread | Text channel (no parent message) | Sensitive or scoped discussions |
| Forum post | Forum channel | Structured Q&A, support tickets, proposals |

## Creating a Thread via API

### Public thread from a message

```
POST /channels/{channel_id}/messages/{message_id}/threads
```

```json
{
  "name": "Deploy discussion",
  "auto_archive_duration": 1440
}
```

### Thread in a forum channel

```
POST /channels/{forum_channel_id}/threads
```

```json
{
  "name": "RFC: New API versioning strategy",
  "auto_archive_duration": 10080,
  "message": {
    "content": "Proposing we move to URL-based versioning. Details below.",
    "embeds": [
      {
        "title": "Proposal",
        "description": "Move from header-based to URL-based versioning (`/v1/`, `/v2/`)",
        "color": 5763719,
        "fields": [
          { "name": "Pros", "value": "- Easier to test\n- Cache-friendly\n- Clear in logs" },
          { "name": "Cons", "value": "- URL changes on major version\n- More route definitions" }
        ]
      }
    ]
  },
  "applied_tags": ["tag_id_rfc"]
}
```

## Auto-Archive Durations

| Value | Duration |
|---|---|
| `60` | 1 hour |
| `1440` | 24 hours (1 day) |
| `4320` | 3 days |
| `10080` | 7 days |

Default is 24 hours. Forum channels default to 3 days.

## Forum Channel Tags

Forum channels support tags for categorization:

```json
{
  "available_tags": [
    { "id": "...", "name": "Bug", "emoji_name": "🐛" },
    { "id": "...", "name": "Feature", "emoji_name": "✨" },
    { "id": "...", "name": "RFC", "emoji_name": "📋" },
    { "id": "...", "name": "Resolved", "emoji_name": "✅", "moderated": true }
  ]
}
```

`moderated: true` means only members with Manage Threads permission can apply the tag.

## Posting to a Thread via Webhook

Webhooks can post to threads by adding `thread_id` as a query parameter:

```
POST https://discord.com/api/webhooks/{id}/{token}?thread_id={thread_id}
```

The webhook URL stays the same — only the query parameter changes.

## Practical Patterns

### Incident thread

1. Post an alert embed to the alerts channel
2. Create a public thread from that message for investigation discussion
3. Post updates to the thread as the incident progresses
4. Archive the thread when resolved

### Release discussion

1. Post a release changelog embed to the releases channel
2. Create a thread for feedback and bug reports on that release
3. Tag relevant teams in the thread

### Support forum

1. Create a forum channel with tags: Bug, Question, Feature Request, Resolved
2. Users create posts (threads) for each issue
3. Team responds in the thread
4. Apply "Resolved" tag when done

## Constraints

- Thread name: max 100 characters
- Forum post must include an initial message (content or embed)
- Max 5 tags per forum post
- Archived threads can be unarchived by posting to them
- Threads are auto-archived after the configured duration of inactivity
