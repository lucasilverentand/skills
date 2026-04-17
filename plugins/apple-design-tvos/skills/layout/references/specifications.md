# Specifications

#### iOS, iPadOS device screen dimensions
|Model|Dimensions (portrait)|
|---|---|
|iPad Pro 12.9-inch|1024x1366 pt (2048x2732 px @2x)|
|iPad Pro 11-inch|834x1194 pt (1668x2388 px @2x)|
|iPad Pro 10.5-inch|834x1194 pt (1668x2388 px @2x)|
|iPad Pro 9.7-inch|768x1024 pt (1536x2048 px @2x)|
|iPad Air 13-inch|1024x1366 pt (2048x2732 px @2x)|
|iPad Air 11-inch|820x1180 pt (1640x2360 px @2x)|
|iPad Air 10.9-inch|820x1180 pt (1640x2360 px @2x)|
|iPad Air 10.5-inch|834x1112 pt (1668x2224 px @2x)|
|iPad Air 9.7-inch|768x1024 pt (1536x2048 px @2x)|
|iPad 11-inch|820x1180 pt (1640x2360 px @2x)|
|iPad 10.2-inch|810x1080 pt (1620x2160 px @2x)|
|iPad 9.7-inch|768x1024 pt (1536x2048 px @2x)|
|iPad mini 8.3-inch|744x1133 pt (1488x2266 px @2x)|
|iPad mini 7.9-inch|768x1024 pt (1536x2048 px @2x)|
|iPhone 17 Pro Max|440x956 pt (1320x2868 px @3x)|
|iPhone 17 Pro|402x874 pt (1206x2622 px @3x)|
|iPhone Air|420x912 pt (1260x2736 px @3x)|
|iPhone 17|402x874 pt (1206x2622 px @3x)|
|iPhone 16 Pro Max|440x956 pt (1320x2868 px @3x)|
|iPhone 16 Pro|402x874 pt (1206x2622 px @3x)|
|iPhone 16 Plus|430x932 pt (1290x2796 px @3x)|
|iPhone 16|393x852 pt (1179x2556 px @3x)|
|iPhone 16e|390x844 pt (1170x2532 px @3x)|
|iPhone 15 Pro Max|430x932 pt (1290x2796 px @3x)|
|iPhone 15 Pro|393x852 pt (1179x2556 px @3x)|
|iPhone 15 Plus|430x932 pt (1290x2796 px @3x)|
|iPhone 15|393x852 pt (1179x2556 px @3x)|
|iPhone 14 Pro Max|430x932 pt (1290x2796 px @3x)|
|iPhone 14 Pro|393x852 pt (1179x2556 px @3x)|
|iPhone 14 Plus|428x926 pt (1284x2778 px @3x)|
|iPhone 14|390x844 pt (1170x2532 px @3x)|
|iPhone 13 Pro Max|428x926 pt (1284x2778 px @3x)|
|iPhone 13 Pro|390x844 pt (1170x2532 px @3x)|
|iPhone 13|390x844 pt (1170x2532 px @3x)|
|iPhone 13 mini|375x812 pt (1125x2436 px @3x)|
|iPhone 12 Pro Max|428x926 pt (1284x2778 px @3x)|
|iPhone 12 Pro|390x844 pt (1170x2532 px @3x)|
|iPhone 12|390x844 pt (1170x2532 px @3x)|
|iPhone 12 mini|375x812 pt (1125x2436 px @3x)|
|iPhone 11 Pro Max|414x896 pt (1242x2688 px @3x)|
|iPhone 11 Pro|375x812 pt (1125x2436 px @3x)|
|iPhone 11|414x896 pt (828x1792 px @2x)|
|iPhone XS Max|414x896 pt (1242x2688 px @3x)|
|iPhone XS|375x812 pt (1125x2436 px @3x)|
|iPhone XR|414x896 pt (828x1792 px @2x)|
|iPhone X|375x812 pt (1125x2436 px @3x)|
|iPhone 8 Plus|414x736 pt (1080x1920 px @3x)|
|iPhone 8|375x667 pt (750x1334 px @2x)|
|iPhone 7 Plus|414x736 pt (1080x1920 px @3x)|
|iPhone 7|375x667 pt (750x1334 px @2x)|
|iPhone 6s Plus|414x736 pt (1080x1920 px @3x)|
|iPhone 6s|375x667 pt (750x1334 px @2x)|
|iPhone 6 Plus|414x736 pt (1080x1920 px @3x)|
|iPhone 6|375x667 pt (750x1334 px @2x)|
|iPhone SE 4.7-inch|375x667 pt (750x1334 px @2x)|
|iPhone SE 4-inch|320x568 pt (640x1136 px @2x)|
|iPod touch 5th generation and later|320x568 pt (640x1136 px @2x)|

> **Note**
> The scale factors listed in the table above are UIKit scale factors and may differ from native device scale factors. For developer guidance, refer to [scale](apple:UIKit/UIScreen/scale) or [nativeScale](apple:UIKit/UIScreen/nativeScale).

