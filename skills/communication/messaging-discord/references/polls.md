# Discord Poll Object Reference

Polls allow users to vote on predefined answers. Supported via webhooks and API endpoints.

## Poll Create Request Structure

```json
{
  "poll": {
    "question": {
      "text": "What's your preferred deployment time?",
      "emoji": {
        "id": null,              // null for built-in emoji
        "name": "🚀",
        "animated": false
      }
    },
    "answers": [
      {
        "poll_media": {
          "text": "9 AM",
          "emoji": {
            "id": null,
            "name": "⏰",
            "animated": false
          }
        }
      },
      {
        "poll_media": {
          "text": "2 PM",
          "emoji": {
            "id": null,
            "name": "🌤️",
            "animated": false
          }
        }
      }
    ],
    "duration": 24,              // hours (1-168, default 24)
    "allow_multiselect": false,  // true = select multiple, false = single choice
    "layout_type": 1             // 1 = default (button grid)
  }
}
```

## Answer Limits

- **Max 10 answers** per poll
- Each answer `text`: max 55 characters
- Each answer `emoji`: optional, can be custom or built-in
- Question `text`: max 300 characters

## Duration Values

- **Minimum**: 1 hour
- **Maximum**: 168 hours (7 days)
- **Default**: 24 hours
- Polls expire after the duration and cannot be voted on

## Webhook Integration

Send a poll via webhook:

```json
{
  "content": "Quick team poll:",
  "poll": {
    "question": {
      "text": "Should we use Bun or Node.js?",
      "emoji": {
        "name": "🤔"
      }
    },
    "answers": [
      {
        "poll_media": {
          "text": "Bun",
          "emoji": { "name": "⚡" }
        }
      },
      {
        "poll_media": {
          "text": "Node.js",
          "emoji": { "name": "🟩" }
        }
      }
    ],
    "duration": 12,
    "allow_multiselect": false
  }
}
```

## Practical Examples

### Deploy Window Vote
```json
{
  "content": "Team decision needed 🗳️",
  "poll": {
    "question": {
      "text": "Best time for the schema migration?",
      "emoji": { "name": "⏱️" }
    },
    "answers": [
      {
        "poll_media": {
          "text": "Tonight (2-3 AM)",
          "emoji": { "name": "🌙" }
        }
      },
      {
        "poll_media": {
          "text": "This weekend",
          "emoji": { "name": "📅" }
        }
      },
      {
        "poll_media": {
          "text": "Next sprint",
          "emoji": { "name": "🔄" }
        }
      }
    ],
    "duration": 48,
    "allow_multiselect": false
  }
}
```

### Feature Priority Poll
```json
{
  "poll": {
    "question": {
      "text": "Select features for the next release",
      "emoji": { "name": "🎯" }
    },
    "answers": [
      {
        "poll_media": {
          "text": "Dark mode",
          "emoji": { "name": "🌙" }
        }
      },
      {
        "poll_media": {
          "text": "Export to CSV",
          "emoji": { "name": "📊" }
        }
      },
      {
        "poll_media": {
          "text": "API rate limits",
          "emoji": { "name": "⚙️" }
        }
      },
      {
        "poll_media": {
          "text": "Webhooks",
          "emoji": { "name": "🔗" }
        }
      }
    ],
    "duration": 72,
    "allow_multiselect": true
  }
}
```

## Notes

- Polls cannot be edited or deleted after creation
- Results show in real-time as votes come in
- Only webhooks and bots can create polls
- Expired polls are still visible but voting is disabled
- Layout type 1 is currently the only supported option
