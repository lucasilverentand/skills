# Animations
SF Symbols offers a collection of expressive, configurable animations that enhance your interface and bring vitality to your application. These symbol animations assist in conveying ideas, providing feedback regarding user actions, and signaling status changes or ongoing processes.

Animations apply to all SF Symbols within the library, across all rendering modes, weights, and scales, as well as to custom symbols. For details regarding animating custom symbols, refer to [Custom symbols](#Custom-symbols). You can manage the playback of an animation—whether it runs completely or repeats indefinitely until a condition is met. You also have the ability to customize behaviors, such as adjusting playback speed or determining if the animation should reverse before repeating. For developer guidance, consult [Symbols](apple:Symbols) and [SymbolEffect](apple:Symbols/SymbolEffect).

**Appear** — Causes a symbol to gradually become visible.

**Disappear** — Causes a symbol to gradually fade out of view.

**Bounce** — Briefly scales the symbol using an elastic movement (up or down) and then returns it to its original state. By default, the bounce animation plays once and can effectively communicate that an action has occurred or requires execution.

**Scale** — Alters the size of a symbol, either increasing or decreasing its scale. Unlike the bounce animation, which resets the symbol, the scale animation remains active until a new scale is applied or the effect is removed. You might employ the scale animation to draw attention to a selected element or provide feedback when a symbol is chosen.

**Pulse** — Modulates the opacity of a symbol over time. This animation automatically pulses only those layers within a symbol designated to pulse, or it can apply pulsing across all layers. You might use the pulse animation to indicate ongoing activity, allowing it to run continuously until a condition is met.

**Variable color** — Gradually changes the opacity of layers within a symbol. This animation can be cumulative or iterative. When cumulative, color shifts persist for each layer until the animation cycle finishes. When iterative, color changes occur sequentially, one layer at a time. You might use variable color to indicate progress or ongoing activity, such as playback, connection status, or broadcasting. You can configure this animation to autoreverse—meaning it reverses back to the starting point and replays the sequence—or hide inactive layers instead of merely reducing their opacity.

The arrangement of layers within a symbol dictates how variable color behaves during a repeating animation. Symbols with linearly arranged layers where the starting and ending points do not connect are designated as *open loop*. Symbols whose layers form a complete shape where the start and end points meet, such as in a circular progress indicator, are designated as *closed loop*. Variable color animations for symbols with closed loop designs feature continuous and seamless playback.

**Replace** — Swaps one symbol for another. The replace animation functions between any two symbols, regardless of their weights or rendering modes. This animation offers three configurations:

- Down-up, where the outgoing symbol shrinks while the incoming symbol grows, signaling a state transition.
- Up-up, where both the outgoing and incoming symbols grow. This configuration conveys a state change that implies forward progression.
- Off-up, where the outgoing symbol hides immediately and the incoming symbol scales up. This configuration communicates a state change that highlights the next available or required action/state.

**Magic Replace** — Executes a smart transition between two symbols that share related shapes. For instance, slashes can appear and disappear, badges can emerge or vanish, or they can be replaced independently of the base symbol. Magic Replace is the new default replace animation, but it only occurs between related symbols; otherwise, the default down-up animation is used. You have the option to select a custom fallback direction if you prefer something other than the default in these scenarios.

**Wiggle** — Causes the symbol to oscillate back and forth along a directional axis. You might use the wiggle animation to draw attention to a change or a call to action that users might otherwise miss. Wiggle can also add dynamic emphasis to an interaction or reinforce the symbol's meaning, such as when an arrow indicates a specific direction.

**Breathe** — Smoothly increases and decreases the presence of a symbol, giving it a dynamic, alive quality. You might use the breathe animation to convey status shifts or signal that an activity is underway, such as an active recording session. Breathe is similar to pulse; however, pulse animates solely by changing opacity, whereas breathe modifies both opacity and size to convey ongoing activity.

**Rotate** — Spins the symbol to serve as a visual indicator or mimic real-world object behavior. For example, rotation confirms that a task is in progress and functioning as expected. The rotate animation causes some symbols to spin entirely, while others only rotate specific components. Symbols like the desk fan, for instance, utilize the By Layer rotation option to spin only the blades.

**Draw On / Draw Off** — In SF Symbols 7 and later, this feature draws the symbol along a path defined by guide points, either appearing from offscreen (Draw On) or receding into offscreen view (Draw Off). You can animate all layers simultaneously, stagger them, or draw each layer individually. You might use the draw animation to convey progress, such as a download sequence, or to reinforce the symbol's meaning, like a directional arrow.

- **Apply symbol animations judiciously.** Although there is no limit to the number of animations you can apply to a view, excessive animation can overwhelm an interface and distract users.
- **Ensure that animations serve a clear purpose in communicating the symbol’s intent.** Each animation type has a distinct movement that communicates a specific action or elicits a particular response. Consider how users might interpret an animated symbol and whether the animation, or combination of animations, could lead to confusion.
- **Utilize symbol animations to communicate information more efficiently.** Animations provide visual feedback, reinforcing that an action has taken place within your interface. You can use animations to present complex information simply and without consuming significant visual space.
- **Consider your app’s tone when adding animations.** When animating a symbol, reflect on what the animation conveys and how that aligns with your brand identity and the app's overall style and tone. For guidance, see [Branding](branding.md).
