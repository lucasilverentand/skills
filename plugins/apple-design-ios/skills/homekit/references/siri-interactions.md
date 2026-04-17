# Siri interactions
HomeKit enables robust, hands-free device management through voice commands. You can assist users in leveraging Siri to manage accessories, services, and zones within their home quickly and efficiently.

- **Present example voice commands to demonstrate using Siri to control accessories during setup.** Once users finish setting up a new accessory, suggest example Siri phrases using the service name they selected and prompt them to try these commands.
- **After setup, consider teaching people about more complex Siri commands.** Users may be unaware of the wide variety of natural language phrases available when using Siri and HomePod to manage their accessories. Following setup completion, include helpful locations within your app to educate users on these command types. For instance, in a scene detail view, you might suggest: *You can say “Hey Siri, set ‘Movie Time.’”*

In addition to recognizing home names, room names, zone names, service names, and scene names, Siri can also utilize information like accessory category and characteristic to identify a service. For example, if users use terms such as *brighter* or *dim*, Siri understands they are referring to a service that possesses a brightness characteristic, even if the specific service name is not spoken.

To illustrate the power and flexibility of Siri commands, here are examples of phrases users could employ to control their accessories.

|Phrase|Siri understands|
|---|---|
|“Turn on the floor lamp”|Service (*floor lamp*)|
|“Show me the entryway camera”|Service (*entryway camera*)|
|“Turn on the light”|Accessory category (*light*)|
|“Turn off the living room light”|Room (*living room*)<br>||Accessory category (*light*)|
|“Make the living room a little bit brighter”|Room (*living room*)<br>||Accessory category (implied)|
||Brightness characteristic (*brighter*)|
|“Turn on the recessed lights”|Service group (*recessed lights*)|
|“Turn off the lights upstairs”|Accessory category (*lights*)<br>||Zone (*upstairs*)|
|“Dim the lights in the bedroom and nursery”|Accessory category (*lights*)<br>||Brightness characteristic (*dim*)|
||Rooms (*bedroom*, *nursery*)|
|“Run Good night”|Scene (*Good night*)|
|“Is someone in the living room?”|Accessory category (implied)<br>||Occupancy detection characteristic (implied)|
|“Is my security system tripped?”|Accessory category (*security system*)|
|“Did I leave the garage door open?”|Accessory category (*garage door*)<br>||Open characteristic (*open*)|
|“Did I forget to turn off the lights in the Tahoe House?”|Accessory category (*lights*)<br>||Home (*Tahoe House*)|
|“It’s dark in here”|Current home (*here*)<br>||Current room (via HomePod)|
||Accessory category (implied)|

- **Recommend that people create zones and service groups, if they make sense for your accessory.** If context-specific voice commands would benefit users controlling your accessory, suggest these interactions and assist with their setup. For instance, if you provide an accessory like a light, switch, or thermostat, consider suggesting a zone named “upstairs” or a service group named “media center” to support commands such as, “Siri, turn off the upstairs lights,” or “Siri, activate the media center.”
- **Offer shortcuts only for accessory-specific functionality that HomeKit doesn’t support.** Since HomeKit allows users to control accessories using natural language without needing extra configuration, avoid confusing them by offering shortcuts that duplicate HomeKit functionality. Instead, consider providing shortcuts for complementary features your app offers. For example, if users frequently need to order filters for an air conditioner you support, you might offer a shortcut like “Order AC filters.” To learn how to provide phrases for shortcuts, see [Shortcuts and suggestions](siri.md#Shortcuts-and-suggestions).
- **If your app supports both HomeKit and shortcuts, help people understand the difference between these types of voice control.** Users may become confused if they are presented with multiple methods of voice control. Ensure you clearly delineate what is possible with shortcuts, and never encourage users to create a shortcut for a scene or action that HomeKit already handles.
