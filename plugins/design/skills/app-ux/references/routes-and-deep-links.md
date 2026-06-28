# Routes and Deep Links

# 5. Routes, URLs, and deep links
A route is an app-internal address for a destination. A URL is a public or web-compatible address. A deep link is an external entry point that opens a specific destination inside the app. These overlap, but they are not the same thing.

## 5.1 The decision rule
> Route every durable destination. URL only what should survive outside the current runtime.<br>Every meaningful destination should have an internal route contract. Only some routes deserve URLs or external deep links: content that is shareable, searchable, restorable across devices, reachable from notifications, or has a web fallback.

|Destination|Internal route?|External URL/deep link?|Why|
|---|---|---|---|
|Home / main dashboard|Yes|Sometimes|Useful as a safe fallback; not always useful as a shared link.|
|Product detail|Yes|Yes|Shareable, searchable, ad/link target, web fallback.|
|Search results|Yes|Often|Useful if query and filters are durable and privacy-safe.|
|Cart|Yes|Maybe|Useful for restore; risky to expose user/session-specific state.|
|Checkout payment step|Yes|Usually no|Ephemeral, security-sensitive, dependent on session and inventory.|
|Bank transaction detail|Yes|Maybe, gated|Useful from notifications; must require auth and avoid sensitive URL params.|
|Unsaved edit draft|Yes|No|Belongs in local/server draft state, not in a URL.|
|Settings subpage|Yes|Sometimes|Useful for support instructions; avoid exposing private account state.|
|Toast, menu, tooltip, keyboard state|No|No|Presentation state, not a destination.|

## 5.2 Route contract template
Define routes as product contracts, not framework artifacts. This template works whether your router is a native navigation controller, a declarative route tree, a web router, or a custom coordinator.
Route: ProductDetail
Path / URL: /products/{productId}
Presentation: push on compact; detail pane on expanded
Owner: Shop / Catalog domain
Inputs: productId (stable server ID), optional variantId
Auth: not required for viewing; required for wishlist/cart
Restoration: shareable and externally deep-linkable
Fallback: if product unavailable, show removed-product explanation + similar items
Analytics name: product_detail_viewed
Accessibility title: Product details for {productName}
Back fallback: Search results if available, otherwise Catalog home

## 5.3 Good URL design
- Stable: Use durable object IDs or slugs. Do not use array indices, tab numbers, localized labels, or component names.
- Minimal: Put only the data needed to resolve the destination. Store sensitive or large state server-side or locally.
- Readable where possible: /products/p_1234/noise-cancelling-headphones is better than /screen?id=887&type=2.
- Permission-aware: A valid URL may still lead to "not available" or "request access." That is better than pretending the link is broken.
- Version-tolerant: Keep old links working after redesigns. Redirect old route patterns to canonical routes.
- Platform-neutral: Let the same conceptual route support iOS Universal Links, Android App Links, web URLs, and internal navigation where applicable. [S3][S6][S8]

## 5.4 Bad URL design
|Bad pattern|Why it fails|Better pattern|
|---|---|---|
|myapp://screen42?tab=3&modal=1|Tied to implementation, not user meaning.|myapp://orders/{orderId} or https://example.com/orders/{orderId}|
|/checkout/payment?card=visa&amount=129.99|Sensitive, ephemeral, and possibly stale.|/cart or /checkout/start with secure server-side checkout session.|
|/profile?userName=Luca&email=...|Leaks personal data and breaks when identifiers change.|/users/{publicUserId} for public profiles; no URL for private profile sections.|
|/search?state=<largeBase64Blob>|Uninspectable, fragile, analytics-hostile, and privacy-risky.|/search?q=boots&sort=price&color=black for durable filters only.|
|/onboarding/step/7|Links to a brittle internal wizard step.|/onboarding/resume with server/local progress resolving the safe next step.|

## 5.5 Native, hybrid, and web apps: who owns the URL?
|App model|Navigation authority|URL strategy|Common mistake|
|---|---|---|---|
|Pure native app|Internal route graph owns navigation; OS handles universal/app links into selected routes.|Use verified HTTPS links for shareable public/private-gated content. Custom schemes only for controlled integrations.|Making every internal screen a public deep link, then breaking links after a redesign.|
|Cross-platform native|Shared product route contract; platform adapters decide visual presentation.|Define a framework-agnostic route map, then implement platform-specific link adapters.|Letting each platform invent slightly different route names and auth behavior.|
|Hybrid shell + web content|Pick one authority per area: either native shell owns routing or web app owns routing.|Use canonical web URLs for web-owned content; native routes for native-owned shell flows.|Two routers fighting: native thinks it is on Product, webview thinks it is on Search.|
|PWA / mobile web app|URL is the primary navigation state.|Every durable destination should have a canonical URL. Use manifest start_url/scope for installed behavior. [S8]|Treating the PWA like a native app and hiding state in memory so refresh/back/share fail.|
|Offline-first app|Internal route graph plus local database identifiers owns navigation.|Use URLs for synced/shareable objects; use local draft IDs for unsynced objects.|Creating external links to objects that only exist on one device.|

