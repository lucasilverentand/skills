# Pointer magnetism
iPadOS enhances usability by enabling users to target elements using the pointer through a magnetic attraction effect. This sensation occurs when the pointer approaches an element or when it is flicked toward one.

When the pointer nears an element, the system begins morphing the pointer's appearance once it enters the element’s hit region. Since an element's hit area often extends beyond its visible borders, the pointer starts transforming before it visually contacts the element, creating the impression that the element is drawing the pointer in.

When a user flicks the pointer toward an element, iPadOS analyzes the pointer's path to determine the most probable target. If an element lies within the pointer's trajectory, the system employs magnetism to draw the pointer toward that element's center.

By default, iPadOS applies this magnetic behavior to elements utilizing the lift effect (such as application icons) and the highlight effect (like bar buttons), but it does not apply magnetism to elements that support hover. This exclusion is intentional because adding magnetic pull to a hover-enabled element, which does not undergo the default pointer shape transformation, could be disruptive and might make users feel they have lost control of the pointer.

Furthermore, magnetism is also applied to text input fields, aiding users by preventing them from accidentally advancing to a new line during unintended vertical movements while selecting text.
