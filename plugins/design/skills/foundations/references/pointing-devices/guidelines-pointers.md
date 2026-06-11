# Pointers
macOS provides a variety of standard pointer styles. Your application can use these to communicate the interactive state of an interface element or the result of a drag operation.

|Pointer|Name|Meaning|AppKit API|
|---|---|---|---|
|Arrow|Standard pointer for selecting and interacting with content and interface elements.|Default cursor used for selecting and interacting with content and interface components.|[arrow](apple:AppKit/NSCursor/arrow)|
|Closed hand|Dragging to reposition the display of content within a view—for example, dragging a map around in Maps.|Indicates repositioning content within a view during drag (e.g., panning a map).|[closedHand](apple:AppKit/NSCursor/closedHand)|
|Contextual menu|A contextual menu is available for the content below the pointer. This pointer is generally shown only when the Control key is pressed.|A contextual menu is available for content under the pointer; typically appears when the Control key is pressed.|[contextualMenu](apple:AppKit/NSCursor/contextualMenu)|
|Crosshair|Precise rectangular selection is possible, such as when viewing an image in Preview.|Enables precise rectangular selection (e.g., editing an image in Preview).|[crosshair](apple:AppKit/NSCursor/crosshair)|
|Disappearing item|A dragged item will disappear when dropped. If the item references an original item, the original is unaffected. For example, when dragging a mailbox out of the favorites bar in Mail, the original mailbox isn’t removed.|The dragged item vanishes upon dropping. If it references an original item, that item remains unchanged.|[disappearingItem](apple:AppKit/NSCursor/disappearingItem)|
|Drag copy|Duplicates a dragged—not moved—item when dropped into the destination. Appears when pressing the Option key during a drag operation.|Duplicates the dragged item (it is not moved) upon dropping in the destination. Activated by pressing Option during drag.|[dragCopy](apple:AppKit/NSCursor/dragCopy)|
|Drag link|During a drag and drop operation, creates an alias of the selected file when dropped. The alias points to the original file, which remains unmoved. Appears when pressing the Option and Command keys during a drag operation.|Creates an alias of the selected file upon drop during drag/drop. The original file remains untouched. Activated by pressing Option and Command during drag.|[dragLink](apple:AppKit/NSCursor/dragLink)|
|Horizontal I beam|Selection and insertion of text is possible in a horizontal layout, such as a TextEdit or Pages document.|Allows selection and insertion of text in a horizontal layout (e.g., TextEdit or Pages).|[iBeam](apple:AppKit/NSCursor/iBeam)|
|Open hand|Dragging to reposition content within a view is possible.|Indicates that content can be repositioned within the current view via dragging.|[openHand](apple:AppKit/NSCursor/openHand)|
|Operation not allowed|A dragged item can’t be dropped in the current location.|The dragged item cannot be dropped at the current location.|[operationNotAllowed](apple:AppKit/NSCursor/operationNotAllowed)|
|Pointing hand|The content beneath the pointer is a URL link to a webpage, document, or other item.|Content under the pointer is a URL link (webpage, document, etc.).|[pointingHand](apple:AppKit/NSCursor/pointingHand)|
|Resize down|Resize or move a window, view, or element downward.|Resizing or moving a window, view, or element downward.|[resizeDown](apple:AppKit/NSCursor/resizeDown)|
|Resize left|Resize or move a window, view, or element to the left.|Resizing or moving a window, view, or element to the left.|[resizeLeft](apple:AppKit/NSCursor/resizeLeft)|
|Resize left/right|Resize or move a window, view, or element to the left or right.|Resizing or moving a window, view, or element horizontally (left/right).|[resizeLeftRight](apple:AppKit/NSCursor/resizeLeftRight)|
|Resize right|Resize or move a window, view, or element to the right.|Resizing or moving a window, view, or element to the right.|[resizeRight](apple:AppKit/NSCursor/resizeRight)|
|Resize up|Resize or move a window, view, or element upward.|Resizing or moving a window, view, or element upward.|[resizeUp](apple:AppKit/NSCursor/resizeUp)|
|Resize up/down|Resize or move a window, view, or element upward or downward.|Resizing or moving a window, view, or element vertically (up/down).|[resizeUpDown](apple:AppKit/NSCursor/resizeUpDown)|
|Vertical I beam|Selection and insertion of text is possible in a vertical layout.|Allows selection and insertion of text in a vertical layout.|[iBeamCursorForVerticalLayout](apple:AppKit/NSCursor/iBeamCursorForVerticalLayout)|
