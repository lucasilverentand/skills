# Patterns, Checklists, and Sources

# 14. Good and bad examples
Use these examples as design smell tests. The exact UI can vary by platform, but the underlying structure should hold.

|Scenario|Type|Example|
|---|---|---|
|Shopping product page|Good|Home/Search -> Product detail. URL: /products/{id}. Product can be shared, saved, compared, and opened from ads or search. Back returns to prior result context.|
|Shopping product page|Bad|Product detail appears only as a temporary sheet from a carousel; it cannot be shared, restored, or opened from external links.|
|Bank transfer|Good|Payments -> New transfer -> Recipient -> Amount -> Review -> Confirm. URL can start "new transfer" or open a transaction receipt after auth; final payment state is server-controlled.|
|Bank transfer|Bad|mybank://pay?to=alice&amount=500 is accepted as payment intent without authenticated review.|
|Messaging thread|Good|Notification opens exact conversation, marks user's place, preserves draft, and back returns to Inbox or previous context.|
|Messaging thread|Bad|Notification opens generic Home. User has to search for the message that triggered the notification.|
|Project management task|Good|Deep link includes workspace and task ID. If user lacks access, app shows request-access path. Expanded layout shows task + comments beside list.|
|Project management task|Bad|Link opens the last-used workspace and silently fails when the task belongs to another workspace.|
|Photo editor|Good|Capture/Create is a central action. Unsaved project restores locally. Exports and shared albums have URLs; edit history stays internal.|
|Photo editor|Bad|All edits are encoded in a giant share URL that breaks after app updates and leaks private file names.|
|Learning app|Good|Launch resumes current lesson. Course and lesson URLs are stable. Progress is server/local state, not hidden in the URL.|
|Learning app|Bad|Every launch opens marketing Home even when the user has an active lesson and a streak reminder.|

# 15. Review checklist and route template
Use this checklist before design handoff and again before implementation. It is deliberately framework-neutral.

## 15.1 UX architecture checklist
- [ ] Can a new team member explain the app's primary destinations in one sentence?
- [ ] Does every primary destination map to a durable user goal, not a business campaign?
- [ ] Does each top-level destination preserve its own expected state?
- [ ] Are task flows clearly bounded with start, review, commit, success, cancel, and recovery states?
- [ ] Is Back history-aware after organic navigation and hierarchy-aware after cold deep links?
- [ ] Are all externally addressable routes defined, version-tolerant, and permission-aware?
- [ ] Are sensitive routes protected from leaking data through URLs, analytics, logs, screenshots, and notifications?
- [ ] Does each deep link have a designed signed-out, unauthorized, deleted, expired, offline, and loading state?
- [ ] Does the compact layout have a medium/expanded adaptation plan?
- [ ] Do text scaling, localization, right-to-left layout, reduced motion, and assistive technologies work through navigation and modals?
- [ ] Are permissions requested only when the user understands the value?
- [ ] Can users recover from errors without losing work?
- [ ] Do shortcuts, widgets, notifications, AI actions, and search route to the same conceptual destinations as the app UI?

## 15.2 Route specification worksheet
|Field|Fill in|
|---|---|
|Route name||
|User-facing destination title||
|Domain object or task||
|Internal route pattern||
|External URL / deep-link pattern||
|Presentation on compact / medium / expanded||
|Required auth and permissions||
|Allowed route parameters||
|State explicitly excluded from URL||
|Back behavior after normal navigation||
|Back fallback after cold deep link||
|Loading, empty, deleted, unauthorized, offline states||
|Analytics name and safe parameters||
|Accessibility title, focus target, and announcement||
|Migration/redirect behavior for old links||

## 15.3 One-page decision summary
|Decision|Default answer|Override when|
|---|---|---|
|Should it be a route?|Yes, if it is a durable place, object, or recoverable task.|No, if it is only a menu, tooltip, toast, keyboard, temporary sort panel, or animation state.|
|Should it be a URL/deep link?|Yes, if it must work from outside the current app runtime.|No, if it is sensitive, ephemeral, unsaved, or meaningful only inside a current session.|
|Should it be primary navigation?|Yes, if used often, recognized quickly, and stable over time.|No, if it is campaign-specific, rare, contextual, or only important to internal stakeholders.|
|Should it be modal?|Yes, if it is bounded and must return to the launching context.|No, if users need to browse, share, restore, compare, or revisit it as a place.|
|Should AI/shortcut access exist?|Yes, for frequent, well-bounded, permission-aware actions.|No, if the task is ambiguous, high-risk, or requires visual review before intent is clear.|

# Sources and standards consulted
The guide is intentionally framework-agnostic. These sources informed the platform and accessibility assumptions; they should be treated as current reference points, not as substitutes for product-specific user research or local legal review.
[S1] Apple Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines
[S2] Apple: Adopting Liquid Glass / Materials: https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass
[S3] Apple: Universal Links and Associated Domains: https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content/
[S4] Material Design 3: Navigation bar, rail, and drawer guidance: https://m3.material.io/components/navigation-bar/overview
[S5] Android Developers: Adaptive apps and window size classes: https://developer.android.com/develop/adaptive-apps/guides/use-window-size-classes
[S6] Android Developers: Deep links and App Links: https://developer.android.com/training/app-links/create-deeplinks
[S7] W3C: Web Content Accessibility Guidelines 2.2: https://www.w3.org/TR/WCAG22/
[S8] W3C: Web Application Manifest: https://www.w3.org/TR/appmanifest/
[S9] Apple: App Intents: https://developer.apple.com/documentation/appintents
[S10] Android Developers: App Actions: https://developer.android.com/develop/devices/assistant/get-started
[S11] Android Developers: Security best practices: https://developer.android.com/privacy-and-security/security-best-practices

# Appendix: quick vocabulary
|Term|Meaning in this guide|
|---|---|
|Destination|A user-meaningful place or object view the app can navigate to.|
|Route|An internal address for a destination, independent of UI framework.|
|URL|A web-compatible external address. In PWAs it is also the primary navigation state.|
|Deep link|An external link or system entry that opens a specific in-app destination.|
|Stack|A last-in-first-out navigation history, commonly used for hierarchy and detail pages.|
|Primary destination|A stable, high-frequency top-level area of the app.|
|Modal|A temporary task or decision surface that returns to a previous context.|
|State restoration|The app's ability to return users to meaningful context after backgrounding, process death, sign-in, or link handoff.|
|Canonical route|The preferred current route pattern for a destination, even if old patterns still redirect.|
