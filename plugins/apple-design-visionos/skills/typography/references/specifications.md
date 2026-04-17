# Specifications
Symbolic traits allow you to render emphasized variations of system text styles. When implementing this, use the `[bold()](apple:SwiftUI/Text/bold())` modifier in SwiftUI, or utilize `[traitBold](apple:UIKit/UIFontDescriptor/SymbolicTraits-swift.struct/traitBold)` within the `[UIFontDescriptor](apple:UIKit/UIFontDescriptor)` API for UIKit. These emphasized weights include medium, semibold, bold, and heavy. The following details specify the particular emphasized weight for each text style.

#### macOS built-in text styles
|Text style|Weight|Size (points)|Line height (points)|Emphasized weight|
|---|---|---|---|---|
|Large Title|Regular|26|32|Bold|
|Title 1|Regular|22|26|Bold|
|Title 2|Regular|17|22|Bold|
|Title 3|Regular|15|20|Semibold|
|Headline|Bold|13|16|Heavy|
|Body|Regular|13|16|Semibold|
|Callout|Regular|12|15|Semibold|
|Subheadline|Regular|11|14|Semibold|
|Footnote|Regular|10|13|Semibold|
|Caption 1|Regular|10|13|Medium|
|Caption 2|Medium|10|13|Semibold|

#### tvOS built-in text styles
|Text style|Weight|Size (points)|Leading (points)|Emphasized weight|
|---|---|---|---|---|
|Title 1|Medium|76|96|Bold|
|Title 2|Medium|57|66|Bold|
|Title 3|Medium|48|56|Bold|
|Headline|Medium|38|46|Bold|
|Subtitle 1|Regular|38|46|Medium|
|Callout|Medium|31|38|Bold|
|Body|Medium|29|36|Bold|
|Caption 1|Medium|25|32|Bold|
|Caption 2|Medium|23|30|Bold|

#### Tracking values

##### macOS tracking values
|Size (points)|Tracking (1/1000 em)|Tracking (points)|
|---|---|---|
|6|+41|+0.24|
|7|+34|+0.23|
|8|+26|+0.21|
|9|+19|+0.17|
|10|+12|+0.12|
|11|+6|+0.06|
|12|0|0.0|
|13|-6|-0.08|
|14|-11|-0.15|
|15|-16|-0.23|
|16|-20|-0.31|
|17|-26|-0.43|
|18|-25|-0.44|
|19|-24|-0.45|
|20|-23|-0.45|
|21|-18|-0.36|
|22|-12|-0.26|
|23|-4|-0.10|
|24|+3|+0.07|
|25|+6|+0.15|
|26|+8|+0.22|
|27|+11|+0.29|
|28|+14|+0.38|
|29|+14|+0.40|
|30|+14|+0.40|
|31|+13|+0.39|
|32|+13|+0.41|
|33|+12|+0.40|
|34|+12|+0.40|
|35|+11|+0.38|
|36|+10|+0.37|
|37|+10|+0.36|
|38|+10|+0.37|
|39|+10|+0.38|
|40|+10|+0.37|
|41|+9|+0.36|
|42|+9|+0.37|
|43|+9|+0.38|
|44|+8|+0.37|
|45|+8|+0.35|
|46|+8|+0.36|
|47|+8|+0.37|
|48|+8|+0.35|
|49|+7|+0.33|
|50|+7|+0.34|
|51|+7|+0.35|
|52|+6|+0.31|
|53|+6|+0.33|
|54|+6|+0.32|
|56|+6|+0.30|
|58|+5|+0.28|
|60|+4|+0.26|
|62|+4|+0.24|
|64|+4|+0.22|
|66|+3|+0.19|
|68|+2|+0.17|
|70|+2|+0.14|
|72|+2|+0.14|
|76|+1|+0.07|
|80|0|0|
|84|0|0|
|88|0|0|
|92|0|0|
|96|0|0|

##### tvOS tracking values
|Size (points)|Tracking (1/1000 em)|Tracking (points)|
|---|---|---|
|6|+41|+0.24|
|7|+34|+0.23|
|8|+26|+0.21|
|9|+19|+0.17|
|10|+12|+0.12|
|11|+6|+0.06|
|12|0|0.0|
|13|-6|-0.08|
|14|-11|-0.15|
|15|-16|-0.23|
|16|-20|-0.31|
|17|-26|-0.43|
|18|-25|-0.44|
|19|-24|-0.45|
|20|-23|-0.45|
|21|-18|-0.36|
|22|-12|-0.26|
|23|-4|-0.10|
|24|+3|+0.07|
|25|+6|+0.15|
|26|+8|+0.22|
|27|+11|+0.29|
|28|+14|+0.38|
|29|+14|+0.40|
|30|+14|+0.40|
|31|+13|+0.39|
|32|+13|+0.41|
|33|+12|+0.40|
|34|+12|+0.40|
|35|+11|+0.38|
|36|+10|+0.37|
|37|+10|+0.36|
|38|+10|+0.37|
|39|+10|+0.38|
|40|+10|+0.37|
|41|+9|+0.36|
|42|+9|+0.37|
|43|+9|+0.38|
|44|+8|+0.37|
|45|+8|+0.35|
|46|+8|+0.36|
|47|+8|+0.37|
|48|+8|+0.35|
|49|+7|+0.33|
|50|+7|+0.34|
|51|+7|+0.35|
|52|+6|+0.31|
|53|+6|+0.33|
|54|+6|+0.32|
|56|+6|+0.30|
|58|+5|+0.28|
|60|+4|+0.26|
|62|+4|+0.24|
|64|+4|+0.22|
|66|+3|+0.19|
|68|+2|+0.17|
|70|+2|+0.14|
|72|+2|+0.14|
|76|+1|+0.07|
|80|0|0|
|84|0|0|
|88|0|0|
|92|0|0|
|96|0|0|
