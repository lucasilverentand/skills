---
name: mac-catalyst
description: "When you leverage Mac Catalyst to develop a macOS version of your iPad application, you provide users with the chance to enjoy the experience within a new operating environment. Use when designing mac catalyst for macOS, auditing mac catalyst against Apple's macOS guidelines, or when the user says things like \"design mac catalyst for Mac\", \"mac catalyst on macOS\", \"how should mac catalyst work on Mac\"."
allowed-tools: Read Grep Glob
---

# Mac Catalyst
When you leverage Mac Catalyst to develop a macOS version of your iPad application, you provide users with the chance to enjoy the experience within a new operating environment

## When to use
- User asks about **mac catalyst** on macOS (e.g. `"how do I design mac catalyst for Mac"`).
- User is building a Mac UI that needs mac catalyst and wants to follow Apple's guidelines.
- User asks to audit or review mac catalyst in a macOS design.
- User mentions mac catalyst in the context of a Mac app, game, or interface.

## Quick principles
- **Drag and drop** — Implementing drag and drop support in your iPad application automatically grants drag and drop functionality in the Mac version
- **Keyboard navigation and shortcuts** — Although a physical keyboard may not always be present on an iPad, users appreciate using the keyboard for navigation and shortcuts to…
- **Multitasking** — Applications that successfully scale their interface to support Split View, Slide Over, and Picture in Picture establish the necessary foundation for supporting…
- **Multiple windows** — By accommodating multiple scenes on iPad, you simultaneously enable support for multiple windows in the macOS iteration of your app
- **When you adopt the Mac idiom, thoroughly audit your app’s layout, and plan to make changes to it** — To assist with this process, consider utilizing a separate asset catalog for your Mac app's assets rather than reusing the one containing…
- **Adjust font sizes as needed** — When using the Mac idiom, text renders at its configured size (100%), which may appear excessively large without modification
- **Make sure views and images look good in the Mac version of your app** — With the Mac idiom, iPadOS views render at their full size (100%), resulting in increased visual detail
- **Limit your appearance customizations to standard macOS appearance customizations that are the same or similar to those available in iPadOS** — Not every appearance customization available through iPadOS controls is supported by macOS controls
- **Ensure users maintain access to critical tab-bar items in the Mac version of your application** — Regardless of whether you substitute a tab bar with a split view or a segmented control in your iPad app, provide users…
- **Provide multiple methods for moving between pages** — Mac users—particularly those navigating with a pointing device or keyboard alone—value Next and Previous buttons in addition to the iPad or trackpad…
- **Consider migrating controls from the main UI of your iPad application to the toolbar within your Mac application** — Ensure that these controls are also listed in the menus of the Mac app's menu bar
- **Adopt a top-down flow whenever feasible** — Since Mac applications position the most critical actions and content toward the top of the window, if your iPad app uses a…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/before-you-start.md
- @references/choose-an-idiom.md
- @references/integrate-the-mac-experience.md
