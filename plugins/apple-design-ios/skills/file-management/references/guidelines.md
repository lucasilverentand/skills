# File management — full guidelines
Users also anticipate being able to browse documents without first launching a document-based application. For example, on macOS, users access the file system via Finder; conversely, on iPhone, iPad, and Apple Vision Pro, users utilize the Files app to manage device documents. In watchOS and tvOS, since document creation, editing, or management is not typical, these operating systems do not include a dedicated document browsing interface.

### Creating and opening files
- **Utilize application menus and keyboard shortcuts to provide users with efficient methods for creating and accessing documents.** In both iPadOS and macOS, users anticipate using standard menu commands to generate new or locate existing documents. When you implement actions like New or Open, iPadOS displays these options within the shortcuts interface activated by holding Command on a connected hardware keyboard, while macOS presents them in the File menu bar. Regardless of whether keyboard shortcuts are available, include an Add (+) button to assist users in creating a new document. For macOS applications, place the add action within the File menu (refer to [File menu](the-menu-bar.md#File-menu) for guidance).
- **Should your application require a custom file browser, ensure it aligns with users' knowledge of the platform’s file system.** Users familiar with the Finder and Files apps already possess an understanding of their device's fundamental file structure. Although you may choose to display the most pertinent section of the file system when your custom browser launches—for instance, a Documents folder or iCloud, or the last accessed location—allow users to navigate the remainder of the file system through your browser if they choose.

### Saving work
Users should have confidence that their work is preserved unless they choose to cancel or delete it. Generally, do not require users to perform an explicit save action; instead, automatically save periodically while they are editing and when they close the file or switch applications.

File extensions must be hidden by default, though users should retain the option to view them. Ensure that this current preference is accurately reflected in all save and open interfaces displayed.

### Quick Look previews
Quick Look enables you to generate previews of files managed by your application, allowing users to view and sometimes interact with them inside your app. For instance, you might utilize Quick Look so users can hear an audio file preview, annotate a photo's preview, or manipulate a 3D file preview (rotating/scaling) for detailed examination.

- **Implement a Quick Look viewer to allow users to preview a file even if your app does not natively support it.** If your application allows users to attach or interact with files that it cannot handle, providing a Quick Look viewer lets them preview those files without needing to switch applications.
- **Evaluate implementing a Quick Look generator if your app generates proprietary file types.** A Quick Look generator allows other applications—such as Finder, Files, and Spotlight—to display previews of your documents, thereby improving their discoverability.

## Platform guidance — iOS & iPadOS

##### Document launcher
Starting in iOS 18 and iPadOS 18, document-based applications can leverage the system's document launcher to provide users with a consistent and highly graphical method for browsing, creating, and opening files. The document launcher offers a full-screen experience that emphasizes your app's core themes while simplifying the process of creating new documents. For developer instructions, refer to [DocumentGroupLaunchScene](apple:SwiftUI/DocumentGroupLaunchScene).

The document launcher is composed of three primary components:

- A *title card* that displays the application title alongside two app-specific buttons.
- A background image which appears behind the title card and additional visuals—known as *accessories*—that can surround it.
- A sheet that includes a file browser and optional controls specific to your application.

You have the ability to customize all three elements of the document launcher. While the system automatically includes your app's name in the title card, you are responsible for defining the text and functionality of the card’s primary and secondary buttons. Furthermore, you can supply a custom background image, one or more accessory images to frame the title card, and specific controls for the file browser's toolbar.

- **Assign your application’s most critical functions to the title card buttons.** The primary button should typically initiate a new document, and the secondary button can offer supplementary choices. For instance, in Numbers, the primary button might be "Start Writing," while the secondary button is "Choose a Template."
- **Ensure the background is visually distinct from both the accessories and the title card.** You may utilize a solid color, a gradient, or a pattern. Avoid using complex patterns or images that could distract from the foreground elements.
- **Be thoughtful about accessory placement.** For example, you can position accessories both in front of and behind the title card to achieve a sense of depth, but you must guarantee that your app name and both buttons remain easily visible. Prevent the title card from becoming cluttered with excessive accessories, and verify its overall appearance across all supported screen sizes and device orientations.
- **Use animation judiciously.** Excessive motion on the display can confuse or disorient users. If you choose to animate your accessories, consider gentle, repeating movements that subtly enhance and highlight your app's content. For example, you could implement an animation causing an accessory to appear as if it is softly swaying or breathing. For guidance, see [Motion](motion.md).

##### File provider app extension
If your application supports file sharing with other applications, you can implement a file provider app extension. This allows you to present a tailored interface for users to import, export, open, and manage your application's documents. For detailed guidance, refer to [File Provider](apple:FileProvider). An *app extension* is code you supply that users can install to enhance a specific system area; for more details, consult [App extensions](https://developer.apple.com/app-extensions/).

- **When users utilize your file provider extension to open or import files, display only those documents relevant to the current context.** For instance, if a PDF editor loads your extension, restrict listings to PDF files for opening or importing. You may also choose to include supplementary details like modification dates, sizes, and whether the documents are local or remote.
- **Ensure users select a destination when exporting or moving files.** Unless your application stores all documents in one directory, allow users to navigate to a precise destination within your established directory hierarchy. Providing functionality to add new subdirectories is also recommended.
- **Do not include a custom top toolbar.** Since your extension loads within a modal view that already contains a toolbar, adding a second one causes confusion and consumes valuable screen real estate.

Your application can also facilitate browsing and opening files created by other applications. For guidance on this feature, see [Adding a document browser to your app](apple:UIKit/adding-a-document-browser-to-your-app).
