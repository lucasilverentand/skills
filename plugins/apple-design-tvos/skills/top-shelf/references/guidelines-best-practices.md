# Best practices
- **Help users quickly access your content.** Top Shelf offers a direct pathway to the most relevant material. The two layout templates provided by the system—[Carousel actions](#Carousel-actions) and [Carousel details](#Carousel-details)—each include two buttons by default: a primary button to initiate playback and a More Info button to launch your app into a view displaying content specifics.
- **Feature new material.** For instance, promote recent releases or episodes, feature upcoming movies and shows, and refrain from promoting content users have already purchased, rented, or viewed.
- **Tailor the experience to individual preferences.** Since users often place their most-used apps in Top Shelf, you can customize their experience by providing targeted recommendations within the Top Shelf content. This allows users to resume media playback or return to active gameplay.
- **Minimize advertisements and pricing displays.** Users place your app in Top Shelf because they are already interested, so excessive ads from your application may be unwelcome. While displaying purchasable content in Top Shelf is acceptable, prioritize showcasing new and exciting material, and only consider showing prices when user interest is indicated.
- **Present engaging dynamic content that encourages deeper viewing.** Although static images are permissible, users generally prefer a captivating, dynamic Top Shelf experience that features the newest or highest-rated content. To achieve this visual standard, you should prefer creating [Layered images](images.md#Layered-images) for use in Top Shelf.
- **If you do not supply the recommended full-screen content, provide at least one static image as a fallback.** The system displays a static image when your app is in the Dock and focused, provided full-screen content is unavailable. tvOS applies flips and blurs to the image, ensuring it fits within a 1920-pixel width at a 16:9 aspect ratio. Use the following dimensions as guidance.

|Image size|
|---|
|2320x720 pt (2320x720 px @1x, 4640x1440 px @2x)|

**Do not suggest interactivity using a static image.** A static Top Shelf image is not focusable, and you must prevent users from believing it is interactive.
