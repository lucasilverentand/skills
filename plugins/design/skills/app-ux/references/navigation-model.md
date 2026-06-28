# Navigation Model

# 4. Navigation model
Navigation is the visible expression of the information architecture. It has five jobs: orient the user, expose possible actions, preserve context, support recovery, and connect external entry points to internal destinations.

## 4.1 Navigation surfaces and when to use them
|Surface|Best for|Avoid when|
|---|---|---|
|Bottom tab / navigation bar|3-5 high-frequency top-level areas on compact screens. Each tab can own its own stack.|You need more than five primary areas, or the items are temporary campaign actions.|
|Navigation rail|Medium or expanded windows where vertical space is available and primary destinations should stay visible.|Compact phones where it competes with content or one-handed use.|
|Sidebar|Desktop, tablet, and productivity apps with visible hierarchy, workspace/account switching, saved views, or persistent sections.|Tiny screens or simple apps where a sidebar adds chrome without improving orientation.|
|Drawer / menu|Secondary or broad navigation, account/workspace switching, less frequent destinations, or medium/expanded layouts.|Hiding the app's most-used destinations on a phone. Material guidance increasingly favors bars/rails for common destinations. [S4]|
|Stack / push navigation|Hierarchies: list -> detail -> subdetail, browse -> object -> related object.|Independent top-level areas; pushing a tab destination onto another tab's stack confuses back behavior.|
|Modal full-screen flow|Focused tasks with a clear start and end: onboarding, checkout, create project, authentication.|Normal browsing. A modal should not become a secret second app.|
|Sheet / bottom sheet|Contextual choices, previews, filters, confirmation, lightweight editing.|Long, multi-step tasks or content that needs stable navigation and state restoration.|
|Inspector / properties panel|Desktop and expanded layouts where the user edits attributes of the selected object while preserving the object context.|Small windows, destructive tasks, or flows that require focused step-by-step confirmation.|
|Toolbar|Frequent object- or document-level actions with clear icon/label affordances and platform-standard placement.|Navigation replacement, high-risk actions without context, or too many rarely used commands.|
|Menu bar / app menu|Desktop app-wide commands, discoverable keyboard shortcuts, document/window actions, and advanced operations.|Primary navigation that should be visible in the app content itself.|
|Search|Large content sets, object lookup, command finding, cross-cutting retrieval.|Replacing a broken IA. Search should complement structure, not rescue it.|
|Command / shortcut / intent|Expert or system-triggered actions: "start run," "create invoice," "open last board."|Actions that need visual comparison, sensitive confirmation, or complex setup.|

## 4.2 Primary navigation rules
- Keep primary destinations stable across sessions. Users build muscle memory around them.
- Give each primary destination a clear label. Icons alone are rarely enough for unfamiliar concepts.
- Keep screen-specific actions with the screen, not in the global nav. A checkout button belongs near the cart or order summary, not in a persistent tab bar.
- Do not mix places and actions in the same primary navigation surface unless the action is the product's central verb, such as Capture in a camera app or Compose in a messaging app.
- Each primary destination should preserve its own local stack where the platform convention expects it. Switching tabs should not destroy where the user was unless the user explicitly resets it.
- On desktop, keep app-wide commands in menus or command search, object commands in toolbars/context menus, and navigation in sidebars/tabs/split views. Do not hide core structure behind a command palette.

## 4.3 Back behavior is history first, hierarchy second
Users think "back" means "take me to where I just was." Developers often implement it as "go to the parent route." Both are needed, but history should win after organic navigation. Hierarchy is the fallback for cold starts, deep links, and restored destinations.

|Scenario|Expected behavior|Bad behavior|
|---|---|---|
|User opens Product A from Search|Back returns to Search results with query, filters, and scroll position intact.|Back goes to Home because Product is nested under Home in the route tree.|
|User opens a push notification to an order|Back can go to Orders list or previous app context depending on platform convention; the order screen must show enough orientation either way.|Back exits to a blank screen or an unrelated tab.|
|User deep-links to a private record while signed out|Authenticate, then continue to the requested record if allowed. If not allowed, explain and route to a safe fallback.|Drop the user on Home and lose the original destination.|
|User cancels a modal task|Return to the exact launching context, with unchanged data unless the user saved draft changes.|Pop multiple unrelated screens or clear the current tab stack.|

## 4.4 Modals, sheets, and temporary UI
> Modal test<br>A modal is justified when the user must either finish, cancel, or make a bounded decision before returning. If the user may browse, deep link, return later, share, or compare, it is probably a destination, not a modal.

- Good modal: Confirm a bank transfer with final details, biometric confirmation, and cancel/submit choices.
- Bad modal: A product detail page that users need to share, compare, save, review, and return to later.
- Good sheet: Sort and filter controls that affect the current list.
- Bad sheet: A six-step onboarding wizard squeezed into a draggable panel.
