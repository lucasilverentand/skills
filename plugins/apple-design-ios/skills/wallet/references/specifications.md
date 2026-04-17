# Specifications

#### Pass image dimensions
When designing images for wallet passes, create PNG files and use these specifications as a guide.

|Image|Supported pass styles|Filename|Dimensions (pt)|
|---|---|---|---|
|Logo|Boarding pass, coupon, store card, event ticket, generic pass|`logo.png`|Any, up to 160x50|
|Primary logo|Poster event ticket|`primaryLogo.png`|Any, up to 126x30|
|Secondary logo|Poster event ticket|`secondaryLogo.png`|Any, up to 135x12|
|Icon|All|`icon.png`|38x38|
|Background|Event ticket, poster event ticket|`background.png` (event ticket), `artwork.png` (poster event ticket)|180x220 (event ticket), 358x448 (poster event ticket)|
|Strip|Coupon, store card, event ticket|`strip.png`|375x144 (coupon, store card), 375x98 (event ticket)|
|Footer|Boarding pass|`footer.png`|Any, up to 286x15|
|Thumbnail|Event ticket, generic pass|`thumbnail.png`|90x90|

> **Note**
> The dimensions provided for the logo, primary logo, and secondary logo are the maximum allowable sizes, not mandatory requirements. For example, if you create a primary logo image measuring 30x30 points, there is no requirement to add padding to reach the maximum dimension of 126x30 points.
