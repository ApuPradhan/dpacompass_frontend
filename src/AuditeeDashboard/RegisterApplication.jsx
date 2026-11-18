
import { useState, useEffect } from "react";
import {
    ArrowLeft,
    FileText,
    Globe,
    Database,
    Server,
    ShieldCheck,
    UserRound,
    LockKeyhole,
    Building2,
    Layers,
    Save,
    X,
    CheckCircle2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

// ============================================================
// REUSABLE FORM INPUT
// ============================================================

const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-200 " +
    "bg-white text-slate-800 placeholder-slate-400 text-sm " +
    "outline-none transition-all " +
    "focus:border-blue-400 focus:ring-2 focus:ring-blue-100 " +
    "disabled:bg-slate-50 disabled:text-slate-400";

const labelClass =
    "block text-sm font-semibold text-slate-700 mb-2";

function FormInput({
    label,
    name,
    value,
    onChange,
    placeholder,
    type = "text",
    required = false,
    disabled = false,
}) {
    return (
        <div>
            <label htmlFor={name} className={labelClass}>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <input
                id={name}
                type={type}
                name={name}
                value={value || ""}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={inputClass}
            />
        </div>
    );
}

// ============================================================
// REUSABLE TEXTAREA
// ============================================================

function FormTextarea({
    label,
    name,
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
}) {
    return (
        <div>
            <label htmlFor={name} className={labelClass}>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <textarea
                id={name}
                name={name}
                value={value || ""}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                rows={4}
                className={`${inputClass} resize-y min-h-[110px]`}
            />
        </div>
    );
}

// ============================================================
// REUSABLE SELECT
// ============================================================

function FormSelect({
    label,
    name,
    value,
    onChange,
    options = [],
    placeholder = "Select an option",
    required = false,
    disabled = false,
}) {
    return (
        <div>
            <label htmlFor={name} className={labelClass}>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <select
                id={name}
                name={name}
                value={value || ""}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className={`${inputClass} cursor-pointer`}
            >
                <option value="">{placeholder}</option>

                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

// ============================================================
// SECTION HEADER
// ============================================================

function SectionHeader({ icon: Icon, title, description, color = "blue" }) {
    const colors = {
        blue: "bg-blue-50 text-[#075EB5] border-blue-100",
        violet: "bg-violet-50 text-violet-700 border-violet-100",
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    };

    return (
        <div className="flex items-center gap-3 mb-6">
            <div
                className={`w-11 h-11 shrink-0 rounded-xl border flex items-center justify-center ${colors[color]}`}
            >
                <Icon size={22} />
            </div>

            <div>
                <h3 className="text-lg font-bold text-[#173B70]">
                    {title}
                </h3>

                {description && (
                    <p className="text-sm text-slate-500 mt-1">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function RegisterApplication() {
    const navigate = useNavigate();

    // =========================
    // FORM DATA
    // =========================

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "",
        environment: "",

        // Web Application
        url: "",
        authenticationRequired: "no",
        webUsername: "",
        webPassword: "",

        // Database
        databaseName: "",
        databaseType: "",
        databaseHost: "",
        databasePort: "",
        databaseUsername: "",
        databasePassword: "",
    });

    const [applicationTypes, setApplicationTypes] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // =========================
    // SAFE JSON
    // =========================

    const safeJson = async (res) => {
        const text = await res.text();

        try {
            return JSON.parse(text);
        } catch {
            throw new Error("Invalid server response");
        }
    };

    // =========================
    // FETCH APPLICATION TYPES
    // =========================

    const fetchTypes = async () => {
        try {
            const res = await fetchWithAuth(
                `/api/applications/types/`,
                {
                    method: "GET",
                }
            );

            const data = await safeJson(res);

            if (!res.ok) {
                throw new Error(
                    data?.detail || "Failed to fetch application types"
                );
            }

            setApplicationTypes(data.data || []);
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        } finally {
            setLoadingTypes(false);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    // =========================
    // SELECTED APPLICATION TYPE
    // =========================

    const selectedApplicationType = applicationTypes.find(
        (app) => app.id === formData.type
    );

    const selectedTypeName =
        selectedApplicationType?.name?.toLowerCase() || "";

    const isWebApplication =
        selectedTypeName === "web application";

    const isDatabase =
        selectedTypeName === "database";

    // =========================
    // CHANGE HANDLER
    // =========================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "type"
                    ? parseInt(value, 10) || ""
                    : value,
        }));
    };

    // =========================
    // APPLICATION TYPE CHANGE
    // =========================

    const handleApplicationTypeChange = (e) => {
        const value = e.target.value;
        const selectedId = parseInt(value, 10) || "";

        setFormData((prev) => ({
            ...prev,

            type: selectedId,

            // Reset Web Application fields
            url: "",
            authenticationRequired: "no",
            webUsername: "",
            webPassword: "",

            // Reset Database fields
            databaseName: "",
            databaseType: "",
            databaseHost: "",
            databasePort: "",
            databaseUsername: "",
            databasePassword: "",
        }));
    };

    // =========================
    // VALIDATION
    // =========================

    const basicRequiredFields = [
        "name",
        "description",
        "type",
        "environment",
    ];

    let requiredFields = [...basicRequiredFields];

    // -------------------------
    // WEB APPLICATION
    // -------------------------

    if (isWebApplication) {
        requiredFields.push("url");

        if (formData.authenticationRequired === "yes") {
            requiredFields.push(
                "webUsername",
                "webPassword"
            );
        }
    }

    // -------------------------
    // DATABASE
    // -------------------------

    if (isDatabase) {
        requiredFields.push(
            "databaseName",
            "databaseType",
            "databaseHost",
            "databasePort",
            "databaseUsername",
            "databasePassword"
        );
    }

    const isFormValid = requiredFields.every(
        (field) =>
            formData[field]
                ?.toString()
                .trim() !== ""
    );

    // =========================
    // SUBMIT
    // =========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid) {
            toast.warning("Please fill all required fields");
            return;
        }

        // =========================
        // BUILD PAYLOAD
        // =========================

        const payload = {
            // Common Application fields
            name: formData.name,
            description: formData.description,
            type: formData.type,
            environment: formData.environment,
        };

        // =========================
        // WEB APPLICATION PAYLOAD
        // =========================

        if (isWebApplication) {
            payload.url = formData.url;

            payload.authentication_required =
                formData.authenticationRequired === "yes";

            if (formData.authenticationRequired === "yes") {
                payload.web_username = formData.webUsername;
                payload.web_password = formData.webPassword;
            } else {
                payload.web_username = null;
                payload.web_password = null;
            }
        }

        // =========================
        // DATABASE PAYLOAD
        // =========================

        if (isDatabase) {
            payload.database_name = formData.databaseName;
            payload.database_type = formData.databaseType;
            payload.database_host = formData.databaseHost;
            payload.database_port = formData.databasePort;
            payload.database_username = formData.databaseUsername;
            payload.database_password = formData.databasePassword;
        }

        try {
            setSubmitting(true);

            const res = await fetchWithAuth(
                `/api/applications/create/`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                }
            );

            const data = await safeJson(res);

            if (!res.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    "Failed to create application"
                );
            }

            const applicationId = data?.data?.id;

            if (!applicationId) {
                throw new Error(
                    "Application ID missing from response"
                );
            }

            toast.success(
                "Application created. Redirecting to dashboard.."
            );

            setTimeout(() => {
                navigate("/devdashboard");
            }, 2000);

            return;
        } catch (err) {
            console.error(err);

            toast.error(
                err.message || "Server error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    // =========================
    // MAIN UI
    // =========================

    return (
        <div className="min-h-screen w-full bg-[#F4F7FB] text-slate-800">

            {/* ==================================================
                TOP NAVIGATION
            ================================================== */}

            <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
                <div className="w-full px-5 md:px-8 py-4 flex items-center justify-between gap-4">

                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                            <ShieldCheck
                                size={24}
                                className="text-[#075EB5]"
                            />
                        </div>

                        <div>
                            <h1 className="text-lg font-bold text-[#173B70]">
                                DPACOMPASS
                            </h1>

                            <p className="text-xs text-slate-500">
                                Application Registration
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/devdashboard")}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-blue-50 hover:text-[#075EB5] hover:border-blue-200 transition cursor-pointer"
                    >
                        <ArrowLeft size={17} />
                        <span className="hidden sm:inline">
                            Back to Dashboard
                        </span>
                        <span className="sm:hidden">
                            Dashboard
                        </span>
                    </button>
                </div>
            </header>

            {/* ==================================================
                PAGE CONTENT
            ================================================== */}

            <main className="w-full px-4 py-7 md:px-8 md:py-9">

                {/* PAGE HEADING */}

                <div className="mb-7">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <FileText
                                size={21}
                                className="text-[#075EB5]"
                            />
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold text-[#14213D]">
                            Register Application
                        </h2>
                    </div>

                    <p className="text-sm md:text-base text-slate-500 ml-0 md:ml-[52px]">
                        Provide the application details and configuration to register it on DPACOMPASS.
                    </p>
                </div>

                {/* ==================================================
                    REGISTRATION FORM
                ================================================== */}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* ==================================================
                        GENERAL INFORMATION
                    ================================================== */}

                    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">

                        <SectionHeader
                            icon={Layers}
                            title="General Information"
                            description="Enter the basic details of the application."
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7">

                            <FormInput
                                label="Application Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter application name"
                                required
                                disabled={submitting}
                            />

                            <FormSelect
                                label="Environment"
                                name="environment"
                                value={formData.environment}
                                onChange={handleChange}
                                required
                                disabled={submitting}
                                placeholder="Select environment"
                                options={[
                                    { value: "Production", label: "Production" },
                                    { value: "Staging", label: "Staging" },
                                    { value: "Development", label: "Development" },
                                ]}
                            />

                            <div className="lg:col-span-2">
                                <FormTextarea
                                    label="Application Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the purpose and functionality of the application"
                                    required
                                    disabled={submitting}
                                />
                            </div>

                            <div>
                                <FormSelect
                                    label="Application Type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleApplicationTypeChange}
                                    required
                                    disabled={submitting || loadingTypes}
                                    placeholder={
                                        loadingTypes
                                            ? "Loading application types..."
                                            : "Select application type"
                                    }
                                    options={applicationTypes.map((app) => ({
                                        value: app.id,
                                        label: app.name,
                                    }))}
                                />

                                {!loadingTypes && applicationTypes.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-2">
                                        No application types are currently available.
                                    </p>
                                )}
                            </div>

                            <div className="flex items-end">
                                <div className="w-full rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                                    <div className="flex items-center gap-2 text-[#075EB5]">
                                        <InfoIcon />
                                        <span className="text-sm font-semibold">
                                            Registration Information
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-600 mt-1.5 leading-5">
                                        Additional configuration fields will appear based on the selected application type.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ==================================================
                        WEB APPLICATION CONFIGURATION
                    ================================================== */}

                    {isWebApplication && (
                        <section className="bg-white border border-blue-200 rounded-2xl shadow-sm p-6 md:p-8">

                            <SectionHeader
                                icon={Globe}
                                title="Web Application Configuration"
                                description="Configure the website URL and authentication details."
                                color="blue"
                            />

                            <div className="space-y-6">

                                <FormInput
                                    label="Application URL"
                                    name="url"
                                    type="url"
                                    value={formData.url}
                                    onChange={handleChange}
                                    placeholder="https://example.com"
                                    required
                                    disabled={submitting}
                                />

                                {/* AUTHENTICATION */}

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                                    <div className="flex items-center gap-2 mb-4">
                                        <LockKeyhole
                                            size={19}
                                            className="text-[#075EB5]"
                                        />

                                        <h4 className="text-sm font-bold text-slate-800">
                                            Authentication Configuration
                                        </h4>
                                    </div>

                                    <p className="text-sm text-slate-500 mb-4">
                                        Does this web application require authentication to access?
                                    </p>

                                    <div className="flex flex-wrap gap-4">

                                        {[
                                            { value: "yes", label: "Yes, authentication required" },
                                            { value: "no", label: "No authentication required" },
                                        ].map((option) => (
                                            <label
                                                key={option.value}
                                                className={`flex items-center gap-3 px-5 py-3 rounded-xl border cursor-pointer transition ${
                                                    formData.authenticationRequired === option.value
                                                        ? "border-blue-300 bg-blue-50"
                                                        : "border-slate-200 bg-white hover:bg-slate-50"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="authenticationRequired"
                                                    value={option.value}
                                                    checked={
                                                        formData.authenticationRequired === option.value
                                                    }
                                                    onChange={handleChange}
                                                    disabled={submitting}
                                                    className="w-4 h-4 accent-[#075EB5]"
                                                />

                                                <span className="text-sm font-medium text-slate-700">
                                                    {option.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* AUTH CREDENTIALS */}

                                {formData.authenticationRequired === "yes" && (
                                    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-5">

                                        <div className="flex items-center gap-2 mb-5">
                                            <UserRound
                                                size={19}
                                                className="text-[#075EB5]"
                                            />

                                            <h4 className="text-sm font-bold text-[#173B70]">
                                                Application Credentials
                                            </h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                            <FormInput
                                                label="Username"
                                                name="webUsername"
                                                value={formData.webUsername}
                                                onChange={handleChange}
                                                placeholder="Enter application username"
                                                required
                                                disabled={submitting}
                                            />

                                            <FormInput
                                                label="Password"
                                                name="webPassword"
                                                type="password"
                                                value={formData.webPassword}
                                                onChange={handleChange}
                                                placeholder="Enter application password"
                                                required
                                                disabled={submitting}
                                            />
                                        </div>

                                        <p className="text-xs text-slate-500 mt-4">
                                            Provide credentials that can be used to access the application during the audit.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* ==================================================
                        DATABASE CONFIGURATION
                    ================================================== */}

                    {isDatabase && (
                        <section className="bg-white border border-violet-200 rounded-2xl shadow-sm p-6 md:p-8">

                            <SectionHeader
                                icon={Database}
                                title="Database Configuration"
                                description="Provide the connection details required to register the database."
                                color="violet"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-7">

                                <FormInput
                                    label="Database Name"
                                    name="databaseName"
                                    value={formData.databaseName}
                                    onChange={handleChange}
                                    placeholder="Enter database name"
                                    required
                                    disabled={submitting}
                                />

                                <FormSelect
                                    label="Database Type"
                                    name="databaseType"
                                    value={formData.databaseType}
                                    onChange={handleChange}
                                    required
                                    disabled={submitting}
                                    placeholder="Select database type"
                                    options={[
                                        { value: "mysql", label: "MySQL" },
                                        { value: "postgresql", label: "PostgreSQL" },
                                        { value: "redis", label: "Redis" },
                                        { value: "oracle", label: "Oracle" },
                                        { value: "mongodb", label: "MongoDB" },
                                    ]}
                                />

                                <FormInput
                                    label="Database Host"
                                    name="databaseHost"
                                    value={formData.databaseHost}
                                    onChange={handleChange}
                                    placeholder="localhost / IP / hostname"
                                    required
                                    disabled={submitting}
                                />

                                <FormInput
                                    label="Port"
                                    name="databasePort"
                                    type="text"
                                    value={formData.databasePort}
                                    onChange={handleChange}
                                    placeholder="e.g. 5432"
                                    required
                                    disabled={submitting}
                                />

                                <FormInput
                                    label="Database Username"
                                    name="databaseUsername"
                                    value={formData.databaseUsername}
                                    onChange={handleChange}
                                    placeholder="Enter database username"
                                    required
                                    disabled={submitting}
                                />

                                <FormInput
                                    label="Database Password"
                                    name="databasePassword"
                                    type="password"
                                    value={formData.databasePassword}
                                    onChange={handleChange}
                                    placeholder="Enter database password"
                                    required
                                    disabled={submitting}
                                />
                            </div>

                            <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                <LockKeyhole
                                    size={19}
                                    className="text-amber-600 shrink-0 mt-0.5"
                                />

                                <p className="text-sm text-amber-800 leading-6">
                                    Ensure that the database credentials provided have the necessary permissions for the intended audit operations.
                                </p>
                            </div>
                        </section>
                    )}

                    {/* ==================================================
                        FORM ACTIONS
                    ================================================== */}

                    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-5 md:px-8">

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                    <CheckCircle2
                                        size={21}
                                        className="text-emerald-600"
                                    />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Ready to register?
                                    </p>

                                    <p className="text-xs text-slate-500 mt-1">
                                        Review the details before submitting the application.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row gap-3">

                                <button
                                    type="button"
                                    onClick={() => navigate("/devdashboard")}
                                    disabled={submitting}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <X size={17} />
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={!isFormValid || submitting}
                                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold shadow-sm transition ${
                                        isFormValid && !submitting
                                            ? "bg-[#075EB5] text-white hover:bg-[#064D94] cursor-pointer"
                                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    }`}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={17} />
                                            Register Application
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </section>
                </form>
            </main>
        </div>
    );
}

// ============================================================
// SMALL INFO ICON
// ============================================================

function InfoIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    );
}
