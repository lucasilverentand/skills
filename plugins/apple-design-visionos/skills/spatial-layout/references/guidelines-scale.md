# Scale
visionOS utilizes two scaling modes to maintain the illusion of depth while optimizing user interaction.

*Dynamic scale* allows content to remain comfortably legible and interactive regardless of its distance from the viewer. Specifically, visionOS automatically adjusts a window's scale based on its proximity to the wearer: it increases when moving away and decreases when approaching, simulating a constant perceived size across all viewing distances.

*Fixed scale* dictates that an object maintains its identical scale irrespective of the viewer's proximity. A fixed-scale item appears smaller as it recedes from the observer along the z-axis, mirroring how physical objects appear when viewed from afar versus up close.

To support dynamic scaling and achieve a sense of depth, visionOS defines a point as an angle, contrasting with other platforms that define a point by the number of pixels it occupies on a 2D display, which varies depending on the [Resolution](images.md#Resolution).

**Consider using fixed scale when you wish a virtual object to precisely mimic its physical counterpart.** For instance, if you aim to preserve the life-size scale of a product offering, fixed scale helps achieve greater realism for viewers in their own environment. Since interactive content requires scaling to maintain usability as it approaches or moves away, fixed scale should be applied cautiously, reserved primarily for noninteractive elements that require it.
