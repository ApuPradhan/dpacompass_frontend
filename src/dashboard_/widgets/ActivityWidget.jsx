// dashboard_/widgets/ActivityWidget.jsx

import {
    FiActivity,
    FiCheckCircle,
    FiClock,
    FiAlertCircle,
} from "react-icons/fi";

const STATUS = {
    completed: {
        icon: FiCheckCircle,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        label: "Completed",
    },

    in_progress: {
        icon: FiClock,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        label: "In Progress",
    },

    pending: {
        icon: FiAlertCircle,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        label: "Pending",
    },
};

export default function ActivityWidget({

    title = "Recent Activity",

    items = [],

}) {

    return (

        <div className="rounded-2xl border border-gray-700 bg-[#111827]/80 backdrop-blur-lg">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-700 px-6 py-5">
                <FiActivity className="text-indigo-400 text-xl" />
                <h2 className="text-lg font-semibold">
                    {title}
                </h2>
            </div>
            {/* Empty */}
            {
                items.length === 0 ? (
                    <div className="py-16 text-center text-gray-500">
                        No recent activity available.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-700">
                        {
                            items.map((item) => {
                                const status =
                                    STATUS[item.status] ||
                                    STATUS.pending;
                                const Icon = status.icon;
                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition"

                                    >
                                        <div>
                                            <h3 className="font-medium">
                                                {item.title}
                                            </h3>
                                            {

                                                item.subtitle && (

                                                    <p className="mt-1 text-sm text-gray-400">
                                                        {item.subtitle}
                                                    </p>
                                                )
                                            }
                                        </div>
                                        <div
                                            className={`
                                                flex
                                                items-center
                                                gap-2
                                                rounded-full
                                                px-3
                                                py-1.5
                                                border
                                                ${status.border}
                                                ${status.bg}
                                            `}
                                        >
                                            <Icon
                                                className={status.color}
                                            />
                                            <span
                                                className={`${status.color} text-sm`}
                                            >
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                )
            }
        </div>
    );

}