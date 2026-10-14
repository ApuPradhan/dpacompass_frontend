// dashboard_/widgets/AlertsWidget.jsx

import React from "react";
import {
    FiAlertTriangle,
    FiAlertCircle,
    FiInfo,
    FiCheckCircle,
    FiClock,
} from "react-icons/fi";

const alertStyles = {
    critical: {
        icon: FiAlertCircle,
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        label: "Critical",
    },

    warning: {
        icon: FiAlertTriangle,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        label: "Warning",
    },

    info: {
        icon: FiInfo,
        color: "text-sky-400",
        bg: "bg-sky-500/10",
        border: "border-sky-500/20",
        label: "Info",
    },

    success: {
        icon: FiCheckCircle,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        label: "Resolved",
    },
};

export default function AlertsWidget({

    title = "System Alerts",

    alerts = [],

}) {

    return (

        <div className="rounded-2xl border border-gray-700 bg-[#111827]/80 backdrop-blur-lg">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-gray-700 px-6 py-5">

                <div className="flex items-center gap-3">

                    <FiAlertTriangle className="text-amber-400 text-xl" />

                    <h2 className="text-lg font-semibold">

                        {title}

                    </h2>

                </div>

                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-300">

                    {alerts.length}

                </span>

            </div>

            {/* Body */}

            {

                alerts.length === 0 ? (

                    <div className="flex flex-col items-center justify-center py-16">

                        <FiCheckCircle
                            size={48}
                            className="text-emerald-400"
                        />

                        <h3 className="mt-4 text-lg font-medium">

                            No Active Alerts

                        </h3>

                        <p className="mt-2 text-sm text-gray-500">

                            Everything looks healthy.

                        </p>

                    </div>

                ) : (

                    <div className="divide-y divide-gray-700">

                        {

                            alerts.map((alert) => {

                                const style =
                                    alertStyles[alert.level] ||
                                    alertStyles.info;

                                const Icon = style.icon;

                                return (

                                    <div
                                        key={alert.id}
                                        className="px-6 py-4 hover:bg-white/5 transition"
                                    >

                                        <div className="flex items-start gap-4">

                                            <div
                                                className={`
                                                    mt-1
                                                    w-10
                                                    h-10
                                                    rounded-full
                                                    flex
                                                    items-center
                                                    justify-center
                                                    border
                                                    ${style.bg}
                                                    ${style.border}
                                                `}
                                            >

                                                <Icon
                                                    className={style.color}
                                                />

                                            </div>

                                            <div className="flex-1">

                                                <div className="flex items-center justify-between">

                                                    <h3 className="font-medium">

                                                        {alert.title}

                                                    </h3>

                                                    <span
                                                        className={`${style.color} text-xs`}
                                                    >

                                                        {style.label}

                                                    </span>

                                                </div>

                                                {

                                                    alert.message && (

                                                        <p className="mt-1 text-sm text-gray-400">

                                                            {alert.message}

                                                        </p>

                                                    )

                                                }

                                                {

                                                    alert.time && (

                                                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">

                                                            <FiClock />

                                                            {alert.time}

                                                        </div>

                                                    )

                                                }

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