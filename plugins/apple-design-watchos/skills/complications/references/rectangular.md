# Rectangular
Rectangular layouts accommodate full-color imagery, text, a gauge, and an optional title within a large rectangular area. Certain text fields support multicolor rendering.

The extensive rectangular region is ideal for displaying details regarding a value or process that evolves over time, as it allows ample space for information-dense charts, graphs, and diagrams. For instance, the Heart Rate complication presents a graph tracking heart-rate values over a 24-hour span. This graph employs high-contrast white and red for primary data, while using a lower-contrast gray for labels and graph lines, ensuring immediate comprehension of the data.

Beginning with watchOS 10, if you develop a rectangular layout for your watchOS application, the system may render it within the Smart Stack. You can enhance this presentation through several methods:

- Supplying background color or content that conveys information or assists in identification.
- Utilizing [intents](apple:appintents/app-intents) to define relevancy, thereby helping ensure your widget appears in the Smart Stack during times that are most relevant and useful to users.
- Developing a custom arrangement of your information specifically optimized for the Smart Stack.

For developer guidance, refer to [WidgetFamily.accessoryRectangular](apple:WidgetKit/WidgetFamily/accessoryRectangular). For further instruction on designing widgets for the Smart Stack, consult [Widgets](widgets.md).

Use the following dimensions when creating images for a rectangular layout:

|Content|40mm|41mm|44mm|45mm/49mm|
|---|---|---|---|---|
|Large image with title *|150x47 pt (300x94 px @2x)|159x50 pt (318x100 px @2x)|171x54 pt (342x108 px @2x)|178.5x56 pt (357x112 px @2x)|
|Large image without title *|162x69 pt (324x138 px @2x)|171.5x73 pt (343x146 px @2x)|184x78 pt (368x156 px @2x)|193x82 pt (386x164 px @2x)|
|Standard body|12x12 pt (24x24 px @2x)|12.5x12.5 pt (25x25 px @2x)|13.5x13.5 pt (27x27 px @2x)|14.5x14.5 pt (29x29 px @2x)|
|Text gauge|12x12 pt (24x24 px @2x)|12.5x12.5 pt (25x25 px @2x)|13.5x13.5 pt (27x27 px @2x)|14.5x14.5 pt (29x29 px @2x)|

> **Note**
> Both large-image layouts automatically incorporate a four-point corner radius.

A SwiftUI view implementing a rectangular layout defaults to the following text values:

- Style: Rounded
- Weight: Medium
- Text size: 16.5 pt (40mm), 17.5 pt (41mm), 18 pt (44mm), 19.5 pt (45mm/49mm)
