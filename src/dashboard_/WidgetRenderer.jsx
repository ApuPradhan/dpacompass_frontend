// dashboard_/WidgetRenderer.jsx

import WidgetRegistry from "./WidgetRegistry";


export default function WidgetRenderer({ widget }) {
    if (!widget) return null;

    // Lookup the component from registry
    const Component = WidgetRegistry[widget.type];

    // Unknown widget type
    if (!Component) {
        console.warn(
            `[Dashboard] Unknown widget type: ${widget.type}`
        );

        return (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
                <h3 className="text-red-400 font-semibold">
                    Unsupported Widget
                </h3>

                <p className="text-sm text-gray-400 mt-2">
                    Widget type "<strong>{widget.type}</strong>" is not
                    registered.
                </p>
            </div>
        );
    }

    // Render dynamically
    return <Component {...widget} />;
}