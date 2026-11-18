
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ShieldCheck,
    LoaderCircle,
    AlertCircle,
    Globe,
    LockKeyhole,
    ClipboardCheck,
} from "lucide-react";

import AuditConfiguration from "../../../ConsentScannerModule/Consent2.0/components/AuditConfiguration";
import { startSelfCheckConsentScan } from "./selfCheckConsentApi";

export default function SelfCheckConsentScanner() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleStartScan = async (configuration) => {
        if (loading) return;

        setLoading(true);
        setError("");

        let dpacompassUsername = "";

        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            dpacompassUsername = user.username || "";
        } catch (error) {
            console.error("Failed to parse stored user data:", error);
        }

        try {
            const response = await startSelfCheckConsentScan({
                url: configuration.url,
                max_pages: configuration.max_pages,
                authentication_required:
                    configuration.authentication_required || false,
                username: configuration.username || "",
                password: configuration.password || "",
                dpacompass_username: dpacompassUsername,
            });

            const scanId =
                response.scan_id ??
                response.public_audit_id ??
                response.id;

            if (!scanId) {
                throw new Error(
                    "The server did not return a scan identifier."
                );
            }

            navigate("/user/self-check/scans", {
                state: { newScanId: String(scanId) },
            });
        } catch (err) {
            setError(
                err.message || "Unable to start the consent scan."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F7FB] text-[#14213D]">
            <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">

                {/* Back Navigation */}
                <button
                    type="button"
                    onClick={() => navigate("/devdashboard")}
                    className="mb-6 inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#075EB5] transition hover:bg-blue-50"
                >
                    <ArrowLeft size={17} />
                    Back to Dashboard
                </button>

                {/* Page Header */}
                <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-[#075EB5] shadow-sm">
                        <ShieldCheck size={29} strokeWidth={1.8} />
                    </div>

                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#075EB5]">
                                Self Check
                            </span>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span className="text-xs font-medium text-slate-400">
                                Consent Management
                            </span>
                        </div>

                        <h1 className="text-2xl font-extrabold tracking-tight text-[#14213D] sm:text-3xl">
                            Consent Management Scanner
                        </h1>

                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                            Start an independent website consent scan from
                            Self Check. Configure the target URL and set a
                            crawl limit. Authentication details are optional
                            and can be provided when required.
                        </p>
                    </div>
                </div>

                {/* Information Card */}
                <div className="mb-6 grid gap-4 md:grid-cols-3">

                    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="rounded-xl bg-blue-50 p-2.5 text-[#075EB5]">
                            <Globe size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#14213D]">
                                Website Scanning
                            </h3>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Scan the configured website and discover
                                consent-related elements.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                            <LockKeyhole size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#14213D]">
                                Authentication Support
                            </h3>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Provide login credentials when the target
                                website requires authentication.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                            <ClipboardCheck size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#14213D]">
                                Scan Progress
                            </h3>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Monitor execution steps and assessment
                                results after submitting the scan.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Configuration Section */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 bg-[#F8FAFD] px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2 text-[#075EB5]">
                                <ShieldCheck size={19} />
                            </div>

                            <div>
                                <h2 className="text-base font-bold text-[#14213D]">
                                    Configure a New Scan
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Provide the website details and scanning
                                    configuration below.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        {/* Error Message */}
                        {error && (
                            <div
                                role="alert"
                                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700"
                            >
                                <AlertCircle
                                    size={19}
                                    className="mt-0.5 shrink-0"
                                />
                                <div>
                                    <p className="font-semibold">
                                        Unable to start scan
                                    </p>
                                    <p className="mt-1 text-xs leading-5">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div
                            className={
                                loading
                                    ? "pointer-events-none opacity-60"
                                    : ""
                            }
                        >
                            <AuditConfiguration
                                onStartAudit={handleStartScan}
                            />
                        </div>

                        {/* Submission Status */}
                        {loading && (
                            <div
                                role="status"
                                className="mt-5 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3.5"
                            >
                                <LoaderCircle
                                    size={19}
                                    className="animate-spin text-[#075EB5]"
                                />

                                <div>
                                    <p className="text-sm font-semibold text-[#075EB5]">
                                        Submitting scan request...
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Please wait while the server processes
                                        your request.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Bottom Information */}
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3.5">
                    <div className="mt-0.5 text-[#075EB5]">
                        <ClipboardCheck size={17} />
                    </div>

                    <div>
                        <p className="text-xs font-bold text-[#173B70]">
                            What happens after submission?
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">
                            Once the server accepts your request, you will be
                            redirected to View Your Scans, where you can
                            monitor scan execution and access the assessment
                            results.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 border-t border-slate-200 py-5 text-center">
                    <p className="text-[10px] font-semibold tracking-wider text-slate-400">
                        DPACOMPASS · DATA PRIVACY · SECURITY · COMPLIANCE
                    </p>
                </div>
            </div>
        </div>
    );
}
