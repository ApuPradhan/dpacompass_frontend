
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiArrowLeft,
    FiShield,
    FiGlobe,
    FiPlay,
    FiClock,
    FiSettings,
    FiAlertCircle,
    FiInfo,
} from "react-icons/fi";
import { breachApi } from "../../../utilities/breachApi";

const INITIAL_FORM = {
    website_url: "",
    max_pages: 100,
    max_depth: 2,
};
const NumberSlider = ({
    label,
    name,
    value,
    min,
    max,
    step = 1,
    unit = "",
    description,
    onChange,
}) => {
    const updateValue = (newValue) => {
        onChange({
            target: {
                name,
                value: newValue,
            },
        });
    };

    return (
        <div className="w-full">

            <div className="flex items-center justify-between gap-3 mb-3">
                <label className="text-sm font-semibold text-slate-200">
                    {label}
                </label>

                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        onChange={(e) => updateValue(e.target.value)}
                        className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white text-center outline-none focus:border-indigo-500"
                    />

                    {unit && (
                        <span className="text-xs text-slate-400 min-w-12">
                            {unit}
                        </span>
                    )}
                </div>
            </div>

            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={Math.min(max, Math.max(min, Number(value) || min))}
                onChange={(e) => updateValue(e.target.value)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-indigo-500 bg-slate-700"
                style={{
                    accentColor: "#6366f1",
                }}
            />

            <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>{min}{unit ? ` ${unit}` : ""}</span>
                <span>{max}{unit ? ` ${unit}` : ""}</span>
            </div>

            {description && (
                <p className="text-xs text-slate-500 mt-2">
                    {description}
                </p>
            )}
        </div>
    );
};
const SelfCheckDataBreachScanner = ({ onBack }) => {
    const navigate = useNavigate();
    const handleBack = () => {
        if (typeof onBack === "function") {
            onBack();
        } else {
            navigate(-1);
        }
    };

    const [form, setForm] = useState(INITIAL_FORM);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));

        setError("");
    };

    // Approximate planning estimate.
    // Replace the assumed average page-processing time with
    // measured scanner throughput when available.
    // Estimate: 10 seconds setup + 5 seconds per page.
const estimatedDuration = useMemo(() => {
    const pages = Number(form.max_pages);

    if (!Number.isInteger(pages) || pages < 1) return 0;

    return 10 + pages * 5;
}, [form.max_pages]);

