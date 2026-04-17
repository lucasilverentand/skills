# Choose an idiom
When you initially build your Mac application using Mac Catalyst, Xcode defaults to the “Scale Interface to Match iPad” setting, or *iPad idiom*. This setting ensures your Mac app maintains visual consistency with the macOS display environment without needing substantial layout modifications. However, due to the iPad idiom, text and graphics may appear slightly less detailed because when using this mode, iPadOS views and text scale down to 77% in macOS. For instance, the system scales text that uses the iPadOS baseline font size of 17pt down to 13pt in macOS.

If your application feels appropriate on the Mac while using the iPad idiom, consider transitioning to the *Mac idiom*. With this setting, text and artwork render with greater detail, certain interface elements acquire a distinctly more Mac-like appearance, and graphics-heavy applications may experience enhanced performance and reduced power consumption.

You are most likely to gain advantages from the Mac idiom if your app features extensive text, intricate artwork, or animations; however, selecting this idiom also implies you must dedicate extra time to updating your Mac app's layout, text, and imagery.

- **When you adopt the Mac idiom, thoroughly audit your app’s layout, and plan to make changes to it.** To assist with this process, consider utilizing a separate asset catalog for your Mac app's assets rather than reusing the one containing your iPad app’s assets.
- **Adjust font sizes as needed.** When using the Mac idiom, text renders at its configured size (100%), which may appear excessively large without modification. Whenever possible, utilize text styles and refrain from using fixed font sizes.
- **Make sure views and images look good in the Mac version of your app.** With the Mac idiom, iPadOS views render at their full size (100%), resulting in increased visual detail. To help visualize this difference, review the two image asset depictions below. One illustration shows how the asset appears with the iPad idiom, and the other demonstrates its appearance when adopting the Mac idiom. Both depictions are zoomed in to highlight how the image renders with greater fidelity under the Mac idiom.

> **Developer note**
> When you adopt the Mac idiom, unscaled views and interface elements report differing metrics, which often necessitates a significant amount of additional development work. To minimize this overhead, avoid relying on fixed sizes for fonts, views, or layouts. For guidance, refer to [Choosing a user interface idiom for your Mac app](apple:UIKit/choosing-a-user-interface-idiom-for-your-mac-app).

**Limit your appearance customizations to standard macOS appearance customizations that are the same or similar to those available in iPadOS.** Not every appearance customization available through iPadOS controls is supported by macOS controls.
