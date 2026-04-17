# System intents
SiriKit defines a wide array of system intents that correspond to typical user actions, such as playing media, contacting friends, and organizing notes. For these system intents, Siri manages the conversational flow, while your application supplies the data required to successfully complete the interaction.

SiriKit offers the following intents:

|Domain (link to developer guidance)|Intents|
|---|---|
|[VoIP Calling](apple:SiriKit/voip-calling)|Initiate calls.|
|[Workouts](apple:SiriKit/workouts)|Start, pause, resume, conclude, or cancel workouts.|
|[Lists and Notes](apple:SiriKit/lists-and-notes)|Create notes.|
||Search for existing notes.|
||Establish reminders based on a specific date, time, or location.|
|[Media](apple:SiriKit/media)|Search for and play media content, including video, music, audiobooks, and podcasts.|
||Indicate approval or disapproval of items.|
||Add items to a library or playlist.|
|[Messaging](apple:SiriKit/messaging)|Send messages.|
||Search through messages.|
||View incoming messages.|
|[Payments](apple:SiriKit/payments)|Send payments.|
||Request payments.|
|[Car Commands](apple:SiriKit/car-commands)|Activate hazard lights or sound the horn.|
||Lock and unlock vehicle doors.|
||Check current fuel or power level.|

#### Design responses to system intents
Users rely on Siri for convenience and expect immediate responses. Your application must execute supported system intents swiftly and precisely to ensure a positive user experience when they choose your app to accomplish tasks.

- **Whenever possible, complete requests without leaving Siri.** If the request requires completion within your app, navigate users directly to the desired destination. Avoid intermediate screens or messages that impede the flow.
- **When a request has a financial impact, default to the safest and least expensive option.** Never mislead or inaccurately represent information. If a purchase offers different pricing tiers, do not default to the highest cost option. When processing payments, ensure no additional fees are incurred without prior notification.
- **When people request media playback from your app, consider providing alternative results if the request is ambiguous.** Displaying multiple choices within the Siri interface allows users to easily select different content if your initial suggestion is incorrect.
- **On Apple Watch, design a streamlined workflow that requires minimal interaction.** Whenever possible, utilize intelligent defaults rather than soliciting user input. For instance, a music application could respond to a general command—such as “Play music with MyMusicApp”—by starting a preferred playlist. If presenting choices is necessary, offer a limited number of relevant options to minimize subsequent prompting.

#### Enhance the voice experience for system intents
- **Create example requests.** When users access the Help section within the Siri interface, they view a guide that includes example phrases you provide. These phrases must demonstrate the quickest and most efficient ways to interact with your app using Siri. For developer guidance, refer to [Intent Phrases](apple:SiriKit/intent-phrases).
- **Define custom vocabulary that people use with your app.** To enable Siri to understand the actions performed by your application, define specific terms users might actually use in commands—such as account names, contact names, photo tags, album titles, ride options, or workout types. Ensure these terms are unique and non-generic to your app. Never include names of other applications, terminology obviously linked to other apps, inappropriate language, or reserved phrases like *Hey Siri*. Note that while you define these terms to aid request resolution, there is no guarantee of recognition by Siri.
- **Consider defining alternative app names.** If users may refer to your application using different terms, providing a list of alternatives helps Siri understand their intent. For example, a UnicornChat application might define the term *Unicorn* as an alternate name. Never impersonate other applications by including their names as alternatives for your app.

#### Design a custom interface for a system intent
If your iOS application supports it, you have the option to provide custom interface elements or a fully customized UI for Siri or Maps alongside your intent response. Note that a watchOS application cannot supply a custom UI for Siri to display on the Apple Watch.

- **Avoid including extraneous or redundant information.** While a custom interface allows you to incorporate app elements into the Siri environment, displaying details unrelated to the action can confuse users. Furthermore, avoid duplicating information that the system itself displays within the Siri or Maps interface. For guidance on this point, consult [INParameter](apple:Intents/INParameter).
- **Make sure people can still perform the action without viewing your custom interface.** Since users may switch to voice-only interaction with Siri at any time, it is essential that Siri conveys the same information you present in your custom interface.
- **Use ample margins and padding in your custom interface.** Unless the content is designed to naturally flow off-screen, such as a map view, avoid allowing your content to extend to the edges of the interface. Generally, maintain a 20-point margin between your content and each edge of the screen. Use the app icon displayed above your interface as a guide for alignment; content often appears best when centered relative to this icon.
- **Minimize the height of your interface.** Because the system displays other elements above and below your custom UI—including the text prompt, the spoken response, and the Siri waveform—aim for a height that does not exceed half the screen's dimensions, ensuring users can view all content without needing to scroll.
- **Refrain from displaying your app name or icon.** This information is automatically provided by the system, making its inclusion in your custom interface redundant.

For developer guidance, see [Creating an Intents UI Extension](apple:SiriKit/creating-an-intents-ui-extension).
