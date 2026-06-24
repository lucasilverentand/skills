# Standard icons
To depict standard actions using icons within **Menus**, **Toolbars**, **Buttons**, or other interface elements across Apple platforms, you should utilize **SF Symbols**.

#### Editing
|Action|Icon|Symbol name|
|---|---|---|
|Cut||`scissors`|
|Copy||`document.on.document`|
|Paste||`document.on.clipboard`|
|Done||`checkmark `|
|Save|||
|Cancel||`xmark`|
|Close|||
|Delete||`trash`|
|Undo||`arrow.uturn.backward`|
|Redo||`arrow.uturn.forward`|
|Compose||`square.and.pencil`|
|Duplicate||`plus.square.on.square`|
|Rename||`pencil`|
|Move to||`folder`|
|Folder|||
|Attach||`paperclip`|
|Add||`plus`|
|More||`ellipsis`|

#### Selection
|Action|Icon|Symbol name|
|---|---|---|
|Select||`checkmark.circle`|
|Deselect||`xmark`|
|Close|||
|Delete||`trash`|

#### Text formatting
|Action|Icon|Identifier|
|---|---|---|
|Superscript||`textformat.superscript`|
|Subscript||`textformat.subscript`|
|Bold||`bold`|
|Italic||`italic`|
|Underline||`underline`|
|Align Left||`text.alignleft`|
|Center||`text.aligncenter`|
|Justified||`text.justify`|
|Align Right||`text.alignright`|

#### Search
|Action|Icon|Symbol name|
|---|---|---|
|Search||`magnifyingglass`|
|Find||`text.page.badge.magnifyingglass`|
|Find and Replace|||
|Find Next|||
|Find Previous|||
|Use Selection for Find|||
|Filter||`line.3.horizontal.decrease`|

#### Sharing and exporting
|Action|Icon|Symbol name|
|---|---|---|
|Share||`square.and.arrow.up`|
|Export|||
|Print||`printer`|

#### Users and accounts
|Action|Icon|Symbol name|
|---|---|---|
|Account||`person.crop.circle`|
|User|||
|Profile|||

#### Ratings
|Action|Icon|Symbol name|
|---|---|---|
|Dislike||`hand.thumbsdown`|
|Like||`hand.thumbsup`|

#### Layer ordering
|Action|Icon|Symbol Name|
|---|---|---|
|Bring to Front||`square.3.layers.3d.top.filled`|
|Send to Back||`square.3.layers.3d.bottom.filled`|
|Bring Forward||`square.2.layers.3d.top.filled`|
|Send Backward||`square.2.layers.3d.bottom.filled`|

#### Other
|Action|Icon|Symbol name|
|---|---|---|
|Alarm||`alarm`|
|Archive||`archivebox`|
|Calendar||`calendar`|

## Platform guidance — macOS

##### Document icons
If your macOS application supports a custom document type, you can create a corresponding document icon to represent it. Traditionally, a document icon resembles a sheet of paper with the top-right corner folded down. This characteristic appearance aids users in differentiating documents from applications and other content, especially when the icon is viewed at small sizes.

If you do not provide a document icon for a file type your application supports, macOS automatically generates one by combining your app's icon with the file extension. For instance, Preview uses a system-generated document icon to represent JPG files.

In certain scenarios, providing a series of document icons can be beneficial for representing the different file types your application handles. For example, Xcode utilizes custom document icons to help users distinguish between projects, AR objects, and Swift code files.

To construct a custom document icon, you may supply any combination of background fill, center image, and text. The system manages the layering, positioning, and masking of these elements to composite them onto the standard folded-corner icon shape.

[Apple Design Resources](https://developer.apple.com/design/resources/#macos-apps) offers a template you can use to design custom background fills and center images for a document icon. When using this template, adhere to the following guidelines.

- **Design simple images that clearly communicate the document type.** Regardless of whether you use a background fill, a center image, or both, favor uncomplicated shapes and a limited palette of distinct colors. Since your document icon may appear as small as 16x16 px, designs must remain recognizable across all scales.
- **Designing a single, expressive image for the background fill can be an effective way to help users understand and identify a document type.** For example, both Xcode and TextEdit employ rich background images without including a center image.
- **Consider reducing complexity in the smaller versions of your document icon.** Details that are clear in large formats may appear blurry and difficult to discern in small versions. For example, if you want the grid lines in a custom heart document icon to remain clear at intermediate sizes, use fewer and thicken them by aligning them to the reduced pixel grid. In the 16x16 px size, you might omit the lines entirely.
- **Avoid placing critical content in the top-right corner of your background fill.** The system automatically masks your image to fit the document icon shape and overlays the white folded corner onto the fill. Create a set of background images in the following sizes:
- 512x512 px @1x, 1024x1024 px @2x
- 256x256 px @1x, 512x512 px @2x
- 128x128 px @1x, 256x256 px @2x
- 32x32 px @1x, 64x64 px @2x
- 16x16 px @1x, 32x32 px @2x

**If a familiar object can convey the document’s type or its relationship with your application, consider creating a center image that depicts it.** Design a simple, unambiguous image that is clear and recognizable at every scale. The center image occupies half the size of the overall document icon canvas. For instance, to create a center image for a 32x32 px document icon, use an image canvas measuring 16x16 px. You can supply center images in the following sizes:

- 256x256 px @1x, 512x512 px @2x
- 128x128 px @1x, 256x256 px @2x
- 32x32 px @1x, 64x64 px @2x
- 16x16 px @1x, 32x32 px @2x
- **Define a margin that measures approximately 10% of the image canvas and keep most of the image within it.** Although parts of the image may extend into this margin for optical alignment, it is optimal if the image occupies about 80% of the canvas. For example, most of a center image on a 256x256 px canvas would fit within an area measuring 205x205 px.
- **Specify a succinct term if it aids user understanding of your document type.** By default, the system displays the document’s extension along the bottom edge of the icon; however, if the extension is unfamiliar, you may provide a more descriptive term. For example, the document icon for a SceneKit scene file uses the term *scene* instead of the file extension *scn*. The system automatically scales the extension text to fit within the document icon, so ensure you use a term short enough to be legible at small sizes. By default, the system capitalizes all letters in the text.
