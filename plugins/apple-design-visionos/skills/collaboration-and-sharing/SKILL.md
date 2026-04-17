---
name: collaboration-and-sharing
description: "Effective collaboration and sharing experiences are straightforward and highly responsive, enabling users to engage with content while communicating efficiently with others. Use when designing collaboration and sharing for visionOS, auditing collaboration and sharing against Apple's visionOS guidelines, or when the user says things like \"design collaboration and sharing for Apple Vision Pro\", \"collaboration and sharing on visionOS\", \"how should collaboration and sharing work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Collaboration and sharing
Effective collaboration and sharing experiences are straightforward and highly responsive, enabling users to engage with content while communicating efficiently with others

## When to use
- User asks about **collaboration and sharing** on visionOS (e.g. `"how do I design collaboration and sharing for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs collaboration and sharing and wants to follow Apple's guidelines.
- User asks to audit or review collaboration and sharing in a visionOS design.
- User mentions collaboration and sharing in the context of an Apple Vision Pro app, game, or interface.

System interfaces and the Messages app provide consistent and convenient methods for users to collaborate and share. For instance, users can initiate sharing or collaboration by dropping a document into a Messages thread or selecting a destination within the standard share sheet.

Once collaboration starts, users can utilize the Collaboration button in your application to communicate with participants, execute specific actions, and manage session details. Furthermore, users will receive Messages notifications when collaborators mention them, make modifications, join, or depart.

You can leverage Messages integration and system-provided sharing interfaces regardless of whether you implement collaboration and sharing using CloudKit, iCloud Drive, or a proprietary solution. If you use a custom collaboration infrastructure to offer these features, ensure your app also supports universal links (refer to [Supporting universal links in your app](apple:Xcode/supporting-universal-links-in-your-app) for developer guidance).

Beyond facilitating document sharing and collaboration, visionOS supports deeply immersive shared experiences through SharePlay. See [SharePlay](shareplay.md) for detailed guidance.

### Best practices
- **Place the Share button in a convenient location, like a toolbar, to make it easy for people to start sharing or collaborating.** In iOS 16, the system-provided share sheet offers options for selecting a file-sharing method and setting permissions for new collaborations; similarly, iPadOS 16 and macOS 13 introduce comparable appearance and functionality in the sharing popover. Within your SwiftUI application, you can also enable sharing by presenting a share link that triggers the system-provided share sheet upon selection; for developer guidance, consult [ShareLink](apple:SwiftUI/ShareLink).
- **If necessary, customize the share sheet or sharing popover to offer the types of file sharing your app supports.** If you integrate CloudKit, you can enable support for sending a copy of a file by passing both the file and your collaboration object to the share sheet. Since the share sheet natively supports multiple items, it automatically detects the file and makes the “send copy” feature available. With iCloud Drive, your collaboration object supports this "send copy" functionality by default. For custom collaboration workflows, you can enable “send copy” support in the share sheet by including a file—or its plain text representation—in your collaboration object.
- **Write succinct phrases that summarize the sharing permissions you support.** For instance, acceptable phrases include “Only invited people can edit” or “Everyone can make changes.” The system utilizes your permission summary within a button that reveals the specific sharing options users employ to define the collaboration.
- **Provide a set of simple sharing options that streamline collaboration setup.** You can tailor the view presented when users select the permission summary button to offer choices that accurately reflect your app's collaboration capabilities. For example, you might allow users to define who has access and whether they can read or edit the content, as well as whether collaborators can add new participants. Keep the number of custom choices minimal and group them logically to ensure quick user comprehension.
- **Prominently display the Collaboration button as soon as collaboration starts.** The system-provided Collaboration button serves as a reminder that content is shared and indicates who is sharing it. Since the Collaboration button typically appears after users interact with the share sheet or sharing popover, placing it adjacent to the Share button is effective.
- **Provide custom actions in the collaboration popover only if needed.** Selecting the Collaboration button in your app reveals a popover divided into three sections. The upper section lists collaborators and includes communication buttons that launch Messages or FaceTime; the middle section houses your custom items; and the bottom section displays a button for managing the shared file. To prevent overwhelming users with excessive information, it is vital to offer only the most essential items required for collaboration within your app. For example, Notes summarizes recent updates and provides buttons to view more details or activity regarding those updates.
- **If it makes sense in your app, customize the title of the modal view’s collaboration-management button.** Users select this button—which defaults to “Manage Shared File”—to access the collaboration-management view where they can modify settings and add or remove collaborators. If you are utilizing CloudKit sharing, the system provides this management view; otherwise, you must build your own.
- **Consider posting collaboration event notifications in Messages.** Select the specific type of event that occurred—such as a change to the content, collaboration membership, or a mention of a participant—and include a universal link that allows users to open the relevant view within your app. For developer guidance, see [SWHighlightEvent](apple:SharedWithYou/SWHighlightEvent).

## Platform guidance — visionOS
By default, the system facilitates screen sharing by streaming the active window to collaborators when an application resides in Shared Space. If a user transitions the app to Full Space while sharing is underway, the system automatically pauses the stream for all participants until the application returns to Shared Space. For further details, consult [Immersive experiences](immersive-experiences.md).
