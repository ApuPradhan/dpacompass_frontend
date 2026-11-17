import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import {
    ArrowLeft, RefreshCw, Globe, Clock3, Eye, LoaderCircle,
    CircleCheck, CircleX, CircleAlert, Layers3, ShieldCheck, X, Download, FileText,
} from "lucide-react";
import {
    getSelfCheckBreachScanStatus,
    getSelfCheckBreachScanHTMLReport,
} from "../../../utilities/breachApi";

const statusOf = (s) => String(s?.scan_status ?? s?.status ?? s?.result?.scan_status ?? "UNKNOWN").toUpperCase();
const idOf = (s) => s?.public_audit_id ?? s?.job_id ?? s?.id ?? s?.audit_id;
const urlOf = (s) => s?.url ?? s?.target_url ?? s?.website_url ?? "URL unavailable";
const dateOf = (v) => {
    if (!v) return "Not available";
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? "Not available" : d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
};

const active = ["PENDING", "QUEUED", "RUNNING", "IN_PROGRESS", "PROCESSING"];
const done = ["COMPLETED", "SUCCESS", "SUCCEEDED"];
const failed = ["FAILED", "ERROR", "CANCELLED"];

const sections = [
    { key: "QUEUED", title: "Queued Scans", description: "Scans submitted and waiting to begin.", color: "text-amber-300", badge: "border-amber-700 bg-amber-950/30 text-amber-300" },
    { key: "RUNNING", title: "Running Scans", description: "Scans currently being processed.", color: "text-blue-300", badge: "border-blue-700 bg-blue-950/30 text-blue-300" },
    { key: "COMPLETED", title: "Completed Scans", description: "Scans that have finished successfully.", color: "text-emerald-300", badge: "border-emerald-700 bg-emerald-950/30 text-emerald-300" },
    { key: "FAILED", title: "Failed Scans", description: "Scans that failed or were cancelled.", color: "text-red-300", badge: "border-red-800 bg-red-950/30 text-red-300" },
    { key: "OTHER", title: "Other Status", description: "Scans with an unclassified status.", color: "text-slate-300", badge: "border-slate-700 bg-slate-800/60 text-slate-300" },
];

const groupScans = (scans) => {
    const groups = { QUEUED: [], RUNNING: [], COMPLETED: [], FAILED: [], OTHER: [] };
    scans.forEach((scan) => {
        const status = statusOf(scan);
        if (["PENDING", "QUEUED"].includes(status)) groups.QUEUED.push(scan);
        else if (["RUNNING", "IN_PROGRESS", "PROCESSING"].includes(status)) groups.RUNNING.push(scan);
        else if (done.includes(status)) groups.COMPLETED.push(scan);
        else if (failed.includes(status)) groups.FAILED.push(scan);
        else groups.OTHER.push(scan);
    });
    return groups;
};

function StatusIcon({ status }) {
    if (done.includes(status)) return <CircleCheck size={17} className="text-emerald-400" />;
    if (failed.includes(status)) return <CircleX size={17} className="text-red-400" />;
    if (["RUNNING", "IN_PROGRESS", "PROCESSING"].includes(status)) return <LoaderCircle size={17} className="animate-spin text-blue-400" />;
    if (["PENDING", "QUEUED"].includes(status)) return <Clock3 size={17} className="text-amber-400" />;
    return <CircleAlert size={17} className="text-slate-400" />;
}

