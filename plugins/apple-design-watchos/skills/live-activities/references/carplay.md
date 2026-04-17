# CarPlay
In CarPlay, the system automatically merges the leading and trailing components of the compact presentation into a unified layout displayed on the CarPlay Dashboard.

Since your Live Activity design must accommodate both Apple Watch and CarPlay, ensure it is optimized for both environments. Although Live Activities on the Apple Watch can include interactive features, the system disables interactivity within CarPlay. For further details, consult [watchOS](#watchOS) below. Developers seeking guidance should review [Creating custom views for Live Activities](apple:ActivityKit/creating-custom-views-for-live-activities).

- **If your Live Activity benefits from more extensive information or larger text, consider developing a custom layout.** Rather than relying on the default CarPlay appearance, declare support for a [ActivityFamily.small](apple:WidgetKit/ActivityFamily/small) supplemental activity family.
- **When including buttons or toggles in your custom layout, exercise caution.** The CarPlay system deactivates all interactive elements within a Live Activity. If users are likely to view or initiate your Live Activity while operating a vehicle, prioritize displaying current information over including buttons or toggles.
