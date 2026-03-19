# Discord

Post updates to channels and read channel context for task awareness.

## Responsibilities

- Post updates and notifications to Discord channels
- Read channel context to inform task-aware responses
- Format messages with embeds, code blocks, and action links
- Monitor channels for mentions and route them to relevant workflows

## Tools

- `tools/discord-post.ts` — send a formatted message or embed to a specified Discord channel via webhook
- `tools/channel-digest.ts` — fetch recent messages from a channel and summarize the conversation context
- `tools/webhook-setup.ts` — create and configure Discord webhooks for automated notifications
