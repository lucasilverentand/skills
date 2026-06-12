# Pointer shape and content effects
iPadOS merges the visual characteristics and behavior of the pointer with the element beneath it, drawing focus to the targeted item. You have the option to support the system's default pointer behaviors or modify them to fit your application experience.

By default, the pointer defaults to a circular shape, but it can display a system-defined or custom form when positioned over specific elements or regions. For example, the pointer automatically adopts the familiar I-beam shape when hovering over a text input area.

A *content effect* allows the UI element or region beneath the pointer to change its appearance while being hovered over. Depending on the content effect used, the pointer may maintain its current shape or transition into one that integrates with the element’s new appearance.

iPadOS defines three content effects to draw attention to different types of interactive elements in your app: highlight, lift, and hover.

The *highlight* effect transforms the pointer into a translucent, rounded rectangle that serves as a background for a control and includes gentle parallax. This subtle visual change brings focus to the control without distracting users from their task. By default, iPadOS applies the highlight effect to bar buttons, tab bars, segmented controls, and edit menus.

The *lift* effect combines subtle parallax with an appearance of elevation, making an element appear to float above the screen. As the pointer fades beneath the element, iPadOS creates the illusion of lift by scaling the element up while adding a shadow below it and a soft specular highlight on top. By default, iPadOS applies the lift effect to app icons and buttons within Control Center.

*Hover* is a generic effect that allows you to apply custom scale, tint, or shadow values to an element as the pointer moves over it. The hover effect utilizes your custom values to bring focus to an item, but it does not transform the pointer's default shape.
