# Platform guidance — tvOS
- **Be prepared for a wide range of TV sizes.** Unlike iPhone or iPad, Apple TV does not automatically adjust layouts based on screen dimensions. Instead, apps and games present the identical interface across all displays. Therefore, exercise extreme caution when designing your layout to ensure it renders well on diverse screen sizes.
- **Adhere to the screen’s safe area.** Position core content at least 60 points from the top and bottom edges, and 80 points from the sides. Placing content too close to the boundaries can hinder visibility for users, and older televisions may unintentionally crop content due to overscanning. Only allow elements that are deliberately designed to flow off-screen or appear partially visible outside this defined zone.
- **Include appropriate padding between focusable elements.** When utilizing UIKit and the focus APIs, an element increases in size when it gains focus. Account for how elements appear during this focused state and ensure they do not obscure crucial information. For guidance intended for developers, consult [About focus interactions for Apple TV](apple:UIKit/about-focus-interactions-for-apple-tv).

##### Grids
The following grid arrangements offer an optimal viewing experience. It is crucial to utilize appropriate spacing between unfocused rows and columns to prevent overlap when an item gains focus.

If you employ the UIKit collection view flow element, the number of columns in a grid is automatically determined by your content's width and spacing. For development guidance, consult [UICollectionViewFlowLayout](apple:UIKit/UICollectionViewFlowLayout).

- **Incorporate additional vertical spacing for titled rows.** Should a row feature a title, provide sufficient separation between the bottom of the preceding unfocused row and the center of the title to avoid visual crowding. Furthermore, include spacing between the bottom edge of the title and the top edge of the unfocused items in that row.
- **Maintain consistent spacing.** When content lacks uniform spacing, it ceases to resemble a grid and becomes difficult for users to scan.
- **Ensure symmetry for partially hidden content.** To effectively draw attention to the fully visible elements, keep the offscreen content that is partially visible at an equal width on each side of the screen.
