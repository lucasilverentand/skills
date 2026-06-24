# Sidebars
A sidebar is a view element that appears on the leading edge of a screen, enabling users to move between different sections within your application or game

## Platform guidance — macOS
The dimensions of a sidebar's rows, text, and glyphs are contingent upon its overall size (small, medium, or large). While you can define this sizing programmatically, users also have the option to adjust it by selecting a different sidebar icon size within General settings.

- **Avoid stylizing your app by specifying a fixed color for all sidebar icons.** By default, these icons utilize the current **accent color**, and users anticipate seeing their selected accent color consistently across all applications. Although a static color may aid in clarifying an icon's function, ensure that the majority of sidebar icons reflect the user's chosen color scheme.
- **Consider automatically hiding and revealing a sidebar when its container window resizes.** For instance, shrinking the size of a Mail viewer window could automatically collapse its sidebar, thereby freeing up more screen real estate for the message content.
- **Avoid putting critical information or actions at the bottom of a sidebar.** Users frequently reposition windows in ways that obscure their lower edge.
