# Location button
In iOS, iPadOS, and watchOS, Core Location provides a button that allows users to grant your application temporary authorization to access their location when needed for a specific task. The appearance of the location button can be tailored to match your app’s UI, and it must always indicate the action of location sharing in a manner that is immediately recognizable.

The first time users open your app and tap the location button, the system displays a standard alert. This alert informs users about how using the button limits your app’s access to their location and reminds them of the location indicator that appears when sharing begins.

Once users confirm they understand the button’s function, a single tap on the location button grants your app one-time permission to access their location. Although each one-time authorization expires when users stop using your app, they do not need to reconfirm their understanding of the button’s behavior.

> **Note**
> If your app lacks authorization status, tapping the location button functions identically to when a person selects *Allow Once* in the standard alert. If users previously selected *While Using the App*, tapping the location button will not alter your app’s status. For developer guidance, consult [LocationButton](apple:CoreLocationUI/LocationButton) (SwiftUI) and [CLLocationButton](apple:CoreLocationUI/CLLocationButton) (Swift).

- **Consider using the location button to provide users with a lightweight method for sharing their location for specific app features.** For instance, your application might help users attach their location to a message or post, locate a store, or identify a building, plant, or animal encountered at their location. If you observe that users frequently grant your app *Allow Once* permission, consider utilizing the location button to enable them to benefit from sharing their location without needing repeated interaction with the alert.
- **Consider customizing the location button to harmonize with your application’s visual design.** Specifically, you have the ability to:
- Select the system-provided title that best suits your feature, such as “Current Location” or “Share My Current Location.”
- Choose between the filled or outlined location glyph.
- Select a background color and a specific color for the title and glyph.
- Adjust the button’s corner radius.

To ensure users recognize and trust location buttons, you cannot customize any other visual attributes of the button. The system also maintains the legibility of a location button by warning you about issues like low-contrast color combinations or excessive translucency. In addition to resolving such problems, you are responsible for ensuring the text fits within the button—for example, the button text must fit without truncation across all accessibility text sizes and when translated into other languages.

> **Important**
> If the system detects persistent issues with your customized location button, it will withhold device location access from your app when users tap it. Although such a button may perform other application-specific actions, users might lose trust in your app if the location button does not function as expected.
