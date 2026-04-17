---
name: playing-audio
description: "Users anticipate sophisticated audio experiences that dynamically adapt based on the device's current context. Use when designing playing audio for iOS and iPadOS, auditing playing audio against Apple's iOS and iPadOS guidelines, or when the user says things like \"design playing audio for iPhone\", \"playing audio on iOS and iPadOS\", \"how should playing audio work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Playing audio
Users anticipate sophisticated audio experiences that dynamically adapt based on the device's current context

## When to use
- User asks about **playing audio** on iOS and iPadOS (e.g. `"how do I design playing audio for iPhone"`).
- User is building an iPhone UI that needs playing audio and wants to follow Apple's guidelines.
- User asks to audit or review playing audio in an iOS and iPadOS design.
- User mentions playing audio in the context of an iPhone app, game, or interface.

## Quick principles
- **Silence** — Users enable silent mode to prevent unwanted interruptions from unexpected sounds, such as incoming message tones or ringtones
- **Volume** — Users expect that their volume adjustments will influence all system sounds—including music and in-app sound effects—regardless of the method used to change…
- **Headphones** — Users employ headphones for private listening and, occasionally, hands-free operation
- **Adjust levels automatically when necessary — do not adjust the overall volume** — While your application can manage relative, independent audio levels to achieve a balanced mix, the operating system volume always dictates the final…
- **Permit audio rerouting when feasible** — Users frequently wish to select a different audio output device (e.g., switching from speakers to a stereo, car radio, or Apple TV)
- **Utilize the system-provided volume view for audio adjustments** — The volume view offers both a volume slider and controls for output device selection
- **Select an audio category appropriate for your app or game's sound usage** — The chosen audio category determines how your application's sounds interact with other audio, whether they continue playing in the background, or if…
- **Respond to audio controls only when it is contextually appropriate** — Users can control audio playback outside of your app's interface—such as via Control Center or headphone controls—regardless of whether your app is…
- **Avoid repurposing audio controls** — Since users expect consistent behavior across all applications, it is crucial that your app does not redefine the function of an audio…
- **Consider custom audio player controls only if you need to offer commands unsupported by the system** — For instance, you might wish to define custom increments for skipping forward or backward, or display content related to the playing audio…
- **Inform other applications when your app finishes playing temporary audio** — If your application temporarily interrupts the audio of other apps, ensure your audio session is flagged in a manner that allows other…
- **Determine how to respond to audio-session interruptions** — For instance, if your application involves recording or other audio functions that users wish to maintain uninterrupted, you can configure the system…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
