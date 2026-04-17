# Custom symbols
If SF Symbols lacks a required symbol, you have the option to develop your own. To begin creating a custom symbol, first export the template of a design similar to your desired outcome, and then use vector editing software to modify it. For developer guidance on this process, consult [Creating custom symbol images for your app](apple:UIKit/creating-custom-symbol-images-for-your-app).

> **Important**
> SF Symbols contains copyrighted symbols that depict Apple products and features. While you may display these specific symbols in your application, customization is prohibited. To help identify a symbol that cannot be customized, the SF Symbols app applies an Info icon badge; furthermore, the inspector pane details its usage limitations to ensure correct implementation.

By employing a process called *annotating*, you can assign a specific color or a defined hierarchical level (such as primary, secondary, or tertiary) to each layer within a custom symbol. Depending on the rendering modes your app supports, you can utilize a different mode for each instance of that symbol.

**Use the template as your reference.** Develop a custom symbol that matches the system-provided symbols in terms of optical weight, alignment, perspective, and level of detail. Your goal should be to design a symbol that is:

- Simple
- Easily recognizable
- Inclusive
- Directly correlated with the action or content it represents

For further guidance, refer to **Icons**.

- **Apply negative side margins to your custom symbol if needed.** SF Symbols supports the use of negative side margins to assist with optical horizontal alignment when a symbol incorporates a badge or other elements that increase its overall width. For instance, negative side margins can help horizontally align a stack of folder symbols, some of which include a badge. Since the name of each margin includes the relevant configuration (e.g., “left-margin-Regular-M”), ensure you follow this naming convention if margins are added to your custom symbols.
- **Optimize layers when using animations with custom symbols.** If you intend to animate your symbol by layer, ensure those layers are annotated within the SF Symbols application. The `Z-order` dictates the sequence in which colors should be applied to a variable color symbol's layers, and you can select whether these changes animate from front-to-back or back-to-front. You also have the option to animate entire layer groups, causing related layers to move together.
- **Test animations thoroughly for custom symbols.** It is crucial to test your custom symbols using all animation presets because the shapes and paths may not behave as anticipated when layers are in motion. To maximize this feature, consider designing your custom symbols using complete shapes. For example, a custom symbol similar to `person.2.fill` does not require creating a cutout for the shape representing the person on the left. Instead, you can draw the full shape of the person, and additionally, draw an offset path for the person on the right to represent the gap between them. You can subsequently annotate this offset path as an erase layer to render the symbol as desired. This drawing methodology helps preserve additional layer information, allowing animations to execute as expected.
- **Avoid creating custom symbols that include common variants, such as enclosures or badges.** The SF Symbols app provides a component library specifically for generating variations of your custom symbol. Utilizing this component library enables you to create frequently used variants while maintaining design consistency with the included SF Symbols.
- **Provide alternative text labels for custom symbols.** Alternative text labels, also known as accessibility descriptions, allow VoiceOver to describe visible UI and content, thereby simplifying navigation for users with visual impairments. For guidance on this feature, see **VoiceOver**.
- **Do not reproduce Apple products.** Apple products are protected by copyright, and reproducing them in your custom symbols is prohibited. Furthermore, you cannot customize a symbol that SF Symbols has identified as representing an Apple feature or product.
