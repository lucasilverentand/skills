# Circular
Circular layouts, including text, gauges, and full-color imagery within the circular areas of the Infograph and Infograph Modular watch faces, are supported. This circular family also defines extra-large layouts for displaying content on the X-Large watch face.

Text can be added alongside a standard-sized circular image, utilizing a design that curves the text along the bezel of certain watch faces, such as Infograph. This text has the capacity to occupy almost 180 degrees of the bezel before it is truncated.

When designing images for a standard-size circular complication, consult the following dimensions:

|Image|40mm|41mm|44mm|45mm/49mm|
|---|---|---|---|---|
|Image|42x42 pt (84x84 px @2x)|44.5x44.5 pt (89x89 px @2x)|47x47 pt (94x94 px @2x)|50x50 pt (100x100 px @2x)|
|Closed gauge|27x27 pt (54x54 px @2x)|28.5x28.5 pt (57x57 px @2x)|31x31 pt (62x62 px @2x)|32x32 pt (64x64 px @2x)|
|Open gauge|11x11 pt (22x22 px @2x)|11.5x11.5 pt (23x23 px @2x)|12x12 pt (24x24 px @2x)|13x13 pt (26x26 px @2x)|
|Stack (not text)|28x14 pt (56x28 px @2x)|29.5x15 pt (59X30 px @2x)|31x16 pt (62x32px @ 2x)|33.5x16.5 pt (67x33 px @2x)|

> **Note**
> The system applies a circular mask to each image.

A SwiftUI view implementing a standard-size circular complication uses these default text values:

- Style: Rounded
- Weight: Medium
- Text size: 12 pt (40mm), 12.5 pt (41mm), 13 pt (44mm), 14.5 pt (45mm/49mm)

If you intend to design an oversized display of critical information for the X-Large watch face—for example, the Contacts complication which includes a contact photo—utilize the extra-large versions of the circular family layouts. These layouts allow you to present full-color images, text, and gauges within a large circular area that occupies most of the X-Large watch face. Some text fields also support multicolor displays.

Refer to these values when creating images for an extra-large circular complication:

|Image|40mm|41mm|44mm|45mm/49mm|
|---|---|---|---|---|
|Image|120x120 pt (240x240 px @2x)|127x127 pt (254x254 px @2x)|132x132 pt (264x264 px @2x)|143x143 pt (286x286 px @2x)|
|Open gauge|31x31 pt (62x62 px @2x)|33x33 pt (66x66 px @2x)|33x33 pt (66x66 px @2x)|37x37 pt (74x74 px @2x)|
|Closed gauge|77x77 pt (154x154 px @2x)|81.5x81.5 (163x163 px @2x)|87x87 pt (174x174 px @2x)|91.5x91.5 (183x183 px @2x)|
|Stack|80x40 pt (160x80 px @2x)|85x42 (170x84 px @2x)|87x44 pt (174x88 px @2x)|95x48 pt (190x96 px @2x )|

> **Note**
> The system applies a circular mask to the images designated as circular, open-gauge, and closed-gauge.

Use these values when creating no-content placeholder images for your circular-family complications:

|Layout|38mm|40mm/42mm|41mm|44mm|45mm/49mm|
|---|---|---|---|---|---|
|Circular|–|42x42 pt (84x84 px @2x)|44.5x44.5 pt (89x89 px @2x)|47x47 pt (94x94 px @2x)|50x50 pt (100x100 px @2x)|
|Bezel|–|42x42 pt (84x84 px @2x)|44.5x44.5 pt (89x89 px @2x)|47x47 pt (94x94 px @2x)|50x50 pt (100x100 px @2x)|
|Extra Large|–|120x120 pt (240x240 px @2x)|127x127 pt (254x254 px @2x)|132x132 pt (264x264 px @2x)|143x143 pt (286x286 px @2x)|

A SwiftUI view implementing an extra-large circular layout uses these default text values:

- Style: Rounded
- Weight: Medium
- Text size: 34.5 pt (40mm), 36.5 pt (41mm), 36.5 pt (44mm), 41 pt (45mm/49mm)
