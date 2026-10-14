import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

/*
 * Compliance-result statuses.
 *
 * These are intentionally separate from crawler execution statuses
 * (QUEUED / RUNNING / COMPLETED), which are handled by AuditProgress.
 */
const STATUS_CONFIG = {
    compliant: {
        label: "Compliant",
        icon: CheckCircle2,
        className:
            "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },

    review: {
        label: "Review",
        icon: AlertTriangle,
        className:
            "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },

    partial: {
        label: "Partial",
        icon: AlertTriangle,
        className:
            "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },

    non_compliant: {
        label: "Non-compliant",
        icon: XCircle,
        className:
            "text-red-400 bg-red-500/10 border-red-500/20",
    },

    pending: {
        label: "Pending",
        icon: Clock,
        className:
            "text-slate-400 bg-slate-500/10 border-slate-500/20",
    },

    running: {
        label: "Running",
        icon: Clock,
        className:
            "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
};

const normalizeStatus = (status) => {
    if (!status) {
        return "pending";
    }

    const normalized = String(status)
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");

    /*
     * Backend compliance results:
     * PASS  -> compliant
     * FAIL  -> non_compliant
     * REVIEW -> review
     */
    const aliases = {
        pass: "compliant",
        passed: "compliant",
        compliant: "compliant",

        fail: "non_compliant",
        failed: "non_compliant",
        non_compliant: "non_compliant",

        review: "review",
        partial: "partial",

        queued: "pending",
        pending: "pending",
        running: "running",
    };

    return aliases[normalized] || normalized;
};

const StatusBadge = ({ status, size = "md" }) => {
    const normalizedStatus = normalizeStatus(status);

    const config =
        STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.pending;

    const Icon = config.icon;

    const sizeClasses = {
        sm: {
            wrapper: "px-2 py-0.5 text-[11px] gap-1",
            icon: "h-3 w-3",
        },
        md: {
            wrapper: "px-2.5 py-1 text-xs gap-1.5",
            icon: "h-3.5 w-3.5",
        },
        lg: {
            wrapper: "px-3 py-1.5 text-sm gap-2",
            icon: "h-4 w-4",
        },
    };

    const currentSize =
        sizeClasses[size] || sizeClasses.md;

    return (
        <span
            className={`
                inline-flex
                items-center
                rounded-full
                border
                font-medium
                whitespace-nowrap
                ${config.className}
                ${currentSize.wrapper}
            `}
        >
            <Icon className={currentSize.icon} />
            {config.label}
        </span>
    );
};

export default StatusBadge;
