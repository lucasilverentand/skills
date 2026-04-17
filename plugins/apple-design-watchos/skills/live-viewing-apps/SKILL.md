---
name: live-viewing-apps
description: "When developing a live-viewing application, the content must be elevated and prioritized. Ensure that every screen draws user attention to the live broadcast while allowing users to instantly diffe…. Use when designing live viewing apps for watchOS, auditing live viewing apps against Apple's watchOS guidelines, or when the user says things like \"design live viewing apps for Apple Watch\", \"live viewing apps on watchOS\", \"how should live viewing apps work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Live-viewing apps
When developing a live-viewing application, the content must be elevated and prioritized. Ensure that every screen draws user attention to the live broadcast while allowing users to instantly differentiate it from video-on-demand (VOD) content. Furthermore, implement fluid and engaging interactions to promote deep immersion in the live viewing experience

## When to use
- User asks about **live viewing apps** on watchOS (e.g. `"how do I design live viewing apps for Apple Watch"`).
- User is building an Apple Watch UI that needs live viewing apps and wants to follow Apple's guidelines.
- User asks to audit or review live viewing apps in a watchOS design.
- User mentions live viewing apps in the context of an Apple Watch app, game, or interface.

### Best practices
- **Feature live content prominently and make it easy to access.** Since users utilize your application specifically to view content, minimize the delay between launching the app and beginning playback. If live content is featured on the initial tab, users should be able to start viewing without needing more than one tap.
- **Let people tap once — or not at all — to start playback.** For instance, you might display a "Watch Now" button overlaid on featured or recently viewed live content. When users tap this button, it should immediately vanish, initiating playback and replacing the application's UI with a full-screen, immersive viewing experience.
- **Make sure live content looks live.** Users must be able to differentiate between live and Video On Demand (VOD) content. While playing the live stream is the most effective way to convey immediacy, you can also help users identify it by marking it in some manner. For example, you could include a collection row titled "Live" featuring different channels and apply a visual marker—such as a badge, symbol, or sash—to denote that the content is live.
- **Consider indicating the progress of currently playing live content.** Users appreciate knowing their arrival point when they enter an ongoing live stream. You can use a progress bar or another indicator to display how much content remains.
- **Give people additional actions and viewing alternatives.** Beyond playback, which must always be the primary action, facilitate secondary functions like recording, restarting, downloading, and other supported actions. Present these actions in a consistent sequence throughout the app (e.g., Watch, Start Over, Record, Favorite). Additionally, if the content is scheduled to repeat, display this information so users can plan their viewing.
- **Consider using a content footer for browsing channels during playback.** A content footer allows users to browse without disrupting the live viewing experience. If you implement a content footer, ensure you:
- Apply a subtle visual treatment, such as darkening the area, to maintain text legibility and ensure all items remain visually distinct from the content playing underneath.
- Provide an easy way for users to identify the thumbnail corresponding to the currently playing content, perhaps by badging it or tinting its progress bar.
- Align the categories in the content footer with those found in your electronic program guide (refer to [EPG experience](#EPG-experience) for related guidance).
- Design a simple, predictable mechanism for invoking and dismissing the content footer; for example, if swiping up reveals the footer, users should expect swiping down to dismiss it.
- **Provide instant visual feedback when people change channels.** This is crucial for two reasons: confirming to the user that they have reached their desired channel, and allowing the streaming content sufficient time to load.
- **Match audio to the current context.** When users begin playing live content, they expect the audio to remain synchronized even if they switch to browsing while the content continues in the background. However, when users navigate away from the live tab within your application, they exit the live-viewing context, and audio playback must cease.

### EPG experience
Live-viewing applications usually include an electronic program guide (EPG) that details scheduled broadcasts. Adhere to these guidelines to ensure the EPG experience feels tailored and intuitive for your live-viewing application.

- **Clearly present current details and allow easy return to playback.** Upon opening the EPG, the currently playing program, channel, and time must be immediately visible so users can quickly navigate back to the live broadcast.
- **Ensure browsing the EPG is seamless.** Since a standard EPG contains substantial data, it is crucial to provide simple ways for users to page through, scroll, or jump within the guide. Also, consider implementing a "My Channels" or "Favorites" section for rapid access to frequently viewed content.
- **Organize content into recognizable groups to improve discoverability.** For instance, categories such as Movies, TV Shows, Kids, Sports, and Popular could be used. If your application includes a content footer, use these same categories to organize content thumbnails within the EPG.
- **Allow users to explore the EPG without interrupting their current viewing.** For example, you can enable picture-in-picture (PiP) mode or background playback while users browse the EPG.

### Cloud DVR
If your application supports digital video recording (DVR) in the cloud, adhere to these guidelines to ensure a superior recording experience within your live-viewing application.

- **Allow users to initiate and halt recording via the information panel.** During a live stream, users require immediate access to the info panel to begin recording.
- **Enable users to schedule future programs within a content details view.** Additionally, provide the option for them to record only that specific program or all subsequent episodes.
- **Assist users in customizing the recording experience to their needs.** Allow precise specification of what they wish to record, such as limiting recordings to the current episode, only new episodes, or specific games involving particular teams.
- **Permit playback and other content-specific actions within your cloud DVR section.** When a user opens the view displaying content details in your cloud DVR area, they should be able to play or delete content and adjust recording settings if applicable.
- **Provide controls allowing users to manage cloud DVR settings.** For example, you might allow the deletion of recordings they have already viewed or content older than a specific number of days. Ideally, help users prevent storage exhaustion by enabling automatic storage management that overwrites the oldest or already viewed content.
