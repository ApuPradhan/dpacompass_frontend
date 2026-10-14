// dashboard_/widgets/NotificationWidget.jsx

import {
    FiBell,
    FiClock,
    FiCheckCircle,
    FiAlertTriangle,
    FiInfo,
} from "react-icons/fi";

const notificationTypes = {
    success: {
        icon: FiCheckCircle,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
    },

    warning: {
        icon: FiAlertTriangle,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
    },

    info: {
        icon: FiInfo,
        color: "text-sky-400",
        bg: "bg-sky-500/10",
        border: "border-sky-500/20",
    },

    default: {
        icon: FiBell,
        color: "text-indigo-400",
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/20",
    },
};

export default function NotificationWidget({

    title = "Notifications",

    notifications = [],

}) {

    return (

        <div className="rounded-2xl border border-gray-700 bg-[#111827]/80 backdrop-blur-lg">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-gray-700 px-6 py-5">

                <div className="flex items-center gap-3">

                    <FiBell className="text-indigo-400 text-xl" />

                    <h2 className="text-lg font-semibold">

                        {title}

                    </h2>

                </div>

                <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-300">

                    {notifications.length}

                </span>

            </div>

            {/* Body */}

            {

                notifications.length === 0 ? (

                    <div className="py-16 text-center">

                        <FiBell
                            className="mx-auto text-gray-600"
                            size={40}
                        />

                        <p className="mt-4 text-gray-500">

                            No notifications available.

                        </p>

                    </div>

                ) : (

                    <div className="max-h-105 overflow-y-auto">

                        {

                            notifications.map((notification) => {

                                const style =
                                    notificationTypes[
                                    notification.type
                                    ] ||
                                    notificationTypes.default;

                                const Icon = style.icon;

                                return (

                                    <div

                                        key={notification.id}

                                        className="border-b border-gray-700 px-6 py-4 hover:bg-white/5 transition"

                                    >

                                        <div className="flex gap-4">

                                            <div
                                                className={`

                                                    w-10

                                                    h-10

                                                    rounded-full

                                                    flex

                                                    items-center

                                                    justify-center

                                                    ${style.bg}

                                                    ${style.border}

                                                    border

                                                `}
                                            >

                                                <Icon
                                                    className={style.color}
                                                />

                                            </div>

                                            <div className="flex-1">

                                                <h3 className="font-medium">

                                                    {notification.title}

                                                </h3>

                                                {

                                                    notification.message && (

                                                        <p className="mt-1 text-sm text-gray-400">

                                                            {notification.message}

                                                        </p>

                                                    )

                                                }

                                                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">

                                                    <FiClock />

                                                    {notification.time}

                                                </div>

                                            </div>

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