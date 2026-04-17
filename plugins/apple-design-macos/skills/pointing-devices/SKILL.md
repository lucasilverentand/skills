---
name: pointing-devices
description: "Users can utilize a pointing device, such as a trackpad or mouse, to navigate the interface and initiate actions. Use when designing pointing devices for macOS, auditing pointing devices against Apple's macOS guidelines, or when the user says things like \"design pointing devices for Mac\", \"pointing devices on macOS\", \"how should pointing devices work on Mac\"."
allowed-tools: Read Grep Glob
---

# Pointing devices
Users can utilize a pointing device, such as a trackpad or mouse, to navigate the interface and initiate actions

## When to use
- User asks about **pointing devices** on macOS (e.g. `"how do I design pointing devices for Mac"`).
- User is building a Mac UI that needs pointing devices and wants to follow Apple's guidelines.
- User asks to audit or review pointing devices in a macOS design.
- User mentions pointing devices in the context of a Mac app, game, or interface.

## Quick principles
- **Maintain consistency in how you respond to mouse and trackpad gestures** — Users anticipate that most gestures will function identically across the entire system, irrespective of whether they are using a specific application or…
- **Do not redefine system-level trackpad gestures** — Even if your game utilizes app-specific gestures in a unique manner, users still expect systemwide gestures to be functional; for example, they…
- **Ensure a uniform experience within your application, regardless of whether users are interacting via gestures, gaze, a pointing device, or a keyboard** — Users expect to transition smoothly between different input types and should not have to learn different interactions depending on the mode or…
- **Allow users to employ the pointer to reveal and conceal controls that automatically minimize or fade** — For example, in iPadOS, users can bring up the minimized Safari toolbar by hovering the pointer over it (the toolbar minimizes again…
- **Deliver predictable behavior when users press and hold a modifier key while manipulating objects in your app** — For instance, if holding the Option key duplicates an object during a drag operation, ensure that this outcome is identical whether the…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines-overview.md
- @references/guidelines-pointers.md
