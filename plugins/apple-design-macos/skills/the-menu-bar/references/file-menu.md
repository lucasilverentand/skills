# File menu
The File menu provides commands that assist users in managing the files or documents supported by the application. If your app does not handle any file types, you may rename or remove this menu entirely.

The File menu typically includes the following items in this specific sequence:

|Menu item|Action|Guidance|
|---|---|---|
|New *Item*|Creates a new document, file, or window.|For *Item*, use terminology that identifies the specific type of item your application generates. For example, Calendar uses *Event* and *Calendar*.|
|Open|Allows opening the selected item or presenting an interface where users select an item to open.|If user selection requires a separate interface, an ellipsis follows the command to indicate further input is necessary.|
|Open Recent|Displays a submenu listing recently accessed documents and files, typically including a *Clear Menu* option.|List document and file names that users recognize in the submenu; do not display file paths. List documents in reverse chronological order of last access, with the most recently accessed item first.|
|Close|Closes the current window or document. Pressing Option changes Close to Close All. For a tab-based window, Close Tab replaces Close.|In a tabbed environment, consider adding a Close Window item to allow users to close the entire window with a single click or tap.|
|Close Tab|Closes the current tab in a tab-based window. Pressing Option changes Close Tab to Close Other Tabs.||
|Close File|Closes the current file and all associated windows.|Consider implementing this menu item if your application supports multiple views of the same file.|
|Save|Saves the current document or file.|Automatically save changes periodically while users are working, eliminating the need for constant selection of File > Save. For a new document, prompt users for a name and location. If the application supports saving in multiple formats, prefer using a pop-up menu that allows format selection within the Save dialog.|
|Save All|Saves all currently open documents.||
|Duplicate|Creates a copy of the current document while keeping both versions open. Pressing Option changes Duplicate to Save As.|Prefer Duplicate over menu items such as Save As, Export, Copy To, and Save To because these alternatives fail to clarify the relationship between the original file and the new copy.|
|Rename…|Allows users to change the name of the current document.||
|Move To…|Prompts users to select a new location for the document.||
|Export As…|Prompts users for a name, output destination, and export file format. After exporting the file, the current document remains open; the exported file does not automatically open.|Reserve the Export As item for situations where you must allow users to export content in a format your application does not natively handle.|
|Revert To|When autosaving is enabled, displays a submenu listing recent document versions and an option to view the version browser. Selecting a version restores it, replacing the current document.||
|Page Setup…|Opens a panel for defining printing parameters such as paper size and orientation. A document may retain the specified printing parameters.|Include the Page Setup item only if you need to support printing parameters specific to a particular document. Parameters that are global (e.g., printer name) or frequently adjusted (e.g., number of copies) belong in the Print panel.|
|Print…|Opens the standard Print dialog, enabling users to print to a physical printer, send a fax, or save as a PDF.||
