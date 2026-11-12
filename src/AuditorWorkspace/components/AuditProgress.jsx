
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    ClipboardList,
} from "lucide-react";

export default function AuditProgress({ progress }) {

    const statistics = [
        {
            label: "Total Questions",
            value: progress.total || 0,
            icon: ClipboardList,
            color: "text-white",
            bg: "bg-slate-500/10",
        },
        {
            label: "Saved Responses",
            value: progress.completed || 0,
            icon: CheckCircle2,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
        },
        {
            label: "Remaining",
            value: progress.pending || 0,
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
        },
        {
            label: "Unsaved Changes",
            value: progress.unsaved || 0,
            icon: AlertCircle,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
        },
    ];

    const percentage = progress.percentage || 0;

    return (
        <div className="bg-[#111827] border border-slate-700
                        rounded-xl p-5">

            <div className="flex flex-wrap items-center
                            justify-between gap-3 mb-5">

                <div>
                    <h2 className="text-base font-semibold text-white">
                        Audit Progress
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">
                        Overall checklist completion
                    </p>
                </div>

                <span className="text-2xl font-bold text-indigo-400">
                    {percentage}%
                </span>

            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full
                            overflow-hidden mb-3">

                <div
                    className="h-full bg-indigo-500 rounded-full
                               transition-all duration-500"
                    style={{
                        width: `${Math.min(percentage, 100)}%`,
                    }}
                />

            </div>

            <div className="flex justify-between text-xs
                            text-slate-500 mb-6">

                <span>{progress.completed || 0} saved</span>

                <span>{progress.total || 0} total</span>

            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

                {statistics.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.label}
                            className="bg-[#0B1220] border border-slate-700/60
                                       rounded-lg p-3"
                        >

                            <div className={`w-9 h-9 rounded-lg ${item.bg}
                                            flex items-center justify-center mb-3`}>
                                <Icon size={18} className={item.color} />
                            </div>

                            <p className={`text-xl font-bold ${item.color}`}>
                                {item.value}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                                {item.label}
                            </p>

                        </div>
                    );
                })}

            </div>

        </div>
    );
}
