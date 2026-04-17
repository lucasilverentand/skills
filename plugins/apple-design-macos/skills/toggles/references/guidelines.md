# Toggles — full guidelines
Furthermore, all platforms support buttons that function as toggles if they visually represent distinct states. Developers seeking implementation details should refer to [ToggleStyle](apple:SwiftUI/ToggleStyle).

### Best practices
- **Use a toggle when users need to select between two mutually exclusive values that control the state of content or a view.** Since a toggle always allows users to manage a specific state, if the action involves choosing from a list of options, use a different component, such as [Pop-up buttons](pop-up-buttons.md).
- **Clearly indicate the setting, view, or content that the toggle controls.** Generally, the surrounding context provides sufficient information for users to understand what they are activating or deactivating. In certain scenarios, particularly within macOS applications, you may also provide a label describing the toggle's controlled state. If you employ a button that functions as a toggle, typically use an interface icon to convey its purpose and update its appearance—often by altering the background—to reflect the current state.
- **Ensure that the visual distinctions between a toggle's states are immediately apparent.** For instance, you could add or remove a color fill, display or conceal the background shape, or modify internal details like a checkmark or dot to indicate whether the toggle is active or inactive. Do not rely exclusively on color differences to communicate state, as not all users perceive color equally.

## Platform guidance — macOS
Besides the switch toggle style, macOS also supports checkboxes and radio buttons that offer comparable behaviors.

**Place switches, checkboxes, and radio buttons within the window's main body, not its frame.** Specifically, these controls must be avoided in a toolbar or status bar.

##### Switches
- **Prioritize a switch for settings that require emphasis.** Because a switch carries more visual weight than a checkbox, it is better suited when controlling functionality that exceeds the scope of a typical checkbox. For instance, you may employ a switch to allow users to enable or disable an entire collection of settings, rather than just one specific setting. For developer guidance, refer to [switch](apple:SwiftUI/ToggleStyle/switch).
- **When within a grouped form, consider utilizing a mini switch to manage the setting on a single row.** The height of a mini switch aligns with that of buttons and other controls, ensuring rows maintain consistent vertical sizing. If you must present a hierarchy of settings within a grouped form, use a standard switch for the primary setting and mini switches for subordinate controls. For developer guidance, see [GroupedFormStyle](apple:SwiftUI/GroupedFormStyle) and [ControlSize](apple:SwiftUI/ControlSize).
- **Generally, do not substitute a checkbox with a switch.** If your interface currently employs checkboxes, it is usually recommended to maintain their usage.

##### Checkboxes
A checkbox is a small, square control that indicates its state: empty when inactive, checked when active, and containing a dash when in a mixed or indeterminate state. Typically, it includes a title positioned after the control. In an editable checklist scenario, a checkbox may appear without any associated title or additional content.

- **Use checkboxes instead of switches when you must convey a hierarchy of settings.** The visual consistency of checkboxes aids in alignment and communicates grouping. By utilizing indentation and aligning along the leading edge, you can effectively demonstrate dependencies, such as when one checkbox's state controls the states of subordinate checkboxes.
- **Consider radio buttons if you need to present a selection from more than two options that are mutually exclusive.** When users must select an option beyond a simple "on" or "off," employing multiple radio buttons helps clarify each choice with its own unique label.
- **If the relationship between a group of checkboxes is ambiguous, consider using a label to introduce them.** Describe the collection of options and align the label's baseline with the initial checkbox in the group.
- **Ensure the checkbox's visual appearance accurately reflects its current state.** A checkbox can be on, off, or mixed. If you use a single checkbox to globally enable or disable multiple subordinate checkboxes, display a mixed state when those subordinates hold differing states. For instance, if you have a text-style setting that controls all styles but also allows users to select individual style attributes like bold, italic, or underline, this scenario requires careful state management. For guidance intended for developers, consult [allowsMixedState](apple:AppKit/NSButton/allowsMixedState).

##### Radio buttons
A radio button consists of a small, circular control followed by its corresponding label. Typically displayed in groups ranging from two to five items, radio buttons are used to present a selection where choices are mutually exclusive.

A radio button exists in one of two states: selected (indicated by a filled circle) or deselected (an empty circle). While radio buttons can also display a mixed state (represented by a dash), this condition is seldom beneficial, as multiple states can be conveyed using additional radio buttons. If you must indicate that a setting or item has a mixed state, consider utilizing a checkbox instead.

- **Prefer a set of radio buttons to present mutually exclusive options.** If users must select multiple choices from a group, use checkboxes.
- **Avoid listing too many radio buttons in a set.** A lengthy list of radio buttons consumes significant screen real estate and can overwhelm the user. If you need to offer more than approximately five options, consider implementing a component such as [Pop-up buttons](pop-up-buttons.md).
- **To present a single setting that can be on or off, prefer a checkbox.** Although a radio button can also handle binary on/off states, the presence or absence of a checkmark in a checkbox allows users to grasp the current state instantly. In rare instances where a single checkbox fails to clearly communicate opposing states, you may use a pair of radio buttons, each labeled to specify the state it controls.
- **Use consistent spacing when you display radio buttons horizontally.** Determine the width required to fit the longest button label and apply that measurement uniformly.
