---
name: pointing-devices
description: "Users can utilize a pointing device, such as a trackpad or mouse, to navigate the interface and initiate actions. Use when designing pointing devices for iOS and iPadOS, auditing pointing devices against Apple's iOS and iPadOS guidelines, or when the user says things like \"design pointing devices for iPhone\", \"pointing devices on iOS and iPadOS\", \"how should pointing devices work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Pointing devices
Users can utilize a pointing device, such as a trackpad or mouse, to navigate the interface and initiate actions

## When to use
- User asks about **pointing devices** on iOS and iPadOS (e.g. `"how do I design pointing devices for iPhone"`).
- User is building an iPhone UI that needs pointing devices and wants to follow Apple's guidelines.
- User asks to audit or review pointing devices in an iOS and iPadOS design.
- User mentions pointing devices in the context of an iPhone app, game, or interface.

## Quick principles
- **Maintain consistency in how you respond to mouse and trackpad gestures** — Users anticipate that most gestures will function identically across the entire system, irrespective of whether they are using a specific application or…
- **Do not redefine system-level trackpad gestures** — Even if your game utilizes app-specific gestures in a unique manner, users still expect systemwide gestures to be functional; for example, they…
- **Ensure a uniform experience within your application, regardless of whether users are interacting via gestures, gaze, a pointing device, or a keyboard** — Users expect to transition smoothly between different input types and should not have to learn different interactions depending on the mode or…
- **Allow users to employ the pointer to reveal and conceal controls that automatically minimize or fade** — For example, in iPadOS, users can bring up the minimized Safari toolbar by hovering the pointer over it (the toolbar minimizes again…
- **Deliver predictable behavior when users press and hold a modifier key while manipulating objects in your app** — For instance, if holding the Option key duplicates an object during a drag operation, ensure that this outcome is identical whether the…
- **Allow multiple selection in custom views when necessary** — Starting with iPadOS 15 and newer versions, users can click and drag the pointer across several items to select them
- **Distinguish between pointer and finger input only if it provides value** — For instance, a scrubber bar allows users to target a specific location in video playback using the pointer
- **Use clear, simple images when designing custom accessories** — Since a pointer accessory is small, it is crucial to design an image that communicates the intended pointer interaction without excessive detail
- **Consider leveraging the accessory transition to indicate a shift in an element's state or behavior** — Besides animating the appearance and disappearance of pointer accessories, the system also animates the changes in shape and position among accessories that…
- **When possible, utilize the content effects provided by the system** — Users quickly become accustomed to the visual feedback offered throughout the operating system and generally anticipate that this experience will extend to…
- **Prefer the system's pointer appearances for standard buttons and text input fields** — When the pointer behaves as users expect, you enhance their comfort while using your application
- **Add padding around interactive elements to establish comfortable hit targets** — You may need to experiment to determine the appropriate size for an element’s hit region

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/best-practices.md
- @references/platform-guidance-ios-ipados-overview.md
- @references/platform-guidance-ios-ipados-pointer-shape-and-content-effects.md
- @references/platform-guidance-ios-ipados-pointer-accessories.md
- @references/platform-guidance-ios-ipados-pointer-magnetism.md
- @references/platform-guidance-ios-ipados-standard-pointers-and-effects.md
- @references/platform-guidance-ios-ipados-customizing-pointers.md
