// dashboard_/widgets/PieChartWidget.jsx

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from "recharts";

const COLORS = [
    "#6366F1", // Indigo
    "#06B6D4", // Cyan
    "#F59E0B", // Amber
    "#10B981", // Emerald
    "#8B5CF6", // Purple
    "#EF4444", // Red
    "#3B82F6", // Blue
    "#F97316", // Orange
];

export default function PieChartWidget({

    title = "Distribution",

    data = [],

}) {

    return (

        <div className="rounded-2xl border border-gray-700 bg-[#111827]/80 backdrop-blur-lg">

            <div className="border-b border-gray-700 px-6 py-5">

                <h2 className="text-lg font-semibold">

                    {title}

                </h2>

            </div>

            {

                data.length === 0 ? (

                    <div className="py-24 text-center text-gray-500">

                        No data available.

                    </div>

                ) : (

                    <div className="h-85 p-4">

                        <ResponsiveContainer width="100%" height="100%">

                            <PieChart>

                                <Pie

                                    data={data}

                                    dataKey="value"

                                    nameKey="name"

                                    outerRadius={110}

                                    innerRadius={60}

                                    paddingAngle={3}

                                >

                                    {

                                        data.map((entry, index) => (

                                            <Cell
                                                key={index}
                                                fill={COLORS[index % COLORS.length]}
                                            />

                                        ))

                                    }

                                </Pie>

                                <Tooltip />

                                <Legend />

                            </PieChart>

                        </ResponsiveContainer>

                    </div>

                )

            }

        </div>

    );

}