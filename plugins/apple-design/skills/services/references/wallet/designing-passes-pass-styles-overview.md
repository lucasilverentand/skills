# Pass styles — overview
The system defines several pass *styles* for categories such as boarding passes, coupons, store cards, and event tickets. Pass styles dictate both the visual appearance and layout of your pass content, as well as the information required by the system to suggest the pass when it is relevant (see [Passes](#Passes) for guidance).

Although each pass style differs, all styles present information using the fundamental layout areas detailed below:

All passes feature a logo image, and depending on the pass style, they may include additional images in other sections. To populate these layout areas with information, utilize the following [PassFields](apple:WalletPasses/PassFields).

|Field|Layout area|Use to provide…|
|---|---|---|
|Header|Essential|Critical details that must remain visible even when the pass is collapsed in Wallet.|
|Primary|Primary|Key information that facilitates the use of the pass.|
|Secondary and auxiliary|Secondary and auxiliary|Helpful information that users may not need during every use of the pass.|
|Back|Not shown in diagram|Supplemental details that are not required on the front of the pass.|

Generally, a pass supports up to three header fields, one primary field, up to four secondary fields, and up to four auxiliary fields. Depending on the volume of content displayed in each field, certain fields may not be visible.

**Display text only within the pass fields.** Do not embed text inside images—this content is inaccessible and not all images are displayed across all devices—and avoid custom fonts that could impede readability.
