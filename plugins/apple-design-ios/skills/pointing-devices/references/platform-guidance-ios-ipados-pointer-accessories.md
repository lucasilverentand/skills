# Pointer accessories
Pointer accessories serve as visual cues, informing users how they can utilize the pointer to interact with the active UI element. For instance, if a pointer nears an element that supports resizing, it might display small arrows indicating the direction along which scaling is possible.

Unlike pointer shapes or content effects, accessories are supplementary elements that can accompany any pointer to convey extra information. For guidance intended for developers, refer to [UIPointerAccessory](apple:UIKit/UIPointerAccessory).

- **Use clear, simple images when designing custom accessories.** Since a pointer accessory is small, it is crucial to design an image that communicates the intended pointer interaction without excessive detail.
- **Consider leveraging the accessory transition to indicate a shift in an element's state or behavior.** Besides animating the appearance and disappearance of pointer accessories, the system also animates the changes in shape and position among accessories that accompany content effects. For example, you might signal that an add action is no longer viable by transitioning the pointer accessory from the `plus` symbol to the `circle.slash` symbol.
