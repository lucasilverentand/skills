# Variable color
When using variable color, you can depict a characteristic that evolves over time—such as capacity or intensity—regardless of how the symbol is rendered. To visually convey this fluctuation, variable color applies hues to different layers within a symbol as a specific value traverses defined thresholds between 0 and 100 percent.

For instance, you might employ variable color with the `speaker.wave.3` symbol to indicate three distinct ranges of sound, plus the silent state, by mapping the layers representing the curved wave paths to different decibel value ranges. If there is no sound, none of the wave layers will be colored. In all other scenarios, a wave layer receives color once the sound reaches a threshold determined by the system based on the number of non-zero states you wish to represent.

Occasionally, it may be appropriate for certain layers within a symbol to remain unaffected by variable color. For example, in the aforementioned `speaker.wave.3` symbol, the layer containing the speaker path does not receive variable color because a speaker itself does not vary as sound levels change. A symbol is capable of supporting variable color across any number of its layers.

**Use variable color to communicate change — don’t use it to communicate depth.** To effectively convey visual hierarchy and depth, utilize Hierarchical rendering mode to elevate specific layers and differentiate foreground from background elements within a symbol.