#### iOS, iPadOS device size classes
A size class is a classification of either `regular` or `compact`. Specifically, *regular* denotes a larger display or one oriented in landscape mode, while *compact* refers to a smaller screen or one viewed in portrait orientation. Developers should refer to [UserInterfaceSizeClass](apple:SwiftUI/UserInterfaceSizeClass) for detailed guidance.

The specific combination of size classes applies to the full-screen experience across different devices based on their screen dimensions.

|Model|Portrait orientation|Landscape orientation|
|---|---|---|
|iPad Pro 12.9-inch|Regular width, regular height|Regular width, regular height|
|iPad Pro 11-inch|Regular width, regular height|Regular width, regular height|
|iPad Pro 10.5-inch|Regular width, regular height|Regular width, regular height|
|iPad Air 13-inch|Regular width, regular height|Regular width, regular height|
|iPad Air 11-inch|Regular width, regular height|Regular width, regular height|
|iPad 11-inch|Regular width, regular height|Regular width, regular height|
|iPad 9.7-inch|Regular width, regular height|Regular width, regular height|
|iPad mini 7.9-inch|Regular width, regular height|Regular width, regular height|
|iPhone 17 Pro Max|Compact width, regular height|Regular width, compact height|
|iPhone 17 Pro|Compact width, regular height|Compact width, compact height|
|iPhone Air|Compact width, regular height|Regular width, compact height|
|iPhone 17|Compact width, regular height|Compact width, compact height|
|iPhone 16 Pro Max|Compact width, regular height|Regular width, compact height|
|iPhone 16 Pro|Compact width, regular height|Compact width, compact height|
|iPhone 16 Plus|Compact width, regular height|Regular width, compact height|
|iPhone 16|Compact width, regular height|Compact width, compact height|
|iPhone 16e|Compact width, regular height|Compact width, compact height|
|iPhone 15 Pro Max|Compact width, regular height|Regular width, compact height|
|iPhone 15 Pro|Compact width, regular height|Compact width, compact height|
|iPhone 15 Plus|Compact width, regular height|Regular width, compact height|
|iPhone 15|Compact width, regular height|Compact width, compact height|
|iPhone 14 Pro Max|Compact width, regular height|Regular width, compact height|
|iPhone 14 Pro|Compact width, regular height|Compact width, compact height|
|iPhone 14 Plus|Compact width, regular height|Regular width, compact height|
|iPhone 14|Compact width, regular height|Compact width, compact height|
|iPhone 13 Pro Max|Compact width, regular height|Regular width, compact height|
|iPhone 13 Pro|Compact width, regular height|Compact width, compact height|
|iPhone 13|Compact width, regular height|Compact width, compact height|
|iPhone 13 mini|Compact width, regular height|Compact width, compact height|
|iPhone 12 Pro Max|Compact width, regular height|Regular width, compact height|
|iPhone 12 Pro|Compact width, regular height|Compact width, compact height|
|iPhone 12|Compact width, regular height|Compact width, compact height|
|iPhone 12 mini|Compact width, regular height|Compact width, compact height|
|iPhone 11 Pro Max|Compact width, regular height|Regular width, compact height|
|iPhone 11 Pro|Compact width, regular height|Compact width, compact height|
|iPhone 11|Compact width, regular height|Regular width, compact height|
|iPhone XS Max|Compact width, regular height|Regular width, compact height|
|iPhone XS|Compact width, regular height|Compact width, compact height|
|iPhone XR|Compact width, regular height|Regular width, compact height|
|iPhone X|Compact width, regular height|Compact width, compact height|
|iPhone 8 Plus|Compact width, regular height|Regular width, compact height|
|iPhone 8|Compact width, regular height|Compact width, compact height|
|iPhone 7 Plus|Compact width, regular height|Regular width, compact height|
|iPhone 7|Compact width, regular height|Compact width, compact height|
|iPhone 6s Plus|Compact width, regular height|Regular width, compact height|
|iPhone 6s|Compact width, regular height|Compact width, compact height|
|iPhone SE|Compact width, regular height|Compact width, compact height|
|iPod touch 5th generation and later|Compact width, regular height|Compact width, compact height|

#### watchOS device screen dimensions
|Series|Size|Width (pixels)|Height (pixels)|
|---|---|---|---|
|Apple Watch Ultra (3rd generation)|49mm|422|514|
|10, 11|42mm|374|446|
|10, 11|46mm|416|496|
|Apple Watch Ultra (1st and 2nd generations)|49mm|410|502|
|7, 8, and 9|41mm|352|430|
|7, 8, and 9|45mm|396|484|
|4, 5, 6, and SE (all generations)|40mm|324|394|
|4, 5, 6, and SE (all generations)|44mm|368|448|
|1, 2, and 3|38mm|272|340|
|1, 2, and 3|42mm|312|390|