export default function SelfCheckDataBreachScans() {
    const navigate = useNavigate();
    const location = useLocation();
    const newScan = location.state?.newScan ?? location.state?.scanResponse;
    const newScanId = location.state?.newScanId ?? newScan?.public_audit_id ?? newScan?.job_id ?? location.state?.jobId;

    const [scans, setScans] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [selectedReport, setSelectedReport] = useState(null);
    const [reportLoadingId, setReportLoadingId] = useState(null);
    const [reportError, setReportError] = useState("");
    const [pdfLoading, setPdfLoading] = useState(false);
    const pollingRef = useRef(false);

    const loadScans = useCallback(async (manual = false) => {
        if (pollingRef.current) return;
        pollingRef.current = true;
        if (manual) setRefreshing(true);
        setError("");

        try {
            const [completedResponse, pendingResponse, runningResponse] = await Promise.all([
                getSelfCheckBreachScanStatus("COMPLETED"),
                getSelfCheckBreachScanStatus("PENDING"),
                getSelfCheckBreachScanStatus("RUNNING"),
            ]);

            const extractScans = (response, requestedStatus) => {
                const records = Array.isArray(response) ? response :
                    response?.scans ?? response?.results ??
                    response?.data?.scans ?? response?.data?.results ??
                    response?.data ?? [];

                if (!Array.isArray(records)) {
                    throw new Error(`Unexpected response format for ${requestedStatus} scans.`);
                }

                return records.map((scan) => ({
                    ...scan,
                    scan_status: scan?.scan_status ?? scan?.status ?? requestedStatus,
                }));
            };

            const allScans = [
                ...extractScans(completedResponse, "COMPLETED"),
                ...extractScans(pendingResponse, "PENDING"),
                ...extractScans(runningResponse, "RUNNING"),
            ];

            const uniqueScans = Array.from(new Map(
                allScans.map((scan, index) => [
                    String(idOf(scan) ?? `${statusOf(scan)}-${index}`),
                    scan,
                ])
            ).values());

            setScans(uniqueScans);
        } catch (err) {
            console.error("Unable to load Self-Check PII-in-Transit scans:", err);
            setError(err?.message || "Unable to load your PII-in-Transit scans.");
        } finally {
            pollingRef.current = false;
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { loadScans(); }, [loadScans]);

    useEffect(() => {
        if (!scans.some((scan) => active.includes(statusOf(scan)))) return undefined;
        const timer = window.setInterval(() => loadScans(), 4000);
        return () => window.clearInterval(timer);
    }, [scans, loadScans]);

    useEffect(() => {
        if (!newScanId) return;
        const found = scans.find((scan) => String(idOf(scan)) === String(newScanId));
        if (found) setSelected(found);
        else if (newScan) setSelected(newScan);
    }, [newScanId, newScan, scans]);

    // GET /api/audits/{audit_id}/html-report/
    const handleViewReport = async (scan) => {
        const auditId = scan.public_audit_id || scan.audit_id || scan.id;
        if (!auditId) {
            setReportError("Audit ID is unavailable. Cannot fetch the report.");
            return;
        }

        setReportError("");
        setReportLoadingId(String(auditId));

        try {
            const html = await getSelfCheckBreachScanHTMLReport(auditId);
            setSelectedReport({ ...scan, report_html: html });
        } catch (err) {
            console.error("Unable to load PII-in-Transit Scanner report:", err);
            setReportError(err?.message || "Unable to load the report.");
        } finally {
            setReportLoadingId(null);
        }
    };

    const handleDownloadReport = () => {
        if (!selectedReport?.report_html) return;
        const blob = new Blob([selectedReport.report_html], { type: "text/html;charset=utf-8" });
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `${selectedReport.public_audit_id || selectedReport.audit_id || "data_breach"}_report.html`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    };

    // Generate and download a PDF from the fetched HTML report.
    const handleDownloadPDF = async () => {
        if (!selectedReport?.report_html) {
            setReportError("No report available to download.");
            return;
        }

        setPdfLoading(true);
        setReportError("");

        let reportContainer = null;

        try {
            const parser = new DOMParser();
            const parsedDocument = parser.parseFromString(
                selectedReport.report_html,
                "text/html"
            );

            reportContainer = document.createElement("div");
            reportContainer.style.width = "190mm";
            reportContainer.style.padding = "8mm";
            reportContainer.style.backgroundColor = "#ffffff";
            reportContainer.style.color = "#000000";
            reportContainer.style.position = "fixed";
            reportContainer.style.left = "-10000px";
            reportContainer.style.top = "0";
            reportContainer.style.zIndex = "-1";

            // Copy report styles so the PDF resembles the HTML report.
            parsedDocument.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => {
                reportContainer.appendChild(node.cloneNode(true));
            });

            const content = document.createElement("div");
            const body = parsedDocument.body;

            if (body) {
                content.innerHTML = body.innerHTML;
            } else {
                content.innerHTML = parsedDocument.documentElement.innerHTML;
            }

            reportContainer.appendChild(content);
            document.body.appendChild(reportContainer);

            const reportId =
                selectedReport.public_audit_id ||
                selectedReport.audit_id ||
                "Data_Breach";

            await html2pdf()
                .set({
                    margin: [8, 8, 8, 8],
                    filename: `${reportId}_Report.pdf`,
                    image: { type: "jpeg", quality: 0.98 },
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        backgroundColor: "#ffffff",
                        logging: false,
                        scrollY: 0,
                    },
                    jsPDF: {
                        unit: "mm",
                        format: "a4",
                        orientation: "portrait",
                    },
                    pagebreak: {
                        mode: ["css", "legacy"],
                    },
                })
                .from(reportContainer)
                .save();
        } catch (err) {
            console.error("PDF generation failed:", err);
            setReportError(
                err?.message || "Unable to generate the PDF report."
            );
        } finally {
            if (reportContainer?.parentNode) {
                reportContainer.parentNode.removeChild(reportContainer);
            }
            setPdfLoading(false);
        }
    };

    const groups = useMemo(() => groupScans(scans), [scans]);
    const startNew = () => navigate("/user/self-check/data-breach-scanner");

    return (
        <div className="min-h-screen bg-[#070d1d] text-white">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <button onClick={() => navigate("/devdashboard")} className="mb-8 flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">My PII-in-Transit Scans</h1>
                        <p className="mt-2 text-sm text-slate-400">View submitted scans and monitor their execution status.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => loadScans(true)} disabled={refreshing} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0b1324] px-4 py-2.5 text-sm hover:bg-slate-800 disabled:opacity-60">
                            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
                        </button>
                        <button onClick={startNew} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium hover:bg-indigo-500">Start New Scan</button>
                    </div>
                </div>

                {error && <div role="alert" className="mb-6 rounded-lg border border-red-800 bg-red-950/30 p-4 text-sm text-red-300">{error}</div>}
                {reportError && (
                    <div role="alert" className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-red-800 bg-red-950/30 p-4 text-sm text-red-300">
                        <span>{reportError}</span>
                        <button onClick={() => setReportError("")} aria-label="Dismiss report error" className="text-red-300 hover:text-white"><X size={17} /></button>
                    </div>
                )}

                <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
                    {sections.map((section) => (
                        <div key={section.key} className="rounded-xl border border-slate-800 bg-[#0b1324] p-4">
                            <p className="text-sm text-slate-400">{section.title}</p>
                            <p className={`mt-2 text-2xl font-semibold ${section.color}`}>{groups[section.key].length}</p>
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-800 bg-[#0b1324] p-12 text-slate-400">
                        <LoaderCircle size={20} className="animate-spin" /> Fetching your scans...
                    </div>
                ) : scans.length === 0 ? (
                    <div className="rounded-xl border border-slate-800 bg-[#0b1324] p-10 text-center">
                        <ShieldCheck size={34} className="mx-auto text-slate-500" />
                        <h2 className="mt-4 text-lg font-semibold">No scans found</h2>
                        <p className="mt-2 text-sm text-slate-400">You have not submitted a Self-Check PII-in-Transit scan yet.</p>
                        <button onClick={startNew} className="mt-5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium hover:bg-indigo-500">Start Your First Scan</button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {sections.map((section) => (
                            <section key={section.key}>
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-semibold">{section.title}</h2>
                                        <p className="mt-1 text-sm text-slate-500">{section.description}</p>
                                    </div>
                                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${section.badge}`}>{groups[section.key].length}</span>
                                </div>

                                {groups[section.key].length === 0 ? (
                                    <div className="rounded-xl border border-slate-800 bg-[#0b1324] p-6 text-sm text-slate-500">No {section.title.toLowerCase()}.</div>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0b1324]">
                                        <table className="w-full min-w-[1100px]">
                                            <thead>
                                                <tr className="border-b border-slate-800 text-left text-xs text-slate-400">
                                                    <th className="px-5 py-4">Website</th>
                                                    <th className="px-5 py-4">Scan ID</th>
                                                    <th className="px-5 py-4">Job ID</th>
                                                    <th className="px-5 py-4">Submitted</th>
                                                    <th className="px-5 py-4">Pages</th>
                                                    <th className="px-5 py-4">Status</th>
                                                    <th className="px-5 py-4 text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {groups[section.key].map((scan, i) => {
                                                    const status = statusOf(scan);
                                                    const reportId = scan.public_audit_id || scan.audit_id || scan.id;
                                                    const isReportLoading = reportLoadingId === String(reportId);

                                                    return (
                                                        <tr key={idOf(scan) ?? i} className={`border-b border-slate-800 last:border-0 hover:bg-slate-900/50 ${String(idOf(selected)) === String(idOf(scan)) ? "bg-indigo-500/5" : ""}`}>
                                                            <td className="max-w-xs break-all px-5 py-4 text-sm">
                                                                <span className="inline-flex items-start gap-2"><Globe size={16} className="mt-0.5 shrink-0 text-indigo-400" />{urlOf(scan)}</span>
                                                            </td>
                                                            <td className="px-5 py-4 text-sm text-slate-300">{scan.public_audit_id ?? "N/A"}</td>
                                                            <td className="px-5 py-4 text-sm text-slate-400">{scan.job_id ?? "N/A"}</td>
                                                            <td className="px-5 py-4 text-sm text-slate-400">{dateOf(scan.created_at ?? scan.submitted_at ?? scan.started_at)}</td>
                                                            <td className="px-5 py-4 text-sm text-slate-400">{scan.max_pages ?? "N/A"}</td>
                                                            <td className="px-5 py-4">
                                                                <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs ${section.badge}`}>
                                                                    <StatusIcon status={status} />{status.replaceAll("_", " ")}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-4 text-center">
                                                                {done.includes(status) ? (
                                                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                                                        {/* Original scan-result/details action: keep this separate from the HTML report. */}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const publicAuditId = scan.public_audit_id;
                                                                                if (!publicAuditId) {
                                                                                    setError("Public Audit ID is unavailable for this completed scan.");
                                                                                    return;
                                                                                }
                                                                                setSelected(null);
                                                                                navigate(`/user/self-check/breach-scans/${encodeURIComponent(publicAuditId)}/result`);
                                                                            }}
                                                                            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/70 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-700"
                                                                            title="View Scan Result"
                                                                        >
                                                                            <Eye size={15} /> View Result
                                                                        </button>

                                                                        {/* Fetch and preview the generated HTML report. */}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleViewReport(scan)}
                                                                            disabled={reportLoadingId !== null}
                                                                            className="inline-flex items-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-600/15 px-3 py-2 text-sm font-medium text-indigo-300 transition hover:border-indigo-400 hover:bg-indigo-600/25 disabled:cursor-not-allowed disabled:opacity-50"
                                                                            title="View HTML Report"
                                                                        >
                                                                            {isReportLoading ? <LoaderCircle size={15} className="animate-spin" /> : <FileText size={15} />}
                                                                            {isReportLoading ? "Loading..." : "View Report"}
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setSelected(scan)}
                                                                        className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
                                                                    >
                                                                        <Eye size={16} /> View Details
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>
                )}

                {selected && (
                    <section className="mt-10 overflow-hidden rounded-xl border border-slate-800 bg-[#0b1324]">
                        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                            <div>
                                <h2 className="flex items-center gap-2 font-semibold"><Eye size={18} className="text-indigo-400" /> Scan Details</h2>
                                <p className="mt-1 break-all text-xs text-slate-500">{idOf(selected) ?? "Scan ID unavailable"}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">Close</button>
                        </div>

                        <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                ["Website URL", urlOf(selected)],
                                ["Username", selected.username ?? "Not available"],
                                ["Scan Status", statusOf(selected)],
                                ["Job ID", selected.job_id ?? "Not available"],
                                ["Maximum Pages", selected.max_pages ?? "Not available"],
                                ["Maximum Depth", selected.max_depth ?? "Not available"],
                                ["Execution Mode", selected.execution_mode ?? "Not available"],
                                ["Submitted At", dateOf(selected.created_at ?? selected.submitted_at ?? selected.started_at)],
                                ["Can Rerun", selected.can_rerun === true ? "Yes" : selected.can_rerun === false ? "No" : "Not available"],
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <p className="text-xs text-slate-500">{label}</p>
                                    <p className="mt-1 break-words text-sm text-slate-200">{value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-slate-800 p-5">
                            <div className="mb-3 flex items-center gap-2"><Layers3 size={17} className="text-indigo-400" /><h3 className="text-sm font-semibold text-slate-200">Selected Scanners</h3></div>
                            {Array.isArray(selected.selected_scanners) && selected.selected_scanners.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {selected.selected_scanners.map((scanner) => <span key={scanner} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">{scanner.replaceAll("_", " ")}</span>)}
                                </div>
                            ) : <p className="text-sm text-slate-500">Scanner selection details are not available.</p>}
                        </div>

                        {selected.error_message && (
                            <div className="border-t border-red-900/60 bg-red-950/20 p-5">
                                <p className="text-xs font-semibold uppercase tracking-wide text-red-300">Scan Error</p>
                                <p className="mt-2 break-words whitespace-pre-wrap text-sm text-red-200">{selected.error_message}</p>
                            </div>
                        )}

                        {selected.result && (
                            <div className="border-t border-slate-800 p-5">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Result Data</p>
                                <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-xs leading-5 text-slate-300">{JSON.stringify(selected.result, null, 2)}</pre>
                            </div>
                        )}
                    </section>
                )}

                <div className="mt-10 border-t border-slate-800 pt-5 text-center text-xs text-slate-500">Self-Check PII-in-Transit Scanner · DPACOMPASS</div>
            </div>

            {/* HTML REPORT PREVIEW MODAL */}
            {selectedReport?.report_html && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setSelectedReport(null);
                    }}
                >
                    <div className="flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#0b1324] shadow-2xl">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-2 text-indigo-400"><ShieldCheck size={20} /></div>
                                <div>
                                    <h2 className="font-semibold text-white">PII-in-Transit Scan Report</h2>
                                    <p className="mt-1 text-xs text-slate-400">{selectedReport.public_audit_id || selectedReport.audit_id || selectedReport.job_id || "Audit ID unavailable"}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={handleDownloadReport}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
                                >
                                    <Download size={14} />
                                    Download HTML
                                </button>

                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={pdfLoading}
                                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {pdfLoading ? (
                                        <LoaderCircle size={14} className="animate-spin" />
                                    ) : (
                                        <Download size={14} />
                                    )}
                                    {pdfLoading ? "Generating PDF..." : "Download PDF"}
                                </button>

                                <button
                                    onClick={() => setSelectedReport(null)}
                                    aria-label="Close report preview"
                                    className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                >
                                    <X size={17} />
                                </button>
                            </div>
                        </div>
                        <div className="min-h-0 flex-1 bg-slate-200 p-2 sm:p-4">
                            <iframe title="PII-in-Transit Scan Report" srcDoc={selectedReport.report_html} sandbox="" className="h-[75vh] w-full rounded-lg border border-slate-300 bg-white" />
                        </div>
                        <div className="border-t border-slate-800 px-5 py-3 text-xs text-slate-400">PII-in-Transit Scanner report loaded from the backend.</div>
                    </div>
                </div>
            )}
        </div>
    );
}