const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
        return `${remainingSeconds} seconds`;
    }

    if (remainingSeconds === 0) {
        return `${minutes} min`;
    }

    return `${minutes} min ${remainingSeconds} sec`;
};

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const url = form.website_url.trim();

        let parsedUrl;

        try {
            parsedUrl = new URL(url);
        } catch {
            setError("Please enter a valid website URL.");
            return;
        }

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            setError("Only HTTP and HTTPS URLs are supported.");
            return;
        }

        const maxPages = Number(form.max_pages);

        if (
            !Number.isInteger(maxPages) ||
            maxPages < 1 ||
            maxPages > 5000
        ) {
            setError("Number of Pages must be an integer between 1 and 50000.");
            return;
        }

        // The user record is stored in localStorage as a JSON string.
        let userData = {};

        try {
            userData = JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
            setError("Unable to read user information. Please sign in again.");
            return;
        }

        const username = userData?.username;

        if (!username) {
            setError("Username not found. Please sign in again.");
            return;
        }

        // Self-Check does not send public_audit_id.
        // max_depth is fixed to 2 by the frontend.
        const payload = {
            username,
            url: url.trim(),
            max_pages: Number(maxPages),
            max_depth: 2,
        };

        try {
            setIsSubmitting(true);

            // Data Breach Scanner is a separate backend.
            // This request intentionally does not use DPACOMPASS fetchWithAuth.
            const data = await breachApi("/api/scanner/webscan/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (data?.status !== "success") {
                throw new Error(
                    data?.message ||
                    data?.error_message ||
                    data?.error ||
                    "Unable to queue the Data Breach scan."
                );
            }

            // Open the Self-Check scan history after the backend queues the job.
            navigate("/user/self-check/breach-scans", {
                state: {
                    newScanId: data.public_audit_id,
                    jobId: data.job_id,
                    scanResponse: data,
                },
            });
        } catch (err) {
            setError(
                err?.message || "Unable to start the scanner. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass =
        "w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10";

    const labelClass =
        "block text-sm font-semibold text-slate-200 mb-2";

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 md:px-8">

            <div className="max-w-5xl mx-auto">

                {/* BACK BUTTON */}

                <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium mb-8 transition"
                >
                    <FiArrowLeft size={17} />
                    Back
                </button>

                {/* PAGE HEADER */}

                <div className="flex items-start gap-4 mb-8">

                    <div className="w-14 h-14 shrink-0 flex items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                        <FiShield size={29} />
                    </div>

                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                            Data Breach Scanner
                        </h1>

                        <p className="text-sm md:text-base text-slate-400 mt-2 leading-relaxed">
                            Configure an independent website scan to identify
                            exposed personal information and potential data
                            breach indicators.
                        </p>
                    </div>

                </div>

                {/* INFORMATION PANEL */}

                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 mb-7">
                    <div className="flex items-center gap-2 mb-2">
                        <FiInfo className="text-indigo-400" />
                        <h2 className="font-semibold">
                            Set up your scan
                        </h2>
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed">
                        Configure the target website and crawling limits.
                        Scan status and progress will be available under
                        View Your Scans after the server accepts the request.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>

                    {/* WEBSITE DETAILS */}

                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">

                        <div className="p-5 md:p-6">

                            <div className="flex items-center gap-3 mb-6">
                                <FiGlobe className="text-indigo-400" size={21} />
                                <h2 className="text-lg font-semibold">
                                    Website Details
                                </h2>
                            </div>

                            <label className={labelClass}>
                                Website URL <span className="text-red-400">*</span>
                            </label>

                            <input
                                type="url"
                                name="website_url"
                                value={form.website_url}
                                onChange={handleChange}
                                required
                                placeholder="https://example.com"
                                className={inputClass}
                            />

                            <p className="text-xs text-slate-500 mt-2">
                                Enter the publicly accessible website URL you
                                want to scan.
                            </p>
                        </div>
                    </div>

                    {/* SCAN CONFIGURATION */}

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 mb-6">

                        <div className="flex items-center gap-3 mb-2">
                            <FiSettings className="text-indigo-400" size={21} />
                            <h2 className="text-lg font-semibold">
                                Scan Settings
                            </h2>
                        </div>

                        <p className="text-sm text-slate-400 mb-7">
                            Choose how many pages the scanner should check.
                        </p>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">

                            <NumberSlider
                                label="Number of Pages"
                                name="max_pages"
                                value={form.max_pages}
                                min={10}
                                max={5000}
                                step={2}
                                unit="pages"
                                description="Choose the maximum number of pages to check."
                                onChange={handleChange}
                            />

                        </div>
                    </div>

                    {/* ESTIMATED DURATION */}

                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-5 md:p-6 mb-6">

                        <div className="flex items-center gap-3 mb-4">
                            <FiClock className="text-indigo-400" size={22} />
                            <h2 className="text-lg font-semibold">
                                Estimated Time
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                            <div>
                                <p className="text-xs text-slate-400">
                                    Number of Pages
                                </p>
                                <p className="text-xl font-bold mt-2">
                                    {Number(form.max_pages) || 0}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400">
                                    Estimated Time
                                </p>
                                <p className="text-xl font-bold text-indigo-400 mt-2">
                                    {formatDuration(estimatedDuration)}
                                </p>
                            </div>

                            {/* <div>
                                <p className="text-xs text-slate-400">
                                    Maximum Allowed Time
                                </p>
                                <p className="text-xl font-bold mt-2">
                                    {form.max_scan_duration || 0} minutes
                                </p>
                            </div> */}

                        </div>

                        <p className="text-xs text-slate-500 mt-5 leading-relaxed">
                            Approximate estimate based on 10 seconds of setup
                            time and 5 seconds per page. Actual duration may
                            vary depending on website response time and
                            network conditions.
                        </p>
                    </div>

                    {/* ERROR */}

                    {error && (
                        <div className="flex items-start gap-3 p-4 mb-5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                            <FiAlertCircle className="shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}

                    {/* SUBMIT */}

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                            <div>
                                <h3 className="font-semibold">
                                    Ready to start?
                                </h3>

                                <p className="text-xs text-slate-400 mt-2">
                                    The scan will run according to the
                                    configuration provided above.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition disabled:opacity-50"
                            >
                                <FiPlay size={17} />
                                {isSubmitting
                                    ? "Starting Scanner..."
                                    : "Start Scan"}
                            </button>

                        </div>

                    </div>

                </form>

            </div>
        </div>
    );
};

export default SelfCheckDataBreachScanner;
