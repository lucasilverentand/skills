# Challenges
Challenges transform solitary activities into shared multiplayer experiences with friends. Challenges leverage leaderboards, enabling players to connect and compete within specified timeframes. For detailed developer guidance, consult [Creating engaging challenges from leaderboards](apple:GameKit/creating-engaging-challenges-from-leaderboards).

**Develop compelling challenges.** Challenges are ideal for brief, skill-based activities where player achievement can be clearly quantified. Design challenges that require between one and five minutes to complete, allowing players to finish the gameplay independently. Examples of successful challenges include:

- Achieving the fastest lap time in a racing scenario.
- Defeating the highest number of opponents within a single match.
- Successfully completing a daily puzzle with minimal errors.
- **Do not develop challenges that monitor cumulative progress or personal best scores.** Such tracking may unfairly benefit experienced players. Instead, track the player's most recent score following each attempt at your challenge. This ensures all participants remain motivated by maintaining a level playing field.
- **Ensure seamless access to your challenge.** Players can enter challenges via invitation links, the Game Overlay, or within the Games app across iOS, iPadOS, and macOS. Always deep-link directly to the specific mode or level where the challenge begins, and assist new players through any necessary initial onboarding before starting the challenge. For instance, if your game includes a tutorial level for basic controls, launch the player into that tutorial first and provide UI cues indicating the game will automatically transition to the challenge afterward.
- **Produce high-quality artwork that motivates players to participate in your challenges.** The system displays your challenge's artwork within the Game Overlay, Games app, and in the preview of an invitation link. Do not place your challenge's primary content in an area that may be obscured by the title or description. If you incorporate text into your challenge imagery, ensure you provide all appropriate localized versions through App Store Connect or Xcode. Use the following specifications when creating challenge artwork:

|Attribute|Value|
|---|---|
|Format|JPEG, JPG, or PNG|
|Color space|sRGB or P3|
|Resolution|72 DPI (minimum)|
|Image size|1920x1080 pt (3840x2160 px @2x)|
|Cropped area|1465x767 pt (2930x1534 px @2x)|
