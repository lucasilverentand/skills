# Interaction Quality

# 8. Layout and visual hierarchy
Visual design should make the structure obvious. Users should be able to tell what is content, what is navigation, what is an action, what is selected, what is disabled, and what is dangerous without reading a manual.

## 8.1 Layout principles
- Content first: Let content define the screen. Navigation and chrome should support orientation, not compete with the task.
- Progressive density: Compact screens show fewer panes and fewer simultaneous controls; expanded screens show relationships, previews, and secondary panels.
- Safe areas and reach: Respect system bars, dynamic islands/cutouts, title bars, toolbars, sidebars, gestures, keyboard, pointer targets, and one-handed use zones.
- Readable hierarchy: Use type size, weight, spacing, grouping, and contrast before inventing decorative containers.
- Motion with purpose: Animate continuity, causality, and state change. Avoid motion that merely delays task completion.
- Platform familiarity: Use native or platform-aligned components where users have strong expectations: back, close, tabs, sidebars, toolbars, sheets, pickers, menus, text selection, share, permissions.

## 8.2 Adaptive layout examples
|Compact phone|Medium foldable/tablet|Expanded tablet/desktop window|
|---|---|---|
|Bottom navigation + single-pane list or detail.|Navigation rail or bar + larger single pane; sometimes list and preview.|Sidebar/rail + multi-pane list-detail-supporting pane.|
|Filters in a sheet.|Filters in a side sheet or persistent panel when space allows.|Persistent filter/sidebar if it improves comparison.|
|Object detail pushes from list.|Object detail may replace list or appear beside it.|List and detail visible together; related info in supporting pane.|
|Primary action near thumb zone or content context.|Primary action remains close to relevant content.|Primary and secondary actions grouped by pane, not globally scattered.|
|Few visible commands; prioritize the current task.|Expose contextual actions when space and input precision allow.|Use toolbars, context menus, inspectors, and keyboard shortcuts for repeated work.|

## 8.3 Visual style checklist
- Selected navigation item is visually distinct from unselected items.
- Primary action is visible and named with a verb: Pay, Save, Export, Start, Continue.
- Destructive actions are separated, confirmed when high consequence, and reversible where possible.
- The page title reflects the actual place or object, not implementation names like DetailView.
- Skeletons, progress indicators, and disabled states explain what is happening.
- Text scales without clipping at larger font settings; layout does not depend on exact English string length.

# 9. Input, forms, and task flows
Forms are where many apps lose trust. A good form is not short at any cost; it asks only what is needed, in the order users can answer it, with validation that helps rather than punishes.

## 9.1 Task flow structure
1. Intent: Name the task in user language: "Send money," "Create project," "Book appointment."
1. Requirements: Ask for the minimum data needed to proceed safely.
1. Review: Show a clear summary before irreversible or high-consequence actions.
1. Commit: Make the final action explicit and specific.
1. Result: Confirm outcome, show next steps, and provide receipt/history where appropriate.

## 9.2 Form do/don't examples
|Situation|Good|Bad|
|---|---|---|
|Validation|Validate as soon as helpful, but not before the user has had a fair chance to type.|Red error state while the user is still entering the first character.|
|Keyboard|Use the appropriate keyboard, input mask, autofill, scan, picker, or passkey flow.|Force free-text entry for dates, phone numbers, cards, addresses, or one-time codes.|
|Progress|Show step count only when the number of steps is stable and meaningful.|"Step 2 of 3" that becomes "Step 2 of 6" after a choice.|
|Save/exit|Support drafts for long or interruptible tasks.|Destroy form state when the user checks a message or receives a call.|
|Errors|Explain what happened, what the user can do, and whether their data was saved.|"Something went wrong."|

# 10. Loading, offline, errors, and recovery
Apps live on unreliable networks, interrupted sessions, backgrounded processes, changing permissions, resizable windows, and restored workspaces. Design these as normal states, not edge cases.

|State|UX goal|Recommended treatment|
|---|---|---|
|Initial loading|Show that the app is alive and preserve perceived speed.|Skeletons or lightweight placeholders that match the final layout.|
|Refresh loading|Avoid destroying context.|Keep existing content visible; show refresh indicator or stale badge.|
|Offline|Let users understand what still works.|Cached content, disabled server-only actions, retry, offline queue where possible.|
|Optimistic update|Make common actions feel instant while staying honest.|Update UI immediately, show pending state, provide rollback/error recovery.|
|Server error|Preserve input and explain next step.|Retry, contact support, save draft, or alternative path.|
|Permission denied|Explain the benefit and route to settings only after user intent is clear.|Ask for permissions on first launch with no context.|

