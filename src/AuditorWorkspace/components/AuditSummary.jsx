
import {
    ClipboardCheck,
    Globe,
    UserRound,
    CalendarDays,
    ShieldCheck,
} from "lucide-react";

export default function AuditSummary({ audit, publicAuditId, domains = [] }) {

    const info = [
        {
            label: "Audit Reference",
            value: publicAuditId || audit?.public_audit_id || "N/A",
            icon: ClipboardCheck,
        },
        {
            label: "Application",
            value: audit?.application_name || audit?.application?.name || "N/A",
            icon: ShieldCheck,
        },
        {
            label: "Website URL",
            value: audit?.application_url || audit?.application?.url || "N/A",
            icon: Globe,
        },
        {
            label: "Assigned Auditor",
            value: audit?.auditor_name || "N/A",
            icon: UserRound,
        },
        {
            label: "Audit Date",
            value: audit?.created_at
                ? new Date(audit.created_at).toLocaleDateString()
                : "N/A",
            icon: CalendarDays,
        },
        {
            label: "Total Domains",
            value: domains.length,
            icon: ClipboardCheck,
        },
    ];

    return (
        <div className="bg-[#111827] border border-slate-700
                        rounded-xl p-5">

            <div className="flex items-center gap-2 mb-5">
                <ShieldCheck className="text-indigo-400" size={20} />

                <h2 className="text-base font-semibold text-white">
                    Audit Information
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                {info.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div key={item.label} className="min-w-0">

                            <div className="flex items-center gap-2 mb-2">
                                <Icon size={15} className="text-indigo-400" />

                                <span className="text-xs text-slate-500">
                                    {item.label}
                                </span>
                            </div>

                            <p className="text-sm font-medium text-slate-200
                                          wrap-break-word">
                                {item.value}
                            </p>

                        </div>
                    );
                })}

            </div>
        </div>
    );
}
