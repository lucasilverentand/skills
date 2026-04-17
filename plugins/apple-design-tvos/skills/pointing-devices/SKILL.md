---
name: pointing-devices
description: "Users can utilize a pointing device, such as a trackpad or mouse, to navigate the interface and initiate actions. Use when designing pointing devices for tvOS, auditing pointing devices against Apple's tvOS guidelines, or when the user says things like \"design pointing devices for Apple TV\", \"pointing devices on tvOS\", \"how should pointing devices work on Apple TV\"."
allowed-tools: Read Grep Glob
---

# Pointing devices
Users can utilize a pointing device, such as a trackpad or mouse, to navigate the interface and initiate actions

## When to use
- User asks about **pointing devices** on tvOS (e.g. `"how do I design pointing devices for Apple TV"`).
- User is building an Apple TV UI that needs pointing devices and wants to follow Apple's guidelines.
- User asks to audit or review pointing devices in a tvOS design.
- User mentions pointing devices in the context of an Apple TV app, game, or interface.

Pointing devices offer valued precision and flexibility. On Mac, users typically combine a pointing device with a keyboard when navigating applications and the system. For iPad and Apple Vision Pro, a pointing device provides an additional means of interacting with apps and content without replacing touch input, visual cues, or gestures.

### Best practices
- **Maintain consistency in how you respond to mouse and trackpad gestures.** Users anticipate that most gestures will function identically across the entire system, irrespective of whether they are using a specific application or game. For instance, Mac users rely on the "Swipe between pages" gesture to behave uniformly when navigating document pages, web pages, or images.
- **Do not redefine system-level trackpad gestures.** Even if your game utilizes app-specific gestures in a unique manner, users still expect systemwide gestures to be functional; for example, they assume familiar gestures will reveal the Dock or Mission Control in macOS. Keep in mind that Mac users have options to customize gestures for system actions.
- **Ensure a uniform experience within your application, regardless of whether users are interacting via gestures, gaze, a pointing device, or a keyboard.** Users expect to transition smoothly between different input types and should not have to learn different interactions depending on the mode or application they are using.
- **Allow users to employ the pointer to reveal and conceal controls that automatically minimize or fade.** For example, in iPadOS, users can bring up the minimized Safari toolbar by hovering the pointer over it (the toolbar minimizes again when the pointer moves away). Similarly, users can use the pointer to show or hide playback controls while viewing a full-screen video.
- **Deliver predictable behavior when users press and hold a modifier key while manipulating objects in your app.** For instance, if holding the Option key duplicates an object during a drag operation, ensure that this outcome is identical whether the user performs the drag using touch or the pointer.
