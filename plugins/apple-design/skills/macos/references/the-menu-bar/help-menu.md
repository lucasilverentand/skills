# Help menu
The Help menu, located at the conclusion of the menu bar, provides entry to your application's help documentation. When you implement the Help Book format for this content, macOS automatically includes a search field at the top of the Help menu.

|Menu item|Action|Guidance|
|---|---|---|
|Send *YourAppName* Feedback to Apple|Opens the Feedback Assistant, allowing users to submit input.||
|*YourAppName* Help|If the content utilizes the Help Book format, it launches within the native Help Viewer.||
|*Additional Item*||Use a separator between your main help documentation and any supplementary items, such as release notes or registration details. Keep the total number of items listed in the Help menu small to prevent users from feeling overwhelmed when seeking assistance. Alternatively, you may link these additional items from within your help documentation.|

For more information on implementation, see **Offering help**; for developer instructions, refer to [NSHelpManager](apple:AppKit/NSHelpManager).
