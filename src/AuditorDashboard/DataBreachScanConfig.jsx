import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    FiArrowLeft,
    FiClock,
    FiShield,
    FiGlobe,
    FiPlay,
    FiLoader,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { breachApi } from "../utilities/breachApi";

export default function DataBreachScanConfig() {
    const navigate = useNavigate();
    const location = useLocation();
    const { auditId: routeAuditId } = useParams();

    const audit = location.state?.audit || {};
    const auditId = audit.audit_id || routeAuditId;
    const targetUrl = audit.url || audit.application_url || "";

    const [maxPages, setMaxPages] = useState("20");
    const [starting, setStarting] = useState(false);
    const [pageError, setPageError] = useState("");

    const parsedPages = Number(maxPages);
    const isValidPageLimit =
        Number.isInteger(parsedPages) &&
        parsedPages >= 1 &&
        parsedPages <= 1000;

    // A duration is deliberately not fabricated here: the Data Breach
    // scanner's measured per-page runtime has not been provided.
    const pageLimitMessage = useMemo(() => {
        if (!maxPages.trim()) return "Enter a page limit.";
        if (!isValidPageLimit) return "Enter a whole number between 1 and 1000.";
        return "";
    }, [maxPages, isValidPageLimit]);

    const handleStartScan = async () => {
        if (!auditId) {
            toast.error("Audit ID is missing. Please return and select the audit again.");
            return;
        }

        if (!targetUrl) {
            toast.error("Application URL is missing. Please return and select the audit again.");
            return;
        }

        if (!isValidPageLimit) {
            setPageError(pageLimitMessage);
            return;
        }

        try {
            setStarting(true);
            setPageError("");

            const userData = JSON.parse(localStorage.getItem("user") || "{}");
            const username = userData.username;

            if (!username) {
                throw new Error("Username not found in localStorage. Please sign in again.");
            }

            const data = await breachApi("/api/scanner/webscan/", {
                method: "POST",
                body: JSON.stringify({
                    username,
                    public_audit_id: audit.public_audit_id,
                    url: targetUrl,
                    max_pages: parsedPages,
                    max_depth: 2,
                }),
            });

            toast.success(data?.message || "Data Breach scan submitted successfully.");
            navigate("/auditor/databreachscanner", { replace: true });
        } catch (error) {
            console.error("Data Breach scan start error:", error);
            toast.error(error.message || "Failed to start Data Breach scan.");
        } finally {
            setStarting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b1120] text-gray-200 px-5 py-8 md:px-9">
            <div className="mx-auto w-full max-w-6xl">
                <div className="flex items-start gap-3 mb-8">
                    <div className="mt-1 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-indigo-400">
                        <FiShield size={24} />
                    </div>

                    <div>
                        <p className="text-xs font-semibold tracking-[0.18em] text-indigo-400">
                            DATA BREACH AUDIT
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold text-white">
                            Configure Data Breach Scan
                        </h1>
                        <p className="mt-2 text-sm text-gray-400">
                            Set the maximum number of pages the scanner should inspect before starting the scan.
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-700/70 bg-[#111827]/70 p-5 md:p-6">
                    <div className="mb-6">
                        <label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                            <FiGlobe size={14} />
                            Target Website
                        </label>
                        <div className="rounded-lg border border-slate-700 bg-[#070d1d] px-4 py-3 text-sm text-sky-300 break-all">
                            {targetUrl || "Website URL unavailable"}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="max-pages"
                                className="mb-2 block text-sm font-semibold text-gray-200"
                            >
                                Maximum Pages to Crawl
                            </label>
                            <input
                                id="max-pages"
                                type="number"
                                min="1"
                                max="1000"
                                step="1"
                                value={maxPages}
                                onChange={(event) => {
                                    setMaxPages(event.target.value);
                                    setPageError("");
                                }}
                                className="w-full rounded-lg border border-slate-700 bg-[#070d1d] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                placeholder="Enter maximum pages"
                            />
                            <p className={`mt-2 text-xs ${pageError || pageLimitMessage ? "text-red-400" : "text-slate-500"}`}>
                                {pageError || pageLimitMessage || "Enter a value between 1 and 1000."}
                            </p>
                        </div>

                        <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/[0.07] p-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-indigo-300">
                                <FiClock size={16} />
                                Scan Configuration
                            </div>
                            <p className="mt-3 text-sm leading-6 text-gray-300">
                                The scanner will inspect up to{" "}
                                <span className="font-semibold text-white">
                                    {isValidPageLimit ? parsedPages : "—"}
                                </span>{" "}
                                pages, subject to website availability and scanner limits.
                            </p>
                            <p className="mt-2 text-xs leading-5 text-slate-400">
                                Actual scan duration depends on the website response time and the checks performed on each page.
                            </p>
                        </div>
                    </div>

                    <div className="mt-7 rounded-lg border border-slate-700 bg-[#070d1d]/70 p-4">
                        <h2 className="text-sm font-semibold text-gray-200">
                            Authentication
                        </h2>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                            The scan will use the access configuration already associated with this audit. If the target website requires authentication, ensure its credentials are configured for the scanner.
                        </p>
                    </div>

                    <div className="mt-7 flex flex-col-reverse justify-end gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            disabled={starting}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 px-5 py-3 text-sm text-gray-200 transition hover:bg-slate-800 disabled:opacity-50"
                        >
                            <FiArrowLeft size={16} />
                            Back
                        </button>

                        <button
                            type="button"
                            onClick={handleStartScan}
                            disabled={starting || !isValidPageLimit || !auditId || !targetUrl}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {starting ? (
                                <>
                                    <FiLoader size={16} className="animate-spin" />
                                    Starting Scan...
                                </>
                            ) : (
                                <>
                                    <FiPlay size={16} />
                                    Start Data Breach Scan
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
