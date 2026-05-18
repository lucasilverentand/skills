# Platform guidance — macOS
SF Pro serves as the default system font in macOS. NY is available for Mac applications built using Mac Catalyst. Note that macOS does not support Dynamic Type.

**When required, utilize dynamic system font variants to align with standard control text.** These dynamic variants ensure your text replicates the visual appearance and feel of text found in system-supplied controls. Refer to the variants below to maintain consistency with other applications on the platform.

|Dynamic font variant|API|
|---|---|
|Control content|[controlContentFont(ofSize:)](apple:AppKit/NSFont/controlContentFont(ofSize:))|
|Label|[labelFont(ofSize:)](apple:AppKit/NSFont/labelFont(ofSize:))|
|Menu|[menuFont(ofSize:)](apple:AppKit/NSFont/menuFont(ofSize:))|
|Menu bar|[menuBarFont(ofSize:)](apple:AppKit/NSFont/menuBarFont(ofSize:))|
|Message|[messageFont(ofSize:)](apple:AppKit/NSFont/messageFont(ofSize:))|
|Palette|[paletteFont(ofSize:)](apple:AppKit/NSFont/paletteFont(ofSize:))|
|Title|[titleBarFont(ofSize:)](apple:AppKit/NSFont/titleBarFont(ofSize:))|
|Tool tips|[toolTipsFont(ofSize:)](apple:AppKit/NSFont/toolTipsFont(ofSize:))|
|Document text (user)|[userFont(ofSize:)](apple:AppKit/NSFont/userFont(ofSize:))|
|Monospaced document text (user fixed pitch)|[userFixedPitchFont(ofSize:)](apple:AppKit/NSFont/userFixedPitchFont(ofSize:))|
|Bold system font|[boldSystemFont(ofSize:)](apple:AppKit/NSFont/boldSystemFont(ofSize:))|
|System font|[systemFont(ofSize:)](apple:AppKit/NSFont/systemFont(ofSize:))|
