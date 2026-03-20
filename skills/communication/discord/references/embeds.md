# Discord Embed Object Reference

Embeds are rich message formatting structures that display formatted content. Sent via webhooks or API.

## Embed Object Structure

```json
{
  "title": "string",                    // max 256 chars
  "description": "string",              // max 2048 chars
  "url": "https://example.com",         // clickable title link
  "color": 5763719,                     // decimal integer (e.g., 0xFF00FF as 16711935)
  "timestamp": "2026-02-19T15:30:00Z",  // ISO 8601 timestamp (UTC)
  "footer": {
    "text": "Footer text",               // max 2048 chars
    "icon_url": "https://..."
  },
  "image": {
    "url": "https://..."                // shown at bottom
  },
  "thumbnail": {
    "url": "https://..."                // small image top-right
  },
  "author": {
    "name": "Author Name",              // max 256 chars
    "url": "https://...",               // clickable author name link
    "icon_url": "https://..."
  },
  "fields": [                           // max 25 fields
    {
      "name": "Field Title",            // max 256 chars, required
      "value": "Field content",         // max 1024 chars, required
      "inline": true                    // true = side-by-side, false = full width
    }
  ]
}
```

## Color Values (Decimal Int)

Common colors as decimal integers:
- **Blue**: 5763719 (0x581BC0)
- **Green**: 3066993 (0x2ECC71)
- **Red**: 15158332 (0xE74C3C)
- **Orange**: 15105570 (0xE67E22)
- **Purple**: 11243374 (0xAB82A0)
- **Yellow**: 16776960 (0xFFFF00)

Convert hex to decimal: `parseInt('FF00FF', 16)` = 16711935

## Practical Examples

### Deploy Notification
```json
{
  "embeds": [
    {
      "title": "Deployment Successful",
      "description": "Version 1.2.3 deployed to production",
      "color": 3066993,
      "timestamp": "2026-02-19T15:30:00Z",
      "fields": [
        {
          "name": "Environment",
          "value": "Production",
          "inline": true
        },
        {
          "name": "Branch",
          "value": "main",
          "inline": true
        },
        {
          "name": "Commit",
          "value": "[abc1234](https://github.com/...)",
          "inline": false
        }
      ],
      "footer": {
        "text": "Deployed by CI/CD"
      }
    }
  ]
}
```

### Error Alert
```json
{
  "embeds": [
    {
      "title": "Build Failed",
      "description": "TypeScript compilation errors in main branch",
      "color": 15158332,
      "fields": [
        {
          "name": "Error",
          "value": "Type 'string' not assignable to 'number'",
          "inline": false
        },
        {
          "name": "File",
          "value": "`src/utils.ts:42`",
          "inline": true
        },
        {
          "name": "Author",
          "value": "@username",
          "inline": true
        }
      ]
    }
  ]
}
```

### Changelog Entry
```json
{
  "embeds": [
    {
      "title": "Version 2.1.0 Released",
      "url": "https://github.com/org/repo/releases/tag/v2.1.0",
      "color": 5763719,
      "fields": [
        {
          "name": "Features",
          "value": "- New API endpoints\n- Performance improvements",
          "inline": false
        },
        {
          "name": "Fixes",
          "value": "- Bug in auth flow\n- Memory leak in cache",
          "inline": false
        },
        {
          "name": "Breaking Changes",
          "value": "None",
          "inline": true
        }
      ]
    }
  ]
}
```

## Constraints

- Max 10 embeds per message
- Total content size: ~6000 chars across all embeds
- Embeds are collapsed if they exceed message character limits
- `timestamp` is optional; omit for no timestamp display
- All URLs must be HTTPS (except for attachments)
