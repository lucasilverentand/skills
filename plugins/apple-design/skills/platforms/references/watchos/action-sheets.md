# Action sheets
An action sheet serves as a modal view that displays options pertaining to an action the user has started

## Platform guidance — watchOS
The system-defined style for action sheets comprises a title, an optional accompanying message, a Cancel button, and one or more supplementary buttons. The visual presentation of this interface differs based on the device being used.

Each button possesses an associated style that communicates information regarding its function. There are three predefined system styles for buttons:

|Style|Meaning|
|---|---|
|Default|The button carries no specific connotation.|
|Destructive|The button triggers the deletion of user data or executes a destructive operation within the application.|
|Cancel|The button dismisses the view without performing any action.|

**Do not display more than four buttons within an action sheet, including the Cancel button.** When fewer options are visible on screen, users can easily view all available choices simultaneously. Given that the Cancel button is mandatory, aim to offer no more than three additional options.
