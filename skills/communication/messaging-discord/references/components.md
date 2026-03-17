# Discord Components Reference

Components allow interactive buttons on messages. Important: Interactive buttons require a bot application; link buttons work with webhooks.

## Component Types

- **Type 1**: Action Row (container for buttons)
- **Type 2**: Button
- **Type 3**: Select Menu
- **Type 4**: Text Input
- **Type 5**: Select Menu (user)

## Action Row Structure (Type 1)

Container that holds buttons. Max 5 buttons per row, max 5 rows per message.

```json
{
  "type": 1,
  "components": [
    {
      // buttons here
    }
  ]
}
```

## Button Object Structure (Type 2)

```json
{
  "type": 2,
  "style": 1,                           // required: 1-5 (see styles below)
  "label": "Click Me",                  // max 80 chars, required if no emoji
  "emoji": {
    "id": null,                         // null for built-in emoji
    "name": "🚀",
    "animated": false
  },
  "custom_id": "button_deploy_1",       // required for interactive (max 100 chars)
  "url": "https://example.com",         // ONLY for style 5 (link buttons)
  "disabled": false
}
```

## Button Styles

- **1 - Primary** (Blurple): `custom_id` required, works with interactive bots
- **2 - Secondary** (Grey): `custom_id` required, works with interactive bots
- **3 - Success** (Green): `custom_id` required, works with interactive bots
- **4 - Danger** (Red): `custom_id` required, works with interactive bots
- **5 - Link** (Grey): `url` required, no `custom_id`, works with webhooks

## Webhook-Compatible Example (Link Buttons Only)

Webhooks can only send link buttons (style 5):

```json
{
  "content": "Deployment Status",
  "components": [
    {
      "type": 1,
      "components": [
        {
          "type": 2,
          "style": 5,
          "label": "View Logs",
          "url": "https://logs.example.com/deploy-123",
          "emoji": { "name": "📋" }
        },
        {
          "type": 2,
          "style": 5,
          "label": "GitHub PR",
          "url": "https://github.com/org/repo/pull/456",
          "emoji": { "name": "📝" }
        }
      ]
    }
  ]
}
```

## Bot-Interactive Example (Requires Bot Application)

Interactive buttons require a bot to listen for `INTERACTION_CREATE` events:

```json
{
  "content": "CI/CD Action Required",
  "components": [
    {
      "type": 1,
      "components": [
        {
          "type": 2,
          "style": 3,
          "label": "Approve Deploy",
          "custom_id": "approve_deploy_prod",
          "emoji": { "name": "✅" }
        },
        {
          "type": 2,
          "style": 4,
          "label": "Cancel",
          "custom_id": "cancel_deploy_prod",
          "emoji": { "name": "❌" }
        },
        {
          "type": 2,
          "style": 2,
          "label": "Reschedule",
          "custom_id": "reschedule_deploy"
        }
      ]
    }
  ]
}
```

## Multi-Row Layout Example

```json
{
  "components": [
    {
      "type": 1,
      "components": [
        {
          "type": 2,
          "style": 5,
          "label": "Documentation",
          "url": "https://docs.example.com",
          "emoji": { "name": "📚" }
        },
        {
          "type": 2,
          "style": 5,
          "label": "API Playground",
          "url": "https://api.example.com/playground",
          "emoji": { "name": "🔬" }
        }
      ]
    },
    {
      "type": 1,
      "components": [
        {
          "type": 2,
          "style": 5,
          "label": "GitHub",
          "url": "https://github.com/org/repo",
          "emoji": { "name": "🐙" }
        },
        {
          "type": 2,
          "style": 5,
          "label": "Issues",
          "url": "https://github.com/org/repo/issues",
          "emoji": { "name": "⚠️" }
        }
      ]
    }
  ]
}
```

## Important Constraints

- **Max 5 buttons per action row**
- **Max 5 action rows per message**
- `custom_id` max 100 characters, alphanumeric + dash/underscore
- `label` max 80 characters
- Style 5 (link) buttons work with webhooks; styles 1-4 require interactive bot
- Interactive buttons must have `custom_id` (no `url`)
- Link buttons must have `url` (no `custom_id`)
- Either `label` or `emoji` required (or both)
- `disabled` defaults to false
