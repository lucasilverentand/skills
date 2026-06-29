# Architecture Baseline
App UX Architecture & Navigation Design Guide
A framework-agnostic playbook for structuring mobile, tablet, desktop, native, hybrid, cross-platform, and web apps
Version 1.0 - 27 June 2026

> Core idea<br>An app is not a pile of screens. It is a system of user goals, content objects, routes, state, windows, navigation surfaces, task surfaces, and platform entry points that all need to agree with each other.

WHO THIS IS FOR
Product designers, engineers, founders, and technical leads who need a shared way to structure apps before choosing SwiftUI, UIKit, AppKit, Jetpack Compose, React Native, Flutter, Kotlin Multiplatform, Electron, Tauri, Capacitor, native web views, or a PWA stack.
HOW TO READ IT
- Use sections 1-4 to decide the information architecture and navigation model.
- Use sections 5-7 to decide whether routes should become URLs, deep links, or purely internal app state.
- Use sections 8-12 to evaluate UX quality, accessibility, trust, performance, and modern 2026 expectations.
- Use sections 13-15 as pattern libraries and review checklists.

# Contents
|#|Section|Use it for|
|---|---|---|
|1|The app UX baseline|What changed: adaptive windows, system surfaces, privacy, accessibility, AI entry points.|
|2|The relationship model|How goals, objects, routes, screens, state, and navigation surfaces relate.|
|3|Information architecture before screens|How to structure any app around user goals and domain objects.|
|4|Navigation model|Tabs, stacks, drawers, modals, sheets, search, commands, and back behavior.|
|5|Routes, URLs, and deep links|When URLs matter, when they do not, and how to design a durable route contract.|
|6|App-type navigation patterns|How navigation changes by content, commerce, finance, tools, social, enterprise, and PWAs.|
|7|State, restoration, and lifecycle|Which state belongs in routes, storage, server data, or ephemeral UI.|
|8|Layout and visual hierarchy|Adaptive layout, spacing, typography, system materials, and touch ergonomics.|
|9|Input, forms, and task flows|Reducing friction without hiding necessary decisions.|
|10|Loading, offline, errors, and recovery|Keeping confidence when the network or backend is imperfect.|
|11|Accessibility and inclusive interaction|A practical baseline aligned with WCAG 2.2 and native accessibility expectations.|
|12|Trust, privacy, and permissions|Permission timing, data minimization, authentication, and security-sensitive routes.|
|13|AI, shortcuts, widgets, and system intents|How to expose actions without replacing the app's structure with a chat box.|
|14|Good and bad examples|Concrete comparisons across common app categories.|
|15|Review checklist and route template|A compact operating checklist for teams.|

# 1. The app UX baseline
A good app still needs the old fundamentals: clear hierarchy, fast feedback, legible typography, obvious recovery, and respect for platform conventions. The difference is that "app" no longer means one fixed canvas. A user may enter through a notification, universal link, app link, home-screen shortcut, widget, Siri or Assistant action, shared URL, search result, external keyboard, foldable posture, tablet window, desktop resize mode, menu command, file open event, or a restored task from yesterday.
The framework is not the architecture. Your UI toolkit renders views; your UX architecture defines the user's mental map. Keep those separate.

> Baseline rule for 2026<br>Design the app as a set of durable places, temporary tasks, recoverable states, and external entry points. Then choose platform-specific visual components that express that structure.

## 1.1 Design for windows, not only devices
Treat the available app window as the primary layout input. Phones, foldables, tablets, desktop windows, split screen, resizable panes, large text settings, landscape, external displays, and multi-window workspaces can all change the usable space. Material guidance explicitly frames adaptive layout around window size classes; Apple's current design guidance also emphasizes layout, materials, and system conventions across a widening device family. [S1][S2][S5]
- Start every screen with a compact layout, but define medium and expanded behavior before implementation starts.
- Prefer adaptive component swaps over stretched layouts: bottom navigation can become a rail or sidebar; single-pane lists can become list-detail; modal pickers can become panels or popovers; details can gain inspectors.
- Test with large text, rotation, split screen, long localized strings, right-to-left languages, external keyboard, reduced motion, poor network, and restored app state.

## 1.2 Platform aesthetics are surface rules, not product structure
Apple's Liquid Glass and Material 3's expressive surfaces influence translucency, depth, navigation components, shape, motion, and emphasis. They should not decide your product hierarchy. First define what is primary, secondary, contextual, destructive, persistent, or temporary; then style those decisions using the host platform's vocabulary. [S2][S4]

## 1.3 UX quality is now cross-surface
The app experience includes the installed app, web fallback, notification destinations, widgets, shortcuts, app intents, app actions, share sheets, authentication handoff, and customer support paths. These surfaces should route to the same conceptual destinations. A product detail should be the same product detail whether reached from search, a push notification, a universal link, a widget, or a tab stack.

