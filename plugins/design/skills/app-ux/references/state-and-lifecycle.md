# State and Lifecycle

# 7. State, restoration, and lifecycle
Navigation quality depends on state discipline. If everything is stuffed into route parameters, URLs become fragile and unsafe. If everything is hidden in memory, back, restore, refresh, share, and deep links fail.

## 7.1 Four kinds of state
|State type|Examples|Where it belongs|URL?|
|---|---|---|---|
|Destination identity|productId, orderId, conversationId, workspaceId|Route path or route params|Yes when shareable/permitted.|
|Durable view state|search query, selected filter, sort order, date range|Route query params or persisted screen state|Often, if privacy-safe.|
|Recoverable task state|draft message, checkout session, upload progress, form draft|Local database or server-side draft/session|Usually no; link to safe resume route.|
|Ephemeral UI state|open tooltip, focused input, keyboard visible, pressed menu item|In-memory presentation state|No.|

## 7.2 Restoration rules
- Restore the user's last meaningful place only when it is still safe and relevant.
- Restore active tasks more aggressively than passive browsing. A partially written message matters more than a previously viewed marketing page.
- After authentication, continue to the original destination. Do not treat login as the final destination.
- After app update or route migration, map old routes to new routes. If impossible, show a clear fallback explanation.
- For sensitive apps, restore orientation but not necessarily full data visibility until re-authentication succeeds.

## 7.3 Empty states and unavailable routes
Every addressable route needs a designed failure state. The object may be deleted, the user may lack permission, the account may be offline, the server may be unavailable, or the link may be old.

|Problem|Good response|Bad response|
|---|---|---|
|Deleted product|"This product is no longer available" + similar products + search.|Blank product template or generic crash screen.|
|Private project link|Ask user to request access or switch workspace/account.|Silent redirect to Home.|
|Expired checkout session|Explain expiry and rebuild cart where possible.|Payment failed with no context.|
|Offline detail screen|Show cached summary + clear offline badge + retry.|Spinner forever.|