> Recovery principle<br>The user should never wonder: "Did it work?", "Did I lose my work?", or "What can I do now?"

# 11. Accessibility and inclusive interaction
Accessibility is not a final QA pass. It shapes navigation structure, naming, route handling, layout, input, motion, feedback, and error recovery. WCAG 2.2 is technology-neutral in its success criteria and is useful as a baseline even when the app is native rather than web. [S7]

## 11.1 Practical baseline
- Every interactive element has a programmatic role, label, state, and target size appropriate to the platform.
- The focus order matches the visual and task order, including modals, sheets, drawers, and restored deep-linked screens.
- Text supports dynamic sizing without clipping or hiding primary actions.
- Color is never the only carrier of state. Use text, icons, shape, or position as well.
- Motion-heavy transitions respect reduced-motion settings and do not block task completion.
- Gestures have alternatives. Dragging, swiping, pinching, and long-pressing should not be the only path to critical actions.
- Error messages are announced and placed near the problem they describe.
- Authentication supports accessible methods; avoid cognitive puzzles and unnecessary repeated entry.

## 11.2 Accessibility and navigation
|Navigation feature|Accessible implementation detail|
|---|---|
|Tabs / nav bar|Expose selected state, label each item, keep order stable, and avoid unlabeled icons.|
|Back / close|Use platform-standard semantics; distinguish Back from Close/Cancel in modal flows.|
|Sidebar / split view|Expose selected state, preserve focus predictably, and keep pane labels understandable to assistive technology.|
|Toolbar / menu command|Provide accessible labels, keyboard shortcuts where expected, disabled-state reasons when helpful, and visible feedback after activation.|
|Deep link|Announce the loaded destination with a meaningful title; focus the top-level heading or primary content.|
|Sheet / dialog|Trap focus while open, provide clear dismiss path, and restore focus to the launching control.|
|Search results|Announce result count and preserve query/filter context when returning from detail.|
|Multi-pane layout|Ensure assistive navigation communicates pane roles and does not jump unpredictably between panes.|

# 12. Trust, privacy, and permissions
Trust is part of UX architecture. Permissions, authentication, sensitive links, data storage, and privacy explanations shape whether users feel in control. Platform guidance continues to emphasize privacy, secure communication, data minimization, transparency, and user control. [S11]

## 12.1 Permission timing
|Permission|Good timing|Bad timing|
|---|---|---|
|Location|When user asks for nearby stores, navigation, route tracking, or local weather.|On first launch before explaining value.|
|Camera|When user taps Scan, Capture, Add photo, or Verify document.|During onboarding because the app might need it later.|
|Contacts|When user chooses Find friends, Invite, or Pay contact.|Before the user understands how contacts will be used.|
|Notifications|After the user has seen an event worth being notified about: delivery, reminder, bid, message, price alert.|First screen after install with generic "stay updated."|
|Photos/files|When importing, attaching, editing, or exporting user-selected media.|Broad access request when limited picker would work.|

## 12.2 Sensitive route rules
- Never trust URL parameters as authoritative for money movement, health data, identity, access control, or pricing.
- Do not put secrets, personal data, tokens, full names, emails, card details, precise locations, or medical details in URLs.
- For private deep links, resolve the route after authentication and permission checks; show a safe unavailable state if checks fail.
- Use one-time server-side sessions for high-risk flows, and expire them with clear recovery.
- Log route names and coarse outcomes, not sensitive parameter values.

# 13. AI, shortcuts, widgets, and system intents
AI and system-level actions are entry points, not replacements for structure. In 2026, platforms increasingly encourage exposing app content and actions to system experiences, including Apple App Intents and Android App Actions. [S9][S10]

## 13.1 Design actions as route-aware capabilities
A system action should map to a real app capability with predictable input, permissions, confirmation, and result. It should use the same route and task model as the app UI.

|Capability|Good system entry|Bad system entry|
|---|---|---|
|Start workout|Intent opens Start Workout with selected plan and visible confirmation.|Voice action silently starts the wrong workout with no recovery.|
|Create invoice|Shortcut opens prefilled draft invoice; user reviews before sending.|AI sends invoice immediately from ambiguous prompt.|
|Search photos|Widget/intent opens search results with query chips and editable filters.|AI-only result with no way to refine or inspect source set.|
|Transfer money|Intent can start a flow, but final confirmation happens in secure app context.|Assistant completes transfer based only on spoken phrase.|

## 13.2 Do not hide IA behind chat
Chat-style input is useful for fuzzy discovery, command shortcuts, summarization, and expert workflows. It is poor as the only navigation model because it hides available actions, makes state hard to inspect, and can make undo/recovery ambiguous. Keep explicit navigation, predictable destinations, and visible controls.
