---
name: playing-video
description: "Users expect high-quality video experiences on their devices, regardless of the application or game they are using. Use when designing playing video for macOS, auditing playing video against Apple's macOS guidelines, or when the user says things like \"design playing video for Mac\", \"playing video on macOS\", \"how should playing video work on Mac\"."
allowed-tools: Read Grep Glob
---

# Playing video
Users expect high-quality video experiences on their devices, regardless of the application or game they are using

## When to use
- User asks about **playing video** on macOS (e.g. `"how do I design playing video for Mac"`).
- User is building a Mac UI that needs playing video and wants to follow Apple's guidelines.
- User asks to audit or review playing video in a macOS design.
- User mentions playing video in the context of a Mac app, game, or interface.

## Quick principles
- **Utilize the system video player to ensure a familiar and seamless viewing experience** — The integrated video player delivers an excellent playback experience, offering consistent behaviors and interactions that allow users to focus entirely on the…
- **Always display video content at its original aspect ratio** — When video utilizes embedded letterbox or pillarbox padding to conform to a specific aspect ratio, the system may fail to scale the…
- **Provide additional information only when it adds value** — In iOS, iPadOS, tvOS, and visionOS, you have the ability to customize a video's supplementary information by including an image, title, description…
- **Support the interactions users anticipate, regardless of the input device controlling playback** — For instance, users expect to press Space on a connected keyboard to play or pause media across Apple Vision Pro, Mac, iPhone…
- **If users need to access playback options or content-specific information within your tvOS app, consider including a transport control or a dedicated custom content tab** — Since users typically access a transport control or content tab while viewing video, it is crucial to provide only the most relevant…
- **Prevent audio from different sources from mixing as viewers switch modes** — Mixed audio creates an unpleasant and frustrating user experience
- **Ensure a seamless transition into your application** — The TV app transitions to black when moving to your app and bypasses displaying your app's launch screen
- **Display the intended content without delay** — Users expect chosen content to begin playing immediately once the transition into your app is complete, particularly when resuming playback
- **Do not prompt users about resuming playback** — If content can be resumed, do so automatically without requiring explicit confirmation from the user
- **Control playback using the Space bar on a connected Bluetooth keyboard** — Users expect that pressing Space controls media playback, regardless of the specific keyboard hardware being used
- **Ensure content plays for the correct viewer** — If your app supports multiple user profiles, the TV app can specify a profile when initiating playback
- **Utilize the previous end time when resuming a lengthy video** — Resuming playback at the point where it was previously stopped allows users to quickly pick up exactly where they left off

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines-overview.md
- @references/guidelines-best-practices.md
- @references/guidelines-integrating-with-the-tv-app.md
