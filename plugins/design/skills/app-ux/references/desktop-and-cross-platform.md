# Desktop and Cross-Platform App UX
Use this reference when an app must work beyond compact mobile: desktop windows, tablets, foldables, split screen, external displays, pointer input, keyboard navigation, multi-window workflows, document surfaces, and web/PWA shells.

## Platform Model
|Surface|What it changes|Design response|
|---|---|---|
|Phone|Limited space, touch-first input, interrupted sessions, strong system navigation expectations.|Prioritize one task per view, thumb-reachable actions, concise navigation, clear recovery, and safe restoration.|
|Tablet / foldable|Variable posture, medium-to-expanded windows, touch plus keyboard and pointer, split screen.|Adapt from single pane to list-detail, add side panels only when they improve comparison, and avoid stretched phone layouts.|
|Desktop native|Resizable windows, keyboard shortcuts, pointer precision, app menus, toolbars, sidebars, inspectors, multiple windows.|Expose durable structure, repeated commands, and object context without overwhelming first-run users.|
|Desktop web / PWA|URL-first navigation, browser history, refresh/share expectations, installed-window constraints.|Make every durable destination URL-safe, keep browser back meaningful, and avoid hiding critical state only in memory.|
|Cross-platform shell|Shared product model with platform-specific presentation and input conventions.|Keep route and state contracts shared; let each platform adapt navigation, windows, controls, and commands.|

## Desktop Structure
- Use a sidebar for durable hierarchy, workspaces, accounts, saved views, projects, libraries, or inboxes.
- Use a split view when users need to keep a list and selected object visible together.
- Use an inspector for properties, metadata, formatting, filters, or object-specific settings that update the current selection.
- Use a toolbar for frequent contextual actions tied to the current window, document, object, or selection.
- Use menus for app-wide commands, document/window commands, advanced operations, and discoverable keyboard shortcuts.
- Use a command palette for expert access and fuzzy discovery, not as the only way to understand the app.
- Use context menus for secondary selection-specific commands; never make them the only path to critical actions.

## Window And Document Behavior
- Define what each window represents: app home, workspace, document, object detail, utility panel, inspector, or transient task.
- Preserve user workspaces: selected sidebar item, open document/object, pane widths, scroll position, filters, and draft work when safe.
- Do not duplicate destructive or high-risk task state across windows unless conflict handling is explicit.
- Make window titles reflect the user-facing place, object, or document, not implementation names.
- Decide whether opening an object reuses the current window, opens a new detail window, or focuses an existing matching window.
- Keep modal dialogs narrow and bounded. If users need to browse, compare, copy data, or return later, use a window, pane, sheet, or route instead.

## Input Modes
- Design every command for pointer, keyboard, and assistive technology. Touch support is additive on tablets and hybrid devices.
- Put repeated expert actions behind keyboard shortcuts or command search, but keep primary actions visible.
- Keep focus order aligned with visible structure across sidebars, toolbars, inspectors, panes, popovers, and dialogs.
- Use hover for preview or affordance, never as the only way to discover a required action.
- Treat drag and drop as an accelerator. Provide buttons, menus, or paste/import flows for the same critical operations.

## Cross-Platform Adaptation
|Product structure|Compact|Medium|Desktop / expanded|
|---|---|---|---|
|3-5 primary areas|Bottom tabs|Navigation rail or tabs|Sidebar, rail, or tab bar depending on platform|
|Browse list to detail|Stack push|List with preview or replace-detail|Split view with list, detail, and optional inspector|
|Filters and sort|Sheet or dedicated screen|Side sheet or inline controls|Persistent panel, toolbar controls, or saved view sidebar|
|Object actions|Inline primary action and overflow|Toolbar plus inline actions|Toolbar, context menu, command palette, keyboard shortcuts|
|Settings|Grouped screen stack|Two-column settings|Sidebar settings window or preferences panel|
|High-risk flow|Focused full-screen or modal task|Sheet or dedicated flow|Dialog only for bounded decisions; window/page for complex tasks|

## Anti-Patterns
- Shipping a stretched phone layout as the desktop UI.
- Hiding primary navigation in a drawer on large windows.
- Putting all desktop functionality in menus without visible orientation.
- Making command search the architecture.
- Opening duplicate windows with conflicting unsaved state.
- Treating browser back, system back, app back, close, cancel, and dismiss as interchangeable.
- Forgetting keyboard, focus, and pointer behavior until implementation QA.
