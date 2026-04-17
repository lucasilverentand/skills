# Anatomy
Live Activities are visible across different system areas, including the *Dynamic Island* and the Lock Screen. They function as a centralized hub for alerts and indicators regarding current activity. Based on the device and system location where a Live Activity is displayed, the operating system selects a specific *presentation* style or a combination of styles to define its appearance. Consequently, your Live Activity must support:

- [Compact](#Compact)
- [Minimal](#Minimal)
- [Expanded](#Expanded)
- [Lock Screen](#Lock-Screen)

In iOS and iPadOS, these presentations are used throughout the system where your Live Activity appears. Furthermore, the system utilizes them to establish default views for other contexts. For instance, the compact presentation appears in the Dynamic Island on iPhone and comprises two elements that the system merges into one view for Apple Watch and CarPlay.

#### Compact
The Dynamic Island utilizes the compact presentation when only a single Live Activity is running. This display consists of two separate components: one positioned on the leading side of the TrueDepth camera and one on the trailing side. Despite its restricted space, the compact presentation conveys current information about your app’s Live Activity.

For design guidance, see [Compact presentation](#Compact-presentation).

#### Minimal
When multiple Live Activities are active, the system utilizes the minimal presentation to display two of them in the Dynamic Island. One activity appears attached, while the other appears detached. The detached minimal presentation takes on a circular or oval shape based on its content size. As with the compact presentation, users can tap this minimal view to open the application or touch and hold it to access the expanded presentation.

For design guidance, see [Minimal presentation](#Minimal-presentation).

#### Expanded
If a user presses and holds a Live Activity presented in compact or minimal view, the system will transition to the expanded presentation.

For design guidance regarding this feature, consult [Expanded presentation](#Expanded-presentation).

#### Lock Screen
The system employs the Lock Screen presentation to display a banner positioned at the bottom of the Lock Screen. When utilizing this presentation, adopt a layout comparable to the expanded view.

For devices that do not support Dynamic Island, the Lock Screen presentation functions as a banner that temporarily overlays the Home Screen or other applications when notifying users of Live Activity updates.

For design guidance, consult [Lock Screen presentation](#Lock-Screen-presentation).

#### StandBy
When an iPhone is in StandBy mode, your Live Activity appears using the minimal presentation. Tapping this display transitions it to the Lock Screen presentation, which is scaled up 2x to fill the screen. If your Lock Screen presentation features a custom background color, the system automatically extends it across the entire screen for a seamless, full-screen display.

For design guidance, consult [StandBy presentation](#StandBy-presentation).
