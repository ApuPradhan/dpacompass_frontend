// dashboard_/components/DashboardGrid.jsx

import WidgetRenderer from "../WidgetRenderer";
import { getColumnSpan } from "../utils/layoutUtils";

/**
 * DashboardGrid
 *
 * Displays all widgets using a responsive 12-column CSS grid.
 *
 * Every widget can specify:
 *
 * cols : 4
 *
 * which determines its width.
 */

export default function DashboardGrid({ widgets = [] }) {

    if (!widgets.length) {
        return (
            <div className="rounded-2xl border border-dashed border-gray-700 p-12 text-center text-gray-500">
                No dashboard widgets available.
            </div>
        );
    }

    return (

        <div className="grid grid-cols-12 gap-6">
             
            {widgets.map((widget) => {
                const span = getColumnSpan(widget.cols);
                return (
                    <div
                        key={widget.id}
                        className={getColumnSpan(widget.cols)}
                    >
                        <WidgetRenderer widget={widget} />
                    </div>
                );
            })}

        </div>

    );

}