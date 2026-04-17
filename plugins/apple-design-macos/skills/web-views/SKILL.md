---
name: web-views
description: "A web view enables your application to load and render rich internet content, such as websites or embedded HTML, directly within the app. Use when designing web views for macOS, auditing web views against Apple's macOS guidelines, or when the user says things like \"design web views for Mac\", \"web views on macOS\", \"how should web views work on Mac\"."
allowed-tools: Read Grep Glob
---

# Web views
A web view enables your application to load and render rich internet content, such as websites or embedded HTML, directly within the app

## When to use
- User asks about **web views** on macOS (e.g. `"how do I design web views for Mac"`).
- User is building a Mac UI that needs web views and wants to follow Apple's guidelines.
- User asks to audit or review web views in a macOS design.
- User mentions web views in the context of a Mac app, game, or interface.

For example, Mail employs a web view to display HTML content in messages.

### Best practices
- **Support forward and back navigation when appropriate.** While web views inherently support sequential page movement, this functionality is not enabled by default. If users are expected to navigate through several pages within your web view, you must enable forward and back navigation and supply the necessary controls to manage these actions.
- **Avoid using a web view to build a web browser.** It is acceptable to use a web view for users to quickly access a website without exiting your application's context. However, since Safari is the dedicated tool for web browsing, attempting to replicate Safari's full capabilities within your app is unnecessary and strongly advised against.
