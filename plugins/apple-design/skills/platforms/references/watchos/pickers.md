# Pickers
A picker presents one or more scrollable lists containing unique values from which users can select

## Platform guidance — watchOS
Pickers present lists of items that users navigate using the Digital Crown, facilitating precise and engaging selection management.

A picker can utilize the wheels style to display a list of items. watchOS also employs this wheels style for displaying date and time pickers. For detailed developer guidance, consult [Picker](apple:SwiftUI/Picker) and [DatePicker](apple:SwiftUI/DatePicker).

You have the ability to configure a picker with an outline, caption, and scrolling indicator.

When dealing with extended lists, the navigation link renders the picker as a button. Tapping this button reveals the list of available options. Furthermore, users can scrub through these options using the Digital Crown without needing to tap the button. For guidance on this behavior, refer to [navigationLink](apple:SwiftUI/PickerStyle/navigationLink).
