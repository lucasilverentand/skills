---
name: carplay
description: "CarPlay enables users to manage directions, conduct calls, send and receive messages, stream music, and perform other functions using their vehicle's integrated display, allowing them to maintain f…. Use when designing carplay for iOS and iPadOS, auditing carplay against Apple's iOS and iPadOS guidelines, or when the user says things like \"design carplay for iPhone\", \"carplay on iOS and iPadOS\", \"how should carplay work on iPhone\"."
allowed-tools: Read Grep Glob
---

# CarPlay
CarPlay enables users to manage directions, conduct calls, send and receive messages, stream music, and perform other functions using their vehicle's integrated display, allowing them to maintain focus on driving

## When to use
- User asks about **carplay** on iOS and iPadOS (e.g. `"how do I design carplay for iPhone"`).
- User is building an iPhone UI that needs carplay and wants to follow Apple's guidelines.
- User asks to audit or review carplay in an iOS and iPadOS design.
- User mentions carplay in the context of an iPhone app, game, or interface.

## Quick principles
- **Eliminate app interactions on iPhone when CarPlay is active** — All user interaction with your application must occur through the vehicle's controls and display
- **Never lock people out of CarPlay because the connected iPhone requires input** — Your application must remain functional even if the iPhone is inaccessible—for instance, if it is placed in a bag or trunk while…
- **Make sure your app works without requiring people to unlock iPhone** — Since most users utilize CarPlay while their iPhone is locked, ensure that the features you provide in your CarPlay app operate as…
- **Allow users to initiate playback** — Generally, avoid beginning audio automatically unless your app is dedicated to a single audio source or is resuming previously paused content
- **Begin playback once audio is adequately buffered** — After a user makes a selection, it may take several seconds for sound to start due to network or buffering conditions
- **Present the Now Playing screen upon playback readiness** — Do not delay playback while waiting for descriptive information to finish loading
- **Only resume audio playback after an interruption if it is appropriate** — For example, your app can restart audio following a temporary interruption like a phone call
- **Automatically adjust audio levels only when required, but never modify the master volume** — Although your app can manage relative, independent volume levels to achieve a balanced mix of audio, users must retain control over the…
- **Present valuable, high-impact information using a clear layout that is easily viewable from the driver's perspective** — Avoid cluttering the display with nonessential details or excessive visual ornamentation
- **Maintain a consistent aesthetic across your entire application** — Generally, elements performing similar functions should share a uniform appearance
- **Ensure that core content is prominent and immediately actionable** — Larger elements convey greater importance than smaller ones and are simpler for users to interact with
- **Generally, utilize a restricted color palette that complements your application's logo** — A subtle deployment of color is an excellent method for conveying brand identity

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
