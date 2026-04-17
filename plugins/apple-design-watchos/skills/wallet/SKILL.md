---
name: wallet
description: "Wallet enables users to securely store items on iPhone and Apple Watch, such as credit and debit cards, driver’s licenses or state IDs, transit passes, event tickets, keys, and other items. Use when designing wallet for watchOS, auditing wallet against Apple's watchOS guidelines, or when the user says things like \"design wallet for Apple Watch\", \"wallet on watchOS\", \"how should wallet work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Wallet
Wallet enables users to securely store items on iPhone and Apple Watch, such as credit and debit cards, driver’s licenses or state IDs, transit passes, event tickets, keys, and other items

## When to use
- User asks about **wallet** on watchOS (e.g. `"how do I design wallet for Apple Watch"`).
- User is building an Apple Watch UI that needs wallet and wants to follow Apple's guidelines.
- User asks to audit or review wallet in a watchOS design.
- User mentions wallet in the context of an Apple Watch app, game, or interface.

## Quick principles
- **Offer to add new passes to Wallet** — When a user action results in a new pass—such as checking into a flight, purchasing an event ticket, or enrolling in a…
- **Help people add a pass that they created outside of your app** — If users generate a pass via your website or another device, suggest adding it to Wallet the next time they launch your…
- **Add related passes as a group** — If your application generates multiple passes, such as boarding passes for a multi-segment flight, include all passes simultaneously so users are not…
- **Display an Add to Apple Wallet button to let people add an existing pass that isn’t already in Wallet** — If users previously declined your suggestion to add a pass to Wallet—or if they have removed the pass—a dedicated button allows them…
- **Let people jump from your app to their pass in Wallet** — Wherever your application displays details about a pass that already resides in Wallet, you can provide a link to open it directly
- **Tell the system when your pass expires** — Wallet automatically conceals expired passes to prevent clutter while still offering a button for users to revisit them
- **Always get people’s permission before deleting a pass from Wallet** — For instance, you could implement an in-app setting allowing users to specify whether they wish to delete passes manually or have them…
- **Help the system suggest a pass when it’s contextually relevant** — Ideally, passes appear automatically when they are needed, eliminating the need for users to manually locate them
- **Update passes as needed** — While physical passes typically remain static, a digital pass can reflect changes to events
- **Use change messages only for updates to time-critical information** — Since a change message interrupts the user’s current workflow, it is crucial to send one only when you are providing an update…
- **Design a pass that looks great and works well on all devices** — Passes may appear differently across different devices
- **Avoid using device-specific language** — Since you cannot predict the device users will employ to view your pass, refrain from including text that might be ambiguous on…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/passes.md
- @references/designing-passes-overview.md
- @references/designing-passes-pass-styles-overview.md
- @references/designing-passes-pass-styles-boarding-passes.md
- @references/designing-passes-pass-styles-coupons.md
- @references/designing-passes-pass-styles-store-cards.md
- @references/designing-passes-pass-styles-event-tickets.md
- @references/designing-passes-pass-styles-generic-passes.md
- @references/designing-passes-passes-for-apple-watch.md
- @references/order-tracking-overview.md
- @references/order-tracking-displaying-order-and-fulfillment-details.md
- @references/identity-verification.md
- @references/specifications.md
