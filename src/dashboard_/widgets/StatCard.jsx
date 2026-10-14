// dashboard_/widgets/StatCard.jsx

import React from "react";
import { FiArrowUpRight } from "react-icons/fi";

const colorVariants = {
    indigo: {
        icon: "text-indigo-400",
        bg: "bg-indigo-500/10",
        border: "hover:border-indigo-500/50",
    },

    blue: {
        icon: "text-sky-400",
        bg: "bg-sky-500/10",
        border: "hover:border-sky-500/50",
    },

    green: {
        icon: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "hover:border-emerald-500/50",
    },

    amber: {
        icon: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "hover:border-amber-500/50",
    },

    purple: {
        icon: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "hover:border-purple-500/50",
    },

    cyan: {
        icon: "text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "hover:border-cyan-500/50",
    },

    orange: {
        icon: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "hover:border-orange-500/50",
    },

    red: {
        icon: "text-red-400",
        bg: "bg-red-500/10",
        border: "hover:border-red-500/50",
    },
};

export default function StatCard({

    title,

    value,

    subtitle,

    icon: Icon,

    color = "indigo",

    trend,

    progress,

    onClick,

}) {

    const theme = colorVariants[color] || colorVariants.indigo;

    return (

        <div

            onClick={onClick}

            className={`

                group

                relative

                overflow-hidden

                rounded-2xl

                border

                border-gray-700

                bg-[#111827]/80

                backdrop-blur-lg

                p-5

                transition-all

                duration-300

                ${theme.border}

                hover:-translate-y-1

                hover:shadow-2xl

                cursor-default

            `}

        >

            {/* Decorative Glow */}

            <div

                className={`

                    absolute

                    right-0

                    top-0

                    h-28

                    w-28

                    rounded-full

                    blur-3xl

                    opacity-10

                    ${theme.bg}

                `}

            />

            <div className="relative flex items-start justify-between">

                <div>

                    <p className="text-sm text-gray-400">

                        {title}

                    </p>

                    <h2 className="mt-2 text-4xl font-bold tracking-tight">

                        {value}

                    </h2>

                    {

                        subtitle && (

                            <p className="mt-2 text-sm text-gray-500">

                                {subtitle}

                            </p>

                        )

                    }

                </div>

                <div

                    className={`

                        rounded-xl

                        p-3

                        ${theme.bg}

                    `}

                >

                    {

                        Icon && (

                            <Icon

                                className={`${theme.icon} text-2xl`}

                            />

                        )

                    }

                </div>

            </div>

            {

                trend && (

                    <div className="mt-5 flex items-center gap-2">

                        <FiArrowUpRight

                            className="text-green-400"

                        />

                        <span className="text-sm text-green-400">

                            {trend}

                        </span>

                    </div>

                )

            }

            {

                progress !== undefined && (

                    <div className="mt-5">

                        <div className="h-2 rounded-full bg-gray-700">

                            <div

                                style={{

                                    width: `${progress}%`,

                                }}

                                className="h-2 rounded-full bg-indigo-500"

                            />

                        </div>

                    </div>

                )

            }

        </div>

    );

}