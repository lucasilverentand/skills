---
name: shareplay
description: "SharePlay enables multiple individuals to share activities—such as watching a film, listening to music, playing a game, or brainstorming on a whiteboard—during a FaceTime call or Messages exchange. Use when designing shareplay for visionOS, auditing shareplay against Apple's visionOS guidelines, or when the user says things like \"design shareplay for Apple Vision Pro\", \"shareplay on visionOS\", \"how should shareplay work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# SharePlay
SharePlay enables multiple individuals to share activities—such as watching a film, listening to music, playing a game, or brainstorming on a whiteboard—during a FaceTime call or Messages exchange

## When to use
- User asks about **shareplay** on visionOS (e.g. `"how do I design shareplay for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs shareplay and wants to follow Apple's guidelines.
- User asks to audit or review shareplay in a visionOS design.
- User mentions shareplay in the context of an Apple Vision Pro app, game, or interface.

## Quick principles
- **Ensure users are aware of SharePlay support** — Since media playback experiences are often expected to be shareable, you must indicate this capability within your application's interface
- **If your app requires a subscription, devise ways for non-subscribers to join group activities quickly** — For example, you might provide temporary or provisional access for non-subscribers, or allow an existing subscriber to issue a one-time pass to…
- **Support Picture in Picture (PiP) whenever possible** — On iPhone and iPad, shared videos can be viewed within a PiP window
- **Provide a brief description for each activity** — When individuals receive an invitation to join an activity, your description enables them to grasp the shared experience ahead
- **Simplify the process of initiating an activity** — If no session is active when users begin a shareable activity, you can present a user interface allowing them to start a…
- **Enable preparation before displaying the activity** — If users must complete prerequisites—such as logging in, downloading content, or making a purchase—before participating, display views that facilitate these tasks prior…
- **When feasible, postpone app tasks that might impede a shared activity** — For example, if your application requires specific participant profile information, consider requesting this data at a suitable juncture, such as when playback…
- **Choose the spatial Persona template that suits your shared activity** — When designing a shared activity, you can utilize a spatial Persona template to define the layout for arranging participants within the shared…
- **Be prepared to launch directly into your shared activity** — When one person shares the activity with others via a FaceTime call, the system minimizes friction by automatically launching your application for…
- **Help people enter a shared activity together, but don’t force them** — When one participant alters their level of immersion, the system notifies you so that you can synchronize the experience for everyone
- **Smoothly update a shared activity when new participants join** — When someone joins an ongoing activity, you must integrate them without disrupting the experience of the other participants
- **Ensure all participants view the identical state of your application** — If your app supports multiple states—for instance, a media application offering both minimal and theater modes—you must prevent different participants from viewing…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/best-practices.md
- @references/sharing-activities.md
- @references/platform-guidance-visionos-overview.md
- @references/platform-guidance-visionos-maintaining-a-shared-context.md
- @references/platform-guidance-visionos-adjusting-a-shared-context.md
