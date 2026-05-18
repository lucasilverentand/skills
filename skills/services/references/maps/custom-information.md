# Custom information
- **Use annotations that match the visual style of your app.** Annotations are used to identify specific points of interest you have added to the map. The default annotation marker features a red tint and a white pin icon. You have the ability to adjust this tint to align with your application's color scheme. Furthermore, you can change the icon to a specific string or image, such as a logo. If using an icon string, it can include any characters, including Unicode, but limiting its length to two or three characters enhances readability. For technical guidance, refer to [MKAnnotationView](apple:MapKit/MKAnnotationView).
- **If you want to display custom information that’s related to standard map features, consider making them independently selectable.** When you enable selection for map features, the system treats Apple-provided elements (including physical features, territories, and points of interest) separately from the annotations you add. You can configure custom appearances and information to represent these features when they are selected by the user. For developer guidance, see [MKMapFeatureOptions](apple:MapKit/MKMapFeatureOptions).

**Use overlays to define map areas with a specific relationship to your content.**

- *Above roads*, which is the default level, positions the overlay above roads but beneath features like buildings and trees. This setting is ideal when you want users to understand the context below the overlay while still clearly recognizing it as a defined space.
- *Above labels* places the overlay above both roads and labels, effectively obscuring everything underneath. This is beneficial for content that must be completely abstracted from the map's inherent features, or when you need to hide irrelevant parts of the map.

For developer guidance, see [Displaying overlays on a map](apple:MapKit/displaying-overlays-on-a-map) and [MKOverlayLevel](apple:MapKit/MKOverlayLevel).

**Make sure there’s enough contrast between custom controls and the map.** Insufficient contrast makes controls difficult to perceive and risks them blending into the background map. To help a custom control stand out, consider applying a thin stroke or a subtle drop shadow, or utilizing blend modes on the map area to enhance contrast with the controls placed upon it.
