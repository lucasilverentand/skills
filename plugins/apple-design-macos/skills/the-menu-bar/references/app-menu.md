# App menu
The application menu lists options that pertain to your entire app or game, rather than to a specific document, window, or task. To help users quickly identify the active application, your app's name is displayed in bold within the menu bar.

The app menu typically includes the following items, presented in this specific order:

|Menu item|Action|Guidance|
|---|---|---|
|About *YourAppName*|Shows the About window for your application, which contains copyright and version details.|Use a short name of 16 characters or less. Do not include the version number.|
|Settings…|Launches your [Settings](settings.md) window, or the app's corresponding page in iPadOS Settings.|Reserve this for settings applicable to the entire application. If document-specific configurations are also offered, include them in the File menu.|
|Optional app-specific items|Executes custom actions or configurations specific to your application.|Place these custom app configuration options after the Settings item and within the same group.|
|Services (macOS only)|Displays a submenu containing services from the system and other applications relevant to the current context.||
|Hide *YourAppName* (macOS only)|Hides your app and all its windows, then activates the most recently used application.|Use the same short app name provided for the About item.|
|Hide Others (macOS only)|Hides all other open applications and their windows.||
|Show All (macOS only)|Displays all other open applications and their windows behind your app's active windows.||
|Quit *YourAppName*|Exits your application. Pressing Option changes Quit *YourAppName* to Quit and Keep Windows.|Use the same short app name provided for the About item.|

**Place the About menu item first.** Include a separator following the About menu item so that it appears as its own distinct group.
