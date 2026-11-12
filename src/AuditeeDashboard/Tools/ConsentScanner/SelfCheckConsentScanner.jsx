
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, LoaderCircle } from "lucide-react";

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
                authentication_required: configuration.authentication_required || false,
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
        <div className="min-h-screen bg-[#070d1d] text-white">
            <div className="mx-auto max-w-5xl px-4 py-8">
                <button
                    type="button"
                    onClick={() => navigate("/devdashboard")}
                    className="mb-8 flex items-center gap-2 text-indigo-400 hover:text-indigo-300"
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </button>

                <div className="mb-8 flex items-start gap-4">
                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3">
                        <ShieldCheck
                            size={28}
                            className="text-indigo-400"
                        />
                    </div>

                    <div>
                        <h1 className="text-2xl font-semibold">
                            Consent Management Scanner
                        </h1>

                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                            Start an independent website consent scan
                            from Self Check. Configure the target URL
                            and set a crawl limit. Authentication details
                            are optional and can be provided when required.
                        </p>
                    </div>
                </div>

                <div className="mb-6 rounded-xl border border-slate-800 bg-[#0b1324] p-5">
                    <h2 className="font-medium text-slate-200">
                        Configure a new scan
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        The scan's status and progress will be available
                        under View Your Scans after the server accepts
                        the request.
                    </p>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-5 rounded-lg border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-300"
                    >
                        {error}
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

                {loading && (
                    <div
                        role="status"
                        className="mt-4 flex items-center gap-2 text-sm text-indigo-300"
                    >
                        <LoaderCircle
                            size={16}
                            className="animate-spin"
                        />
                        Submitting scan request...
                    </div>
                )}
            </div>
        </div>
    );
}
