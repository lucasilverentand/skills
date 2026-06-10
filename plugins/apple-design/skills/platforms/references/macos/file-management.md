# File management — full guidelines
Users also anticipate being able to browse documents without first launching a document-based application. For example, on macOS, users access the file system via Finder; conversely, on iPhone, iPad, and Apple Vision Pro, users utilize the Files app to manage device documents. In watchOS and tvOS, since document creation, editing, or management is not typical, these operating systems do not include a dedicated document browsing interface.

### Creating and opening files
- **Utilize application menus and keyboard shortcuts to provide users with efficient methods for creating and accessing documents.** In both iPadOS and macOS, users anticipate using standard menu commands to generate new or locate existing documents. When you implement actions like New or Open, iPadOS displays these options within the shortcuts interface activated by holding Command on a connected hardware keyboard, while macOS presents them in the File menu bar. Regardless of whether keyboard shortcuts are available, include an Add (+) button to assist users in creating a new document. For macOS applications, place the add action within the File menu (refer to **File menu** for guidance).
- **Should your application require a custom file browser, ensure it aligns with users' knowledge of the platform’s file system.** Users familiar with the Finder and Files apps already possess an understanding of their device's fundamental file structure. Although you may choose to display the most pertinent section of the file system when your custom browser launches—for instance, a Documents folder or iCloud, or the last accessed location—allow users to navigate the remainder of the file system through your browser if they choose.

### Saving work
Users should have confidence that their work is preserved unless they choose to cancel or delete it. Generally, do not require users to perform an explicit save action; instead, automatically save periodically while they are editing and when they close the file or switch applications.

File extensions must be hidden by default, though users should retain the option to view them. Ensure that this current preference is accurately reflected in all save and open interfaces displayed.

### Quick Look previews
Quick Look enables you to generate previews of files managed by your application, allowing users to view and sometimes interact with them inside your app. For instance, you might utilize Quick Look so users can hear an audio file preview, annotate a photo's preview, or manipulate a 3D file preview (rotating/scaling) for detailed examination.

- **Implement a Quick Look viewer to allow users to preview a file even if your app does not natively support it.** If your application allows users to attach or interact with files that it cannot handle, providing a Quick Look viewer lets them preview those files without needing to switch applications.
- **Evaluate implementing a Quick Look generator if your app generates proprietary file types.** A Quick Look generator allows other applications—such as Finder, Files, and Spotlight—to display previews of your documents, thereby improving their discoverability.

## Platform guidance — macOS

##### Custom file management
Users are accustomed to the familiar file browsing experience provided by Finder and most document-centric applications. Unless there is a compelling reason to deviate, utilize the standard file browser.

- **Ensure your custom file selection interface is intuitive.** For instance, users may benefit from an "open recent" option alongside the basic "open" action. You might also wish to allow users to define criteria for filtering the file browsing experience or select multiple documents simultaneously. Within a macOS open panel, you can tailor the title of the Open button to match the task—for example, if your application allows inserting file contents into the current document, you could rename the button to Insert.
- **Include a save interface enabling users to modify a file's name, format, or location.** By default, a new document is titled "Untitled" until the user assigns a custom name. Similar to the document opening interface, a save view can offer a browsing experience that defaults to a logical location, assisting users in placing the saved document where desired. If your application supports saving content across many formats, also provide users with a mechanism to select a specific file format.
- **Evaluate extending the capabilities of the Save dialog.** If it aligns with your application's functionality, you may incorporate a custom accessory view into the Save dialog containing helpful settings or options. For example, the dialog used to save Mail messages as files includes an option regarding attachment inclusion.

##### Finder Sync extensions
If your application handles both local and remote file synchronization, you can implement a Finder Sync app extension to manage and display the file synchronization status within the Finder. For detailed developer guidance, refer to [Finder Sync](apple:FinderSync).

For instance, a Finder Sync extension allows you to:

- Display indicators (badges) in the Finder regarding the sync status of specific items.
- Offer specialized contextual menu options that enable file and folder management tasks, such as favoriting or applying password protection.
- Provide custom toolbar buttons to execute global functions, like starting a synchronization process.
- **Help users prevent data loss if they disable autosaving.** Users can deactivate autosaving by toggling the “Ask to keep changes when closing documents” setting in Desktop & Dock preferences. In this scenario, your application must indicate that a document contains unsaved modifications and present a save prompt when the user chooses to close the document, quit the app, log out, or restart.
- **When autosaving is disabled, ensure users are aware when a document has unsaved changes.** To signify unsaved modifications, display a dot on the document window's close button and adjacent to the document’s name in your application’s Window menu. If autosaving is active, displaying a dot in these locations can be misleading, as it suggests the user must take action to prevent losing their work. Regardless of the autosave setting, you may append “Edited” to the document’s title in the title bar, but it is crucial to remove this suffix as soon as autosave occurs or when the user explicitly saves their work.
