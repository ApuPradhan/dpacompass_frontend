import { useState, useEffect } from "react";
import {
    FiChevronDown,
    FiChevronRight,
    FiShield,
    FiLoader
} from "react-icons/fi";
import ScanResultViewer from "../utilities/ScanResultsViewer";
import { fetchWithAuth } from "../utilities/fetchWithAuth";


export default function ChecklistItem({ item, index, url, auditId }) {

    const [open, setOpen] = useState(false);

    const [scan, setScan] = useState({
        loading: false,
        jobId: null,
        status: null,
        result: null
    });

    const getSeverityStyle = (severity) => {
        switch (severity) {
            case "critical": return "text-red-500 bg-red-500/20";
            case "high": return "text-orange-400 bg-orange-500/20";
            case "medium": return "text-yellow-400 bg-yellow-500/20";
            default: return "text-green-400 bg-green-500/20";
        }
    };

    // =====================
    // LOAD JOB FROM LOCAL STORAGE
    // =====================
    useEffect(() => {
        if (!auditId) return;

        const stored = localStorage.getItem(`audit_${auditId}_jobs`);
        if (!stored) return;

        const jobs = JSON.parse(stored);
        const job = jobs[index];

        if (job) {
            setScan({
                loading: job.status !== "COMPLETED",
                jobId: job.jobId,
                status: job.status,
                result: job.result || null
            });

            // 🔁 Always resume polling if not completed
            if (job.status !== "COMPLETED") {
                pollScan(job.jobId);
            }
        }
    }, [auditId, index]);

    // =====================
    // POLLING (NO TIMEOUT)
    // =====================
    const pollScan = (jobId) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetchWithAuth(`/api/scanner/webscan/${jobId}`);
                const data = await res.json();

                const stored = JSON.parse(localStorage.getItem(`audit_${auditId}_jobs`) || "[]");

                // Always update localStorage status
                stored[index] = {
                    ...stored[index],
                    status: data.status || "QUEUED",
                    result: data.result || stored[index]?.result
                };

                localStorage.setItem(`audit_${auditId}_jobs`, JSON.stringify(stored));

                // Always update UI from localStorage (not from API directly)
                setScan({
                    loading: data.status !== "COMPLETED",
                    jobId,
                    status: stored[index].status,
                    result: stored[index].result
                });

                if (data.status === "COMPLETED") {
                    clearInterval(interval);
                }

            } catch (err) {
                console.error(err);
            }
        }, 3000);
    };

    return (
        <div className="border border-gray-700 rounded-xl bg-[#111827] overflow-hidden">

            {/* HEADER */}
            <div
                onClick={() => setOpen(!open)}
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-[#1e293b]"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
                        <FiShield size={16} />
                    </div>

                    <div>
                        <p className="text-violet-300 font-medium">{item.rule_id}</p>
                        <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded ${getSeverityStyle(item.severity)}`}>
                        {item.severity}
                    </span>

                    {open ? <FiChevronDown /> : <FiChevronRight />}
                </div>
            </div>

            {/* BODY */}
            <div className={`${open ? "max-h-150 opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
                <div className="p-4 border-t border-gray-700 space-y-5">

                    {/* STATUS ONLY */}
                    <div className="flex items-center justify-between">

                        {scan.status !== "COMPLETED" && (
                            <span className="flex items-center gap-2 text-yellow-400 text-sm">
                                <FiLoader className="animate-spin" />
                                Generating results...
                            </span>
                        )}

                        {scan.status === "COMPLETED" && (
                            <span className="text-green-400 text-sm">
                                Completed
                            </span>
                        )}

                    </div>

                    {/* RESULT */}
                    {scan.result && (
                        <ScanResultViewer result={scan.result} />
                    )}

                </div>
            </div>
        </div>
    );
}