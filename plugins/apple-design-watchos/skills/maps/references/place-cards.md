# Place cards
Place cards allow you to present comprehensive location data within your application or website. This information, which may include operating hours, contact numbers, and physical addresses, enables you to supply structured and current details for specific places, thereby adding depth to search outcomes.

#### Displaying place cards in a map
A place card can appear directly within your map whenever a user selects a location. This feature is ideal for providing detailed information in maps that contain multiple specified locations, such as a map tracking the different bookstores an author plans to visit during a book signing tour. For guidance on implementation, refer to [mapItemDetailSelectionAccessory(_:)](apple:MapKit/MapContent/mapItemDetailSelectionAccessory(_:)), [mapView(_:selectionAccessoryFor:)](apple:MapKit/MKMapViewDelegate/mapView(_:selectionAccessoryFor:)), and [selectionAccessory](apple:MapKitJS/Annotation/selectionAccessory).

You can also utilize place cards for other map elements, including points of interest, territories, and physical features, to offer users valuable context about nearby locations. For developer documentation, consult [mapFeatureSelectionAccessory(_:)](apple:SwiftUI/View/mapFeatureSelectionAccessory(_:)), [mapView(_:selectionAccessoryFor:)](apple:MapKit/MKMapViewDelegate/mapView(_:selectionAccessoryFor:)), and [selectableMapFeatureSelectionAccessory](apple:MapKitJS/Map/selectableMapFeatureSelectionAccessory).

> **Developer note**
> When implementing on websites, you can embed a custom map that defaults to displaying a place card for a single specified location. For implementation details, see [Displaying place information using the Maps Embed API](apple:MapKitJS/displaying-place-information-using-the-maps-embed-api).

The system defines several styles for place cards, each specifying the size, appearance, and information displayed.

- The *automatic* style allows the system to determine the appropriate place card appearance based on your map view's dimensions.
- The *callout* style presents the place card in a popover adjacent to the selected location. You have options to further define this callout style: the *full* callout displays a large, comprehensive card, and the *compact* callout provides a concise, space-efficient view. If no specific callout style is defined, the system defaults to *automatic* callout, which selects the style based on your map's viewing dimensions.
- The *caption* style displays a link labeled “Open in Apple Maps.”
- The *sheet* style presents the place card within a [sheet](sheets.md).

For implementation guidance, see [MapItemDetailSelectionAccessoryStyle](apple:MapKit/MapItemDetailSelectionAccessoryStyle), [MKSelectionAccessory.MapItemDetailPresentationStyle](apple:MapKit/MKSelectionAccessory/MapItemDetailPresentationStyle), and [PlaceSelectionAccessoryStyle](apple:MapKitJS/PlaceSelectionAccessoryStyle).

Full callout style place cards render differently depending on the user's device. The system displays the full callout style card as a popover in iPadOS and macOS, but presents it as a [sheet](sheets.md) on iOS.

- **Consider your map presentation when choosing a style.** While the full callout style provides users with the richest experience and the most detailed information about a location, you must select a place card style that fits the context of your map. For instance, if your application features a small map with numerous annotations, consider using the compact callout style to save space while still providing location details and maintaining context regarding other mapped locations.
- **Make sure your place card looks great on different devices and window sizes.** If you choose to define a specific style, ensure that the content within your place card remains visible across different devices and as window sizes change. For full callout style cards, you can set a minimum width to prevent text overflow on smaller devices.
- **Avoid duplicating information.** When selecting a place card style, consider what details are already present in your app or website. For example, if the full callout style card displays information that your application already shows, the compact callout or caption styles might serve as a better complement.
- **Keep the location on your map visible when displaying a place card.** This helps users maintain awareness of where the location is on your map while viewing detailed information. You can configure an offset distance for your place card and point it toward the selected location. For developer guidance, see [offset(_:)](apple:SwiftUI/View/offset(_:)), [accessoryOffset](apple:MapKit/MKAnnotationView/accessoryOffset), and [selectionAccessoryOffset](apple:MapKitJS/Annotation/selectionAccessoryOffset).

#### Adding place cards outside of a map
You have the option to present location information outside of a map within your application or website. For instance, if you are showing search results or a store locator, you might prefer to display a list of locations rather than a map, presenting a place card when a user selects an item. For guidance intended for developers, consult [mapItemDetailSelectionAccessory(_:)](apple:MapKit/MapContent/mapItemDetailSelectionAccessory(_:)), [mapItemDetail(_:)](apple:MapKit/MKSelectionAccessory/mapItemDetail(_:)), and [PlaceDetail](apple:MapKitJS/PlaceDetail).

> **Important**
> If the place card is not displayed directly within a map view, it must contain a map. Refer to [mapItemDetailSheet(item:displaysMap:)](apple:SwiftUI/View/mapItemDetailSheet(item:displaysMap:)) and [init(mapItem:displaysMap:)](apple:MapKit/MKMapItemDetailViewController/init(mapItem:displaysMap:)) for developer instructions.

**Use cues related to location in the surrounding content to signal that users can open a place card.** For example, displaying addresses and place names alongside a button for further details helps indicate that interaction will yield location information. For designs requiring less screen space, including a map pin icon along with the place name communicates that a place card can be accessed.
