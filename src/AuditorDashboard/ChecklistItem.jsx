import { useState, useEffect, useRef } from "react";
import {
    FiChevronDown,
    FiChevronRight,
    FiShield,
    FiLoader
} from "react-icons/fi";

import ScanResultViewer from "../utilities/ScanResultsViewer";
import ScannerResultViewer from "../ConsentScannerModule/ScannerResultViewer";
import { fetchWithAuth } from "../utilities/fetchWithAuth";
import { toast } from "react-toastify";

export default function ChecklistItem({ item, index, url, auditId }) {

    const [open, setOpen] = useState(false);
    console.log(item);
    
    const [scan, setScan] = useState({
        loading: true,
        status: null,
        result: null,
        error: null
    });

    const scannerKey = item?.scanner?.scanner_key;
    const isCompletedRef = useRef(false);

    // =========================
    // SAFE JSON PARSER
    // =========================
    const safeJson = async (res) => {
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch {
            throw new Error("Invalid server response");
        }
    };

    const getSeverityStyle = (severity) => {
        switch (severity) {
            case "critical": return "text-red-500 bg-red-500/20";
            case "high": return "text-orange-400 bg-orange-500/20";
            case "medium": return "text-yellow-400 bg-yellow-500/20";
            default: return "text-green-400 bg-green-500/20";
        }
    };

    // =====================
    // POLLING (FIXED)
    // =====================
    useEffect(() => {
        if (!scannerKey || !auditId || !url) return;

        let retryCount = 0;
        const MAX_RETRIES = 5;

        const interval = setInterval(async () => {

            if (isCompletedRef.current) return;

            try {
                const res = await fetchWithAuth("/api/scanner/webscan/", {
                    method: "POST",
                    body: JSON.stringify({
                        scanner_key: scannerKey,
                        target: url,
                        audit_id: auditId
                    })
                });

                if (!res.ok) {
                    throw new Error(`Scan failed (${res.status})`);
                }

                const data = await safeJson(res);

                const scanStatus = data.scan_status?.toLowerCase();
                const isDone = scanStatus === "completed";

                // 🔥 Extract result safely
                let finalResult = null;

                if (scannerKey === "consent_check") {
                    finalResult = data?.result?.findings?.consent_results || null;
                } else {
                    finalResult = data?.result?.findings?.auditor_evidence || null;
                }

                setScan(prev => {
                    if (prev.result) return prev;

                    return {
                        loading: !isDone,
                        status: scanStatus,
                        result: finalResult,
                        error: null
                    };
                });

                // ✅ Stop polling
                if (isDone) {
                    isCompletedRef.current = true;
                    clearInterval(interval);
                }

            } catch (err) {
                console.error("Polling error:", err);

                retryCount++;

                // ❌ Stop after max retries
                if (retryCount >= MAX_RETRIES) {
                    clearInterval(interval);
                    isCompletedRef.current = true;

                    setScan({
                        loading: false,
                        status: "failed",
                        result: null,
                        error: err.message
                    });

                    toast.error("Scan failed. Please retry.");
                }
            }

        }, 3000);

        return () => clearInterval(interval);

    }, [scannerKey, auditId, url]);

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
                        <p className="text-violet-300 font-medium">
                            {item.clause || item.rule_id}
                        </p>
                        <p className="text-sm text-gray-400">
                            {item.description}
                        </p>
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
            <div
                className={`
                    transition-all duration-300
                    ${open ? "max-h-[60vh] opacity-100" : "max-h-0 opacity-0"}
                    overflow-y-auto
                `}
            >
                <div className="p-4 border-t border-gray-700 space-y-5">

                    {/* STATUS */}
                    <div className="flex items-center justify-between">

                        {scan.loading && (
                            <span className="flex items-center gap-2 text-yellow-400 text-sm">
                                <FiLoader className="animate-spin" />
                                {scan.status === "running"
                                    ? "Running scan..."
                                    : "Generating results..."}
                            </span>
                        )}

                        {!scan.loading && scan.error && (
                            <span className="text-red-400 text-sm">
                                {scan.error}
                            </span>
                        )}

                        {!scan.loading && !scan.error && scan.result && (
                            <span className="text-green-400 text-sm">
                                Completed
                            </span>
                        )}

                    </div>

                    {/* RESULT VIEW */}
                    {scan.result && (
                        scannerKey === "consent_check"
                            ? <ScannerResultViewer data={scan.result} />
                            : <ScanResultViewer result={scan.result} />
                    )}

                </div>
            </div>
        </div>
    );
}