# Communicating with people
**When displaying instructional content, use accessible language.** Since Augmented Reality (AR) is an advanced concept that may confuse some users, make it approachable by avoiding technical jargon such as `ARKit`, "world detection," or "tracking." Instead, employ conversational and friendly terminology that the majority of users will grasp.

|Do|Don’t|
|---|---|
|If a surface cannot be located, suggest moving aside or readjusting the device.|If a plane cannot be found, advise adjusting tracking.|
|Instruct users to tap a specific location to position the *[name of object to be placed]*.|Instruct users to tap a plane to anchor an item.|
|Suggest increasing lighting or moving around the area.|Indicate insufficient features.|
|Advise moving the phone more slowly.|Indicate excessive motion has been detected.|

- **In a three-dimensional environment, favor 3D cues.** For instance, using a 3D rotation indicator around an object is more intuitive than relying on text instructions in a 2D overlay. Do not include textual hints in a 3D setting unless users are failing to respond to the contextual cues.
- **Ensure critical text is legible.** Utilize screen real estate for all essential labels, annotations, and instructions. If displaying text in 3D space, confirm that the text is oriented toward the user and maintain a consistent font size regardless of the distance between the text and the object it describes.
- **If additional information is needed, provide a pathway to access it.** Design a visual cue that integrates seamlessly with your application experience to signal to the user that they can tap for further details.
