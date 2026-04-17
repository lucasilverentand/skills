---
name: shazamkit
description: "ShazamKit enables audio recognition by comparing an audio sample against either the ShazamKit catalog or a user-defined custom audio catalog. Use when designing shazamkit for macOS, auditing shazamkit against Apple's macOS guidelines, or when the user says things like \"design shazamkit for Mac\", \"shazamkit on macOS\", \"how should shazamkit work on Mac\"."
allowed-tools: Read Grep Glob
---

# ShazamKit
ShazamKit enables audio recognition by comparing an audio sample against either the ShazamKit catalog or a user-defined custom audio catalog

## When to use
- User asks about **shazamkit** on macOS (e.g. `"how do I design shazamkit for Mac"`).
- User is building a Mac UI that needs shazamkit and wants to follow Apple's guidelines.
- User asks to audit or review shazamkit in a macOS design.
- User mentions shazamkit in the context of a Mac app, game, or interface.

ShazamKit can be utilized to implement features such as:

- Enhancing user experiences with visuals that match the genre of the currently playing music.
- Improving media accessibility for individuals who are hearing impaired by offering synchronized closed captions or sign language alongside the audio.
- Aligning in-app experiences with virtual content in scenarios like e-commerce or online education.

If your application requires the device microphone to capture audio samples for recognition, you must request access to it. As with any permission requirement, it is vital that users understand the rationale behind your request. For detailed guidance, refer to [Privacy](privacy.md).

### Best practices
- **Terminate recording promptly.** Since users grant microphone access for recognition, they do not anticipate continuous audio capture. To help preserve privacy, restrict recording duration strictly to the time required to obtain the necessary sample.
- **Allow users to opt in for storing your app’s recognized songs to their iCloud library.** If your application supports saving matches to iCloud, users must first approve this action. While both the Music Recognition control and the Shazam app may list your application as the source of the song, users value maintaining control over which apps contribute content to their library.
