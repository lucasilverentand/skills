---
name: platforms
description: "Apple Human Interface Guidelines by platform: iOS and iPadOS, macOS, watchOS, tvOS, and visionOS UI components, controls, navigation, and platform conventions. Use when designing, building, or auditing UI for a specific Apple platform. Pair with `foundations` for shared Apple design principles and `services` for framework integrations. User says: \"design iPhone UI\", \"macOS component\", \"watchOS audit\", \"tvOS navigation\", \"visionOS layout\"."
allowed-tools: Read Grep Glob
---

# Apple Platform Design
Platform-specific HIG for Apple operating systems. Use this skill when the user's question depends on device, input model, navigation conventions, or component behavior for iOS and iPadOS, macOS, watchOS, tvOS, or visionOS.

## How to use
1. **Choose the target platform** from the selector below. If the user names more than one platform, read each matching glossary and compare only the relevant topics.
2. **Read the platform glossary first**. It maps UI topics to reference files under `references/<platform>/`.
3. **Read only the matched references**. Multi-file topics (`×N`) live in `references/<platform>/<topic>/`.
4. **Pull in `foundations`** for shared principles like color, typography, layout, accessibility, motion, SF Symbols, and shared UI elements.
5. **Pull in `services`** when the UI surfaces Apple frameworks or services like Apple Pay, HealthKit, Siri, widgets, sensors, media playback, or Wallet.
6. **Stay platform-specific**. Do not generalize a platform convention across Apple platforms unless the matching references agree.

## Platform selector
|Platform|Read first|Use when|
|---|---|---|
|iOS and iPadOS|`references/ios/glossary.md`|Designing for iPhone or iPad, auditing iOS/iPadOS UI, or checking touch-first component behavior.|
|macOS|`references/macos/glossary.md`|Designing for Mac, auditing desktop UI, or checking menu, window, pointer, keyboard, and productivity conventions.|
|watchOS|`references/watchos/glossary.md`|Designing for Apple Watch, auditing glanceable UI, or checking Digital Crown, complication, haptic, and compact interaction patterns.|
|tvOS|`references/tvos/glossary.md`|Designing for Apple TV, auditing living-room UI, or checking focus, remote, media, and large-screen navigation conventions.|
|visionOS|`references/visionos/glossary.md`|Designing for Apple Vision Pro, auditing spatial UI, or checking windows, volumes, immersive experiences, ornaments, and gaze/gesture behavior.|

## Routing rules
- If the request is platform-agnostic, use `foundations` instead.
- If the request is about a framework, service, or hardware capability, use `services` first, then come back here for platform-specific UI.
- If a topic appears in both a platform reference and `foundations`, treat the platform reference as the override for that platform's behavior.
- If the user asks for a cross-platform Apple design, compare the relevant platform references explicitly instead of blending them into one rule.