# 2. The relationship model
Most app UX problems come from treating screens, windows, or views as isolated drawings. Instead, model the relationships between user goals, domain objects, navigation, routes, state, windows, and visual components.

Dependency chain: user goal -> domain object or task -> information architecture -> navigation graph -> route contract -> screen/view composition -> state model -> components, layout, motion, accessibility, analytics -> external entry points such as URLs, links, notifications, widgets, and intents.

Figure 1. A framework-agnostic dependency chain for app UX architecture.

## 2.1 The layers
|Layer|Question it answers|Examples|
|---|---|---|
|User goal|What is the person trying to accomplish?|Buy headphones, record a run, edit a photo, approve an invoice, reply to a message.|
|Domain object|What durable thing does the app manage?|Product, order, account, transaction, project, task, conversation, file, workout, booking.|
|Task flow|What sequence changes the object or produces an outcome?|Checkout, onboarding, transfer money, publish post, create invoice, export video.|
|Information architecture|Where does each object or task live in the mental map?|Home, Search, Library, Inbox, Account, Workspace, Settings.|
|Navigation graph|Which destinations exist, and how can users move between them?|Tabs, stacks, nested flows, modal tasks, sheets, search, command entry.|
|Route contract|How is a destination addressed internally or externally?|Internal route ID, path, URL, deep link, route params, auth requirements.|
|State model|What data is durable, shareable, restorable, or temporary?|Selected tab, filters, scroll position, draft text, cart, unsaved edits, auth session.|
|Presentation|How is the destination rendered and controlled?|Screen, pane, modal, sheet, popover, drawer, toast, banner, widget, shortcut result.|

> Design implication<br>A route should never exist only because a screen exists. A route exists because a user can meaningfully arrive at a durable destination or recoverable task state.

## 2.2 Places, tasks, and objects
Every screen-like thing should be classified as one of three types before design starts:

|Type|Definition|Navigation treatment|URL/deep-link treatment|
|---|---|---|---|
|Place|A stable area of the app where users repeatedly return.|Usually a primary tab, top-level destination, rail item, or workspace section.|Can have a route. May have a URL if it is shareable or externally addressable.|
|Object detail|A durable object the user can view or act on.|Usually pushed from a list/search, opened from a notification, or shown in a detail pane.|Strong candidate for a deep link if permissions allow.|
|Task|A bounded sequence with a start, progress, and exit.|Usually a modal flow, wizard, dedicated stack, or focused full-screen flow.|Only deep-link the start or safe resume point; avoid linking to fragile internal steps.|

# 3. Information architecture before screens
Information architecture is the product's map. It decides what belongs together, what deserves persistent navigation, what should be searchable, and what should be hidden until context demands it.

## 3.1 Start with nouns and verbs
List the durable nouns in the product, then list the verbs users perform on them. The primary navigation often comes from the most important nouns; task flows come from the most important verbs.

|App type|Core nouns|Core verbs|Likely primary areas|
|---|---|---|---|
|Commerce|Products, categories, cart, orders, profile|Search, compare, buy, track, return|Home, Search, Cart, Orders/Account|
|Banking|Accounts, cards, transactions, payees, transfers|Review, transfer, pay, freeze, dispute|Home, Accounts, Payments, Cards, Support|
|Messaging|Conversations, contacts, groups, media|Read, reply, search, call, share|Chats, Calls, Contacts, Settings|
|Creative tool|Projects, assets, edits, exports, presets|Capture, edit, save, export, share|Projects, Capture, Library, Export/Share|
|Enterprise SaaS|Workspaces, records, tasks, approvals, reports|Review, assign, approve, comment, search|Home, Work, Search, Inbox, Reports|

## 3.2 Decide what is primary by frequency and consequence
A primary destination is not merely "important to the business." It is something users need often, can recognize quickly, and expect to return to. High-consequence but infrequent actions, such as deleting an account, filing a dispute, or changing security settings, should be discoverable but not placed in the main navigation just because they are important.
- Good primary destination: Search in a marketplace app where discovery is central to every session.
- Bad primary destination: A promo campaign tab that replaces Orders in a commerce app for a week.
- Good secondary destination: Tax documents inside Account > Documents in a finance app.
- Bad secondary destination: A "More" drawer containing half the product's daily functions because the first navigation design ran out of room.

## 3.3 Build around user return paths
The best structure respects how users come back. A learning app should resume the current lesson. A delivery app should show the active order. A camera app should open to capture. A banking app should show balances but protect sensitive details. A project app should reopen the last workspace or inbox. "Home" is not always the right launch surface.
