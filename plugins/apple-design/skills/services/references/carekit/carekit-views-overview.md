# CareKit views — overview
CareKit UI offers customizable views, which are grouped into three categories: tasks, charts, and contacts. Within each category, several default view styles are defined. Developing a CareKit application involves selecting the necessary view styles and providing the CareKit Store data to populate them.

Each view category is specifically engineered to support certain content and interaction types. For a cohesive user experience, it is crucial to utilize each view type according to its intended function.

|Category|Purpose|
|---|---|
|[Tasks](#Tasks)|Present tasks, like taking medication or doing physical therapy. Support logging of patient symptoms and other data.|
|[Charts](#Charts)|Display graphical data that can help people understand how their treatment is progressing.|
|[Contact views](#Contact-views)|Display contact information. Support communication through phone, message, and email, and link to a map of the contact’s location.|

A CareKit UI view comprises a header and may include a stack of content subviews. The header, positioned at the top of the view, can display text, a symbol, and a disclosure indicator, and may feature a separator along its bottom edge. The content stack appears beneath the header and arranges your content subviews vertically.

CareKit UI manages all layout constraints within a view, meaning you do not need to manage existing constraints when adding new subviews to the stack.
