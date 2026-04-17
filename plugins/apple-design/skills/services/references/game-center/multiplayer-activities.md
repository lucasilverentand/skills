# Multiplayer activities
Game Center facilitates both real-time and turn-based multiplayer experiences, simplifying the process of connecting players with friends or other users. Players can access these multiplayer features via party codes, the Game Overlay, the dashboard, or within the Games app. For detailed developer documentation, refer to [Creating activities for your game](apple:GameKit/creating-activities-for-your-game).

**Use party codes to invite players to multiplayer activities.** Game Center party codes are an effective method for coordinating real-time sessions, regardless of whether you utilize Game Center's matchmaking and networking services or provide your own infrastructure. Game Center generates alpha-numeric codes, typically eight characters long (e.g., “2MP4-9CMF”). When integrating party codes into your multiplayer game, adhere to these guidelines for optimal player experience:

- Enable players to join gameplay at different stages, depart early, and rejoin later.
- Include a feature allowing players to view the current party code within your game.
- Allow users to input a party code manually.
- **Support multiplayer activities through in-game UI.** The Game Overlay and the Game Center dashboard assist players in locating opponents for a match without needing to exit your game. While Game Center's default multiplayer interface allows users to invite nearby or recent players, friends, and contacts, you also have the option to present multiplayer functionality entirely within your custom user interface. For guidance on finding multiple players for a game, see [Finding multiple players for a game](apple:GameKit/finding-multiple-players-for-a-game).
- **Provide engaging activity artwork.** Players view the preview image for a multiplayer activity across different system components, including party codes, the Games app, and your in-game UI. Use the following specifications when creating this artwork:

|Attribute|Value|
|---|---|
|Format|JPEG, JPG, or PNG|
|Color space|sRGB or P3|
|Resolution|72 DPI (minimum)|
|Image size|1920x1080 pt (3840x2160 px @2x)|
|Cropped area|1465x767 pt (2930x1534 px @2x)|
