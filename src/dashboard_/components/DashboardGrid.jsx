
import WidgetRenderer from "../WidgetRenderer";

export default function DashboardGrid({ widgets = [] }) {

    if (!widgets.length) {
        return (
            <div className="rounded-2xl border border-dashed theme-border p-12 text-center theme-text-secondary">
                No dashboard statistics available.
            </div>
        );
    }

    return (
        <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-4
            gap-5
            items-stretch
        ">
            {widgets.map((widget, index) => (
                <div
                    key={widget.id}
                    className="
                        min-w-0
                        h-full
                        dashboard-stat-enter
                        group
                    "
                    style={{
                        animationDelay: `${index * 120}ms`,
                    }}
                >
                    <div className="
                        h-full
                        transition-all
                        duration-300
                        ease-out
                        group-hover:-translate-y-1.5
                        group-hover:shadow-xl
                        group-hover:shadow-indigo-500/10
                    ">
                        <WidgetRenderer widget={widget} />
                    </div>
                </div>
            ))}
        </div>
    );
}
