// dashboard_/WidgetRegistry.js

import StatCard from "./widgets/StatCard";
import ActivityWidget from "./widgets/ActivityWidget";
import PipelineWidget from "./widgets/PipelineWidget";
import AlertsWidget from "./widgets/AlertsWidget";
import NotificationWidget from "./widgets/NotificationWidget";
// import ScannerWidget from "./widgets/ScannerWidget";
// import ComplianceWidget from "./widgets/ComplianceWidget";
// import QuickActionsWidget from "./widgets/QuickActionsWidget";
import PieChartWidget from "./widgets/PieChartWidget";
// import BarChartWidget from "./widgets/BarChartWidget";
// import LineChartWidget from "./widgets/LineChartWidget";

/*
|--------------------------------------------------------------------------
| Widget Registry
|--------------------------------------------------------------------------
|
| Every widget rendered on the dashboard must be registered here.
| The backend (or transformer) only sends the widget "type".
|
| Example:
|
| {
|    type: "stat_card",
|    title: "Applications",
|    value: 42
| }
|
| WidgetRenderer automatically renders <StatCard />
|
*/

const WidgetRegistry = {
    stat_card: StatCard,

    activity: ActivityWidget,

    pipeline: PipelineWidget,

    alerts: AlertsWidget,

    notifications: NotificationWidget,

    // scanner: ScannerWidget,

    // compliance: ComplianceWidget,

    // quick_actions: QuickActionsWidget,

    pie_chart: PieChartWidget,

    // bar_chart: BarChartWidget,

    // line_chart: LineChartWidget,
};

export default WidgetRegistry;