## 5.6 Deep-link handling algorithm
The handler should be boring and deterministic. The goal is not "open this screen at all costs"; the goal is "resolve the user's intended destination safely."
onExternalEntry(input):
  canonical = parseAndNormalize(input)
  if canonical is invalid:
      show safe fallback + explanation
      return

  destination = resolveRoute(canonical)
  if destination.requiresAuth and user is not authenticated:
      save returnTo = destination
      run authentication flow
      continue or explain failure
      return

  if destination.requiresPermission and user lacks permission:
      show access request / unavailable state
      return

  preload minimum data needed for orientation
  choose presentation for current window size
  navigate using history-aware behavior
  restore safe route state; ignore unsafe ephemeral params

# 6. App-type navigation patterns
The correct navigation model depends on what users are trying to do, how often they return, how sensitive the data is, and whether content is shareable. Use the table as a starting model, not a template to copy blindly.

|App type|Best structure|URL/deep-link approach|
|---|---|---|
|Content / media|Primary: Home, Browse/Search, Library/Saved, Account. Detail pages are durable objects. Playback may be a persistent accessory.|Canonical URLs for articles, episodes, videos, creators, playlists. Avoid URLs for transient player controls.|
|Commerce / marketplace|Primary: Home, Search, Cart, Orders/Account. Product detail and order tracking are central object screens.|URLs for products, categories, campaigns, public wishlists. Gate orders and checkout behind auth; avoid payment-step links.|
|Finance / health / sensitive data|Primary: Dashboard, Accounts/Records, Payments/Actions, Support, Profile/Security. Strong orientation and confirmation.|Use deep links sparingly, always auth-gated. Never encode personal data or amounts as trusted URL state.|
|Messaging / social|Primary: Inbox/Feed, Search, Create, Notifications, Profile. Conversation/post/profile detail screens are durable but permission-dependent.|Deep links for public posts/profiles and private conversations when permissioned. Handle deleted/revoked content gracefully.|
|Productivity / project management|Primary: Inbox, Projects/Workspaces, Search, Create, Reports/Account. Often benefits from multi-pane layouts.|Deep link to tasks, comments, files, dashboards, workspace records. Include workspace/org context.|
|Creative / camera / editing|Primary verb may be central: Capture/Create. Library/projects and export are durable places.|Deep link to finished projects or shared outputs. Unsaved edits should restore through local/server drafts, not public URLs.|
|Utility / single-purpose tool|Launch directly to the core tool or last safe state. Settings and history are secondary.|Usually few URLs. Support shortcuts/intents for frequent actions, e.g. scan, timer, start recording.|
|Game / immersive experience|Navigation often is mode selection, lobby, inventory, settings, store. Flow continuity matters more than URL addressability.|URLs for invites, matches, replays, profiles, store campaigns. Avoid deep-linking into unstable gameplay state.|
|Enterprise / internal ops|Workspace/entity hierarchy, search, inbox/approvals, reports, admin. Role-based visibility is central.|Deep links to records and approvals with role checks. Preserve tenant/workspace in the route.|

## 6.1 Choosing the top-level navigation
|Question|If yes|Likely navigation choice|
|---|---|---|
|Do users switch between 3-5 areas many times per session?|Yes|Bottom tabs on compact; rail on larger windows.|
|Is one action the app's main value?|Yes|Make the action prominent: center action, floating action, launch default, or shortcut.|
|Is the app mostly hierarchical browsing?|Yes|Stack navigation with clear list-detail transitions; tabs only for truly separate sections.|
|Does the app manage many workspaces or accounts?|Yes|Add account/workspace switcher near top-level context; do not bury it in Settings.|
|Are there many low-frequency admin sections?|Yes|Use secondary menu/drawer/settings area; keep primary nav focused.|
|Will many entries come from links/notifications/search?|Yes|Invest in route resolution, auth handoff, and empty/unavailable states.|
