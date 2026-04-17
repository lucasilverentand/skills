# Dynamic layouts
Dynamic Top Shelf imagery manifests in several configurations:

- A carousel comprising full-screen video or images, featuring two buttons and optional supplementary details.
- A linear arrangement of interactive content.
- A series of scrolling banners.

#### Carousel actions
The Carousel Actions layout prioritizes full-screen video and images, incorporating minimal controls to enhance viewing. This presentation style is particularly effective when presenting content that the audience is already familiar with. Ideal uses include displaying user-generated media, such as photographs, or introducing new material from an established franchise or series.

**Provide a title.** Use a concise main title, such as the name of a film, television series, or photo collection. A brief subtitle may also be included if needed. For instance, a photo album might use a date range as its subtitle, while an episode could feature the show's title.

#### Carousel details
This layout builds upon the carousel actions style, offering a chance to include supplementary information about the content. For instance, you may supply metadata such as a plot summary, cast list, or other details that assist users in deciding whether to select the content.

**Provide a title that identifies the currently playing content.** The content's title is displayed near the top of the screen to ensure it is immediately readable. Furthermore, you have the option to include a brief phrase or app attribution above the title, such as “Featured on *My App*.”

#### Sectioned content row
This layout displays a single labeled row of sectioned content, making it ideal for highlighting recently viewed items, new additions, or favorites. The row content is focusable, enabling users to scroll through it quickly. When an individual piece of content gains focus, a label appears, and minor movements on the remote’s Touch surface animate the focused image. Sectioned content rows can also be configured to display multiple labels.

**Ensure sufficient content to constitute a complete row.** As a minimum requirement, load enough images in the sectioned content row to span the entire screen width. Additionally, include at least one label for enhanced platform consistency and contextual information.

The following image sizes can be utilized in a sectioned content row.

##### Poster (2:3)
|Context|Dimensions|
|---|---|
|Actual size|404x608 pt (404x608 px @1x, 808x1216 px @2x)|
|Focused/Safe zone size|380x570 pt (380x570 px @1x, 760x1140 px @2x)|
|Unfocused size|333x570 pt (333x570 px @1x, 666x1140 px @2x)|

##### Square (1:1)
|Aspect|Image Dimensions|
|---|---|
|Actual size|608x608 pt (608x608 px @1x, 1216x1216 px @2x)|
|Focused/Safe zone size|570x570 pt (570x570 px @1x, 1140x1140 px @2x)|
|Unfocused size|500x500 pt (500x500 px @1x, 1000x1000 px @2x)|

##### 16:9
|Aspect|Image size|
|---|---|
|Actual size|908x512 pt (908x512 px @1x, 1816x1024 px @2x)|
|Focused/Safe zone size|852x479 pt (852x479 px @1x, 1704x958 px @2x)|
|Unfocused size|782x440 pt (782x440 px @1x, 1564x880 px @2x)|

**Be mindful of scaling adjustments when combining different image dimensions.** If your Top Shelf design incorporates a mix of image sizes, be aware that images will automatically scale to match the height of the tallest image if required. For example, a 16:9 image may scale to 500 pixels high if placed in a row with a poster or square image.

##### Scrolling inset banner
This layout presents a sequence of expansive images, each occupying nearly the full screen width. Apple TV automatically cycles through these banners using a predefined timer until a user selects one. Once the final image is shown, the sequence loops back to the start.

When a banner gains focus, a small circular gesture on the remote’s Touch surface activates the system focus effect. This animation brings the item to life, applies lighting effects, and generates a 3D illusion if the banner utilizes layered imagery. Swiping on the Touch surface allows users to navigate to the preceding or subsequent banner in the series. This style is ideal for presenting highly engaging content, such as a popular new film.

- **Provide three to eight images.** For the scrolling banner to be most effective, a minimum of three images is advised. Using more than eight images may complicate navigation to a specific picture.
- **If you require text, integrate it into your image.** Since this layout does not display labels beneath the content, all textual information must be incorporated into the image itself. If using layered images, consider placing text on a dedicated layer above others to enhance its prominence. Additionally, include the text in the image's accessibility label so that [VoiceOver](voiceover.md) can announce it.

Use the following dimensions for a scrolling inset banner image:

|Aspect|Image size|
|---|---|
|Actual size|1940x692 pt (1940x692 px @1x, 3880x1384 px @2x)|
|Focused/Safe zone size|1740x620 pt (1740x620 px @1x, 3480x1240 px @2x)|
|Unfocused size|1740x560 pt (1740x560 px @1x, 3480x1120 px @2x)|
