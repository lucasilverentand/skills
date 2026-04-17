# Edit menu
The Edit menu allows users to modify content within the active document or text container and provides commands for managing the Clipboard. Since many editing actions are universally applicable to any editable content, the Edit menu remains valuable even in applications that are not document-based.

**Determine whether Find menu items belong in the Edit menu.** For instance, if your application supports searching for files or other types of objects, Find menu items might be better suited in the File menu.

The Edit menu typically includes the following top-level items, presented in this specific sequence.

|Menu item|Action|Guidance|
|---|---|---|
|Undo|Reverses the previous user operation.|Specify the target of the undo. For example, if users merely selected a menu item, append the item’s title, such as Undo Paste and Match Style. For text entry operations, you may append the word *Typing* to provide Undo Typing.|
|Redo|Reverses the previous Undo operation.|Specify the target of the redo. For example, if users reversed a menu item selection, append the item’s title, such as Redo Paste and Match Style. For text entry operations, you may append the word *Typing* to provide Redo Typing.|
|Cut|Removes selected data and places it on the Clipboard, overwriting its previous contents.||
|Copy|Duplicates selected data and places it on the Clipboard.||
|Paste|Inserts the Clipboard contents at the current insertion point. The Clipboard contents are unaffected, allowing users to Paste multiple times.||
|Paste and Match Style|Inserts the Clipboard contents at the current insertion point, adjusting the inserted text's style to match the surrounding content.||
|Delete|Removes selected data without placing it on the Clipboard.|Use a Delete menu item instead of Erase or Clear. Since choosing Delete is equivalent to pressing the Delete key, consistent naming is crucial.|
|Select All|Highlights all selectable content in the current document or text container.||
|Find|Displays a submenu with search operations for the current document or text container. Standard submenus include: Find, Find and Replace, Find Next, Find Previous, Use Selection for Find, and Jump to Selection.||
|Spelling and Grammar|Displays a submenu with options for checking and correcting spelling and grammar in the current document or text container. Standard submenus include: Show Spelling and Grammar, Check Document Now, Check Spelling While Typing, Check Grammar With Spelling, and Correct Spelling Automatically.||
|Substitutions|Displays a submenu with items allowing users to toggle automatic substitutions while typing in a document or text container. Standard submenus include: Show Substitutions, Smart Copy/Paste, Smart Quotes, Smart Dashes, Smart Links, Data Detectors, and Text Replacement.||
|Transformations|Displays a submenu with options to modify selected text. Standard submenus include: Make Uppercase, Make Lowercase, and Capitalize.||
|Speech|Displays a submenu with Start Speaking and Stop Speaking items that control when the system audibly reads selected text.||
|Start Dictation|Opens the dictation window and converts spoken words into text added at the current insertion point. The system automatically places the Start Dictation menu item at the bottom of the Edit menu.|
|Emoji & Symbols|Displays a Character Viewer, allowing users to insert emoji, symbols, and other characters at the current insertion point. The system automatically places the Emoji & Symbols menu item at the bottom of the Edit menu.|
