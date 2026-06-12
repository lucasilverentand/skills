# Complications — overview
While most watch faces can accommodate at least one complication, some support four or more.

Beginning with watchOS 9, the system categorizes complications (also referred to as *accessories*) into distinct families—such as [circular](#Circular) and [inline](#Inline)—and suggests specific layouts for displaying complication data. A watch face dictates which family each complication slot supports. Complications designed for earlier versions of watchOS may utilize [legacy templates](#Legacy-templates), which define non-graphic complication styles that are independent of the wearer’s chosen color.

> **Developer note**
> For complications targeting watchOS 9 and newer, it is recommended to use [WidgetKit](apple:WidgetKit). Refer to [Migrating ClockKit complications to WidgetKit](apple:WidgetKit/Converting-A-ClockKit-App) for guidance. To maintain support for older watchOS versions, continue implementing the ClockKit complication data source protocol (see [CLKComplicationDataSource](apple:ClockKit/CLKComplicationDataSource)).
