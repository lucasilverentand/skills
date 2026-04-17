# Before you start
Many iPad applications are excellent candidates for conversion into a Mac application using Mac Catalyst. This suitability is particularly high for apps that already function effectively on iPad and incorporate crucial iPad features, such as:

- **Drag and drop.** Implementing drag and drop support in your iPad application automatically grants drag and drop functionality in the Mac version.
- **Keyboard navigation and shortcuts.** Although a physical keyboard may not always be present on an iPad, users appreciate using the keyboard for navigation and shortcuts to streamline workflows. On macOS, users expect apps to provide both keyboard navigation and shortcuts.
- **Multitasking.** Applications that successfully scale their interface to support Split View, Slide Over, and Picture in Picture establish the necessary foundation for supporting the extensive window resizability expected by Mac users.
- **Multiple windows.** By accommodating multiple scenes on iPad, you simultaneously enable support for multiple windows in the macOS iteration of your app.

While strong iPad apps provide a solid foundation for building a Mac application via Mac Catalyst, some applications depend on frameworks or features unavailable on macOS. For instance, if your experience requires capabilities like gyroscope, accelerometer, or rear camera, necessitating frameworks such as HealthKit or ARKit, or if the core function involves activities like marking, handwriting, or navigation, your app may not be suitable for Mac.

Creating a Mac version of your iPad application using Mac Catalyst automatically provides support for fundamental macOS features, including:

- Pointer interactions and keyboard focus/navigation
- Window management
- Toolbars
- Rich text interaction (including copy, paste, and contextual editing menus)
- File management
- Menu bar menus
- App-specific settings within the system Settings app

System-provided UI elements also adopt a more macOS aesthetic, such as:

- Split view
- File browser
- Activity view
- Form sheet
- Contextual actions
- Color picker

To gain a deeper understanding of the characteristics that define the Mac experience, consult **Designing for macOS**. For developer guidance, refer to [Mac Catalyst](apple:UIKit/mac-catalyst).

> **Developer note**
> To observe how views and controls adapt when you build a Mac application using Mac Catalyst, download [UIKit Catalog: Creating and customizing views and controls](apple:UIKit/uikit-catalog-creating-and-customizing-views-and-controls) and construct the macOS target.
