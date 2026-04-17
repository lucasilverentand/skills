# Rendering modes
SF Symbols offers four rendering modes—monochrome, hierarchical, palette, and multicolor—providing flexibility when applying color to symbols. For instance, you might use varying opacities of your app's accent color to convey depth or select a spectrum of contrasting colors for symbols that match different color schemes.

To support these rendering modes, SF Symbols organizes a symbol's paths into discrete layers. For example, the `cloud.sun.rain.fill` symbol comprises three layers: the primary layer holds the cloud paths, the secondary layer contains the sun and its ray definitions, and the tertiary layer includes the raindrop paths.

The appearance a symbol achieves depends on the chosen rendering mode. For instance, Hierarchical rendering assigns a unique opacity of a single color to each layer, establishing a visual hierarchy and depth for the symbol.

To understand how rendering modes are supported in custom symbols, refer to [Custom symbols](#Custom-symbols).

SF Symbols supports the following rendering modes:

**Monochrome** — Applies a single color across all layers within a symbol. Paths render in the specified color or as a transparent shape inside a color-filled path.

**Hierarchical** — Applies one color to all layers, adjusting the color's opacity based on each layer's position in the hierarchy.

**Palette** — Applies two or more colors to a symbol, dedicating one color per layer. If only two colors are defined for a symbol with three hierarchical levels, the secondary and tertiary layers will share the same color.

**Multicolor** — Uses intrinsic colors in certain symbols to enhance their meaning. For example, the `leaf` symbol uses green to mimic physical leaves, while the `trash.slash` symbol employs red to indicate data loss. Some multicolor symbols also include layers capable of accepting other colors.

Regardless of the rendering mode, utilizing system-provided colors guarantees that symbols automatically conform to accessibility accommodations and appearance settings like vibrancy and Dark Mode. For developer guidance, consult [renderingMode(_:)](apple:swiftui/image/renderingmode(_:)).

**Ensure that a symbol's rendering mode functions correctly in every context.** Since factors like symbol size and contrast against the background can influence how well users perceive a symbol's details, different rendering modes may affect legibility. While you can use the automatic setting to determine a symbol's preferred rendering mode, it remains advisable to verify results in scenarios where an alternative rendering mode might improve clarity.
