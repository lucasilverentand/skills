# Platform guidance — visionOS — overview
While most visionOS applications are expected to support SharePlay, users wearing Apple Vision Pro select the Spatial option within FaceTime to share content and activities.

In a shared activity, FaceTime can display representations of other participants—known as spatial Personas—within each wearer’s environment, creating the feeling that everyone is sharing a unified experience in the same location. During a shared FaceTime session, participants can interact naturally through their spatial Personas. For instance, they can address others verbally or through gestures, indicate when someone is paying attention, and identify which person is utilizing a shared tool or resource.

visionOS employs the concept of *shared context* to describe the attributes of a shared activity that convey physical presence and connection over common content. A shared context assures users they are experiencing the same thing as everyone else.

When participants feel they are genuinely sharing an experience, social dynamics can foster authentic and intuitive interactions. For example, verbal and nonverbal communication allows them to plan, take turns, and share resources.

> **Note**
> During a shared activity, the system protects users' privacy by obscuring certain visual details about wearers. Additionally, an individual can adjust their spatial Persona if desired. Although the system supports placing spatial Personas shoulder-to-shoulder and facilitates shared gestures like a handshake or "high five," the spatial Personas maintain individual separation.

**Choose the spatial Persona template that suits your shared activity.** When designing a shared activity, you can utilize a spatial Persona template to define the layout for arranging participants within the shared space. The system offers three templates: side-by-side, surround, and conversational.

The side-by-side template positions participants adjacent to one another along a curved line segment, all oriented toward the shared content. This arrangement provides excellent visibility of the content to everyone and is ideal for collaborative media viewing. Since participants are not facing each other, this template may encourage less nonverbal interaction compared to the other spatial Persona templates.

The system-managed surround template places participants completely around the shared content in the center. This spatial Persona template is particularly effective when the content is three-dimensional, as each participant views it from a unique angle. In the surround template, participants face one another, simulating being grouped around a table and promoting both verbal and nonverbal exchanges.

The conversational template also groups participants around a central point, but it places the content along the circle rather than at its center. Due to this positioning, not every participant has an identical view of the content, and interaction may not be equally convenient for all. Consider using the conversational arrangement if your experience focuses more on people gathering while your application executes a background task, such as playing music.

For developer guidance, consult [SystemCoordinator](apple:GroupActivities/SystemCoordinator) and [SpatialTemplatePreference](apple:GroupActivities/SpatialTemplatePreference).

- **Be prepared to launch directly into your shared activity.** When one person shares the activity with others via a FaceTime call, the system minimizes friction by automatically launching your application for all participants. In this scenario, you must prevent any windows unrelated to the shared activity from being displayed. For instance, if users need to sign in before joining, present this task in an autodismissible window that disappears once the required input is provided.
- **Help people enter a shared activity together, but don’t force them.** When one participant alters their level of immersion, the system notifies you so that you can synchronize the experience for everyone. Before synchronization, verify whether changing a person’s immersion level would interrupt their current task; if it would, offer them the option to join the updated experience. For example, if someone is editing content in an unshared window, you might present an alert allowing them to choose how to transition. For guidance, see **Immersive experiences**.
- **Smoothly update a shared activity when new participants join.** When someone joins an ongoing activity, you must integrate them without disrupting the experience of the other participants. For example, it is crucial to update shared immersive content to maintain synchronization among all attendees. Additionally, consider designing mechanisms to accommodate up to five participants in your arrangement, updating their positions as needed.
