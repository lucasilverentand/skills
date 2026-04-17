# Accessing Game Center
To ensure the optimal Game Center experience for your users, first determine if the player is logged into their Game Center account upon launching your game. If they are not signed in, initialize the player's Game Center profile at that time. This approach delivers the most seamless user journey and maximizes discovery potential for your game, including features like Top Played rankings and social recommendations from friends.

#### Integrating the access point
The Game Center access point is an Apple-designed UI element enabling players to view their profile and information without exiting your game. For guidance on developers, consult [Adding an access point to your game](apple:GameKit/adding-an-access-point-to-your-game).

On iOS, iPadOS, and macOS, this access point directs players to the Game Overlay, a system overlay allowing them to monitor progress and initiate game activities.

In visionOS and tvOS, the access point leads players to the in-game dashboard, a full-screen view of Game Center activity displayed atop your game.

- **Display the access point within menu screens.** You should consider integrating the access point into your game's main menu or settings section. Do not show the access point during active gameplay, temporary splash screens, cinematic sequences, or tutorials that precede your game's primary menu.
- **Avoid placing controls near the access point.** You have the option to position the access point in any of the four screen corners using a fixed placement. Since the access point has both collapsed and expanded states, verify that it does not overlap any critical UI elements or controls and adjust your layout accordingly.

> **Note**
> In visionOS, the placement of the access point depends on the game type (e.g., immersive or volume-based). Refer to [Adding an access point to your game](apple:GameKit/adding-an-access-point-to-your-game#Configure-the-access-point-on-visionOS) for developer instructions.

**Consider pausing your game when the Game Overlay or dashboard is visible.** Pausing the game assists players in reviewing their Game Center data without feeling that the game continues while they are viewing information.

#### Using custom UI
Your game can include custom links into the Game Overlay (in iOS, iPadOS, macOS) or the dashboard (in visionOS and tvOS). Your custom UI can deep-link into specific areas within both, such as leaderboards or a player’s Game Center profile.

- **Use the artwork Game Center provides in custom links.** When referencing Game Center features within your custom UI, use the official artwork from [Apple Design Resources](https://developer.apple.com/design/resources/#technologies). Preserve the appearance of this artwork and do not adjust its dimensions or visual effects.
- **Use the correct terminology in custom links.** The following table details how to correctly apply Game Center terminology, helping you prevent confusion for players using your custom UI.

|Term|Incorrect terms|Localization|
|---|---|---|
|Game Center|GameKit, GameCenter, game center|Use the system-provided translation of *Game Center*|
|Game Center Profile|Profile, Account, Player Info|Use the system-provided translation of *Game Center* and localize *Profile*|
|Achievements|Awards, Trophies, Medals||
|Leaderboards|Rankings, Scores, Leaders||
|Challenges|Competitions||
|Add Friends|Add, Add Profiles, Include Friends||
