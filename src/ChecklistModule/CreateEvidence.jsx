
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiPlus,
    FiX,
    FiLayers,
    FiFileText,
    FiLoader,
    FiCheckCircle,
    FiSettings,
    FiMonitor,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

const CreateEvidence = ({ onClose, onSuccess }) => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [loadingScanners, setLoadingScanners] = useState(false);

    const [type, setType] = useState("manual");

    const [scanners, setScanners] = useState([]);
    const [selectedScanner, setSelectedScanner] = useState("");

    const [form, setForm] = useState({
        name: "",
        description: "",
        collection_type: "manual",
        data_provider: "auditee",
        field_type: "",
        options: null,
        is_active: true,
    });

    // --------------------------------------------------
    // LOCAL STYLES
    // --------------------------------------------------

    const styles = {
        page: "min-h-screen bg-[#F4F7FB] p-4 sm:p-6 lg:p-8",

        container: "mx-auto max-w-2xl",

        card: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",

        header:
            "flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-8",

        heading: "text-xl font-bold text-[#14213D]",

        subtitle: "mt-1 text-sm text-slate-500",

        closeButton:
            "rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer",

        body: "space-y-6 p-6 sm:p-8",

        label: "mb-2 block text-sm font-semibold text-slate-700",

        input:
            "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50",

        textarea:
            "w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50",

        select:
            "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50",

        footer:
            "flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:justify-end sm:px-8",

        cancelButton:
            "rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 cursor-pointer",

        submitButton:
            "inline-flex items-center justify-center gap-2 rounded-xl bg-[#075EB5] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#064D94] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer",
    };

    // --------------------------------------------------
    // CLOSE HANDLER
    // --------------------------------------------------

    const handleClose = () => {
        if (loading) return;

        if (typeof onClose === "function") {
            onClose();
        } else {
            navigate(-1);
        }
    };

    // --------------------------------------------------
    // FETCH SCANNERS
    // --------------------------------------------------

    const fetchScanners = async () => {
        try {
            setLoadingScanners(true);

            const res = await fetchWithAuth(
                "/api/scanner/scanners/",
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message ||
                    data.detail ||
                    "Failed to fetch scanners."
                );
            }

            setScanners(
                Array.isArray(data.data)
                    ? data.data
                    : Array.isArray(data)
                        ? data
                        : []
            );

        } catch (error) {
            console.error("Fetch scanners error:", error);
            toast.error(error.message || "Failed to fetch scanners.");
        } finally {
            setLoadingScanners(false);
        }
    };

    useEffect(() => {
        if (type === "automatic") {
            fetchScanners();
        }
    }, [type]);

    // --------------------------------------------------
    // FORM HANDLING
    // --------------------------------------------------

    const handleChange = (e) => {
        const { name, value, type: inputType, checked } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: inputType === "checkbox" ? checked : value,
        }));
    };

    const handleTypeChange = (newType) => {
        setType(newType);
        setSelectedScanner("");

        setForm((previous) => ({
            ...previous,
            field_type: "",
            collection_type:
                newType === "automatic" ? "automated" : "manual",
        }));
    };

    // --------------------------------------------------
    // SUBMIT EVIDENCE
    // --------------------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim()) {
            toast.error("Evidence name is required.");
            return;
        }

        if (type === "manual" && !form.field_type) {
            toast.error("Please select a field type.");
            return;
        }

        if (type === "automatic" && !selectedScanner) {
            toast.error("Please select a scanner.");
            return;
        }

        const payload = {
            ...form,

            field_type:
                type === "automatic"
                    ? "scanner_result"
                    : form.field_type,

            collection_type:
                type === "automatic"
                    ? "automated"
                    : "manual",

            scanner:
                type === "automatic"
                    ? parseInt(selectedScanner, 10)
                    : null,
        };

        try {
            setLoading(true);

            const res = await fetchWithAuth(
                "/api/checklists/evidence/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(
                    data.message ||
                    data.detail ||
                    "Failed to create evidence."
                );
            }

            toast.success("Evidence created successfully.");

            if (typeof onSuccess === "function") {
                onSuccess();
            }

            if (typeof onClose === "function") {
                onClose();
            } else {
                navigate(-1);
            }

        } catch (error) {
            console.error("Create evidence error:", error);
            toast.error(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <div
            className={
                typeof onClose === "function"
                    ? "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm"
                    : styles.page
            }
            onMouseDown={
                typeof onClose === "function"
                    ? (e) => {
                        if (
                            e.target === e.currentTarget &&
                            !loading
                        ) {
                            handleClose();
                        }
                    }
                    : undefined
            }
        >
            <div
                className={
                    typeof onClose === "function"
                        ? "mx-auto w-full max-w-2xl"
                        : styles.container
                }
            >
                <div className={styles.card}>

                    {/* HEADER */}

                    <div className={styles.header}>
                        <div className="flex items-center gap-4">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#075EB5]">
                                <FiFileText size={23} />
                            </div>

                            <div>
                                <h2 className={styles.heading}>
                                    Create Evidence
                                </h2>

                                <p className={styles.subtitle}>
                                    Add a new evidence configuration
                                </p>
                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className={styles.closeButton}
                            aria-label="Close"
                        >
                            <FiX size={21} />
                        </button>
                    </div>

                    {/* FORM */}

                    <form onSubmit={handleSubmit}>

                        <div className={styles.body}>

                            {/* EVIDENCE NAME */}

                            <div>
                                <label className={styles.label}>
                                    Evidence Name
                                    <span className="ml-1 text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <FiLayers
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        size={18}
                                    />

                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Enter evidence name"
                                        className={`${styles.input} pl-11`}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* DESCRIPTION */}

                            <div>
                                <label className={styles.label}>
                                    Description
                                </label>

                                <div className="relative">
                                    <FiFileText
                                        className="absolute left-4 top-4 text-slate-400"
                                        size={18}
                                    />

                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Enter a brief description of this evidence..."
                                        rows={3}
                                        className={`${styles.textarea} pl-11`}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* COLLECTION TYPE */}

                            <div>
                                <label className={styles.label}>
                                    Collection Type
                                    <span className="ml-1 text-red-500">*</span>
                                </label>

                                <div className="grid grid-cols-2 gap-3">

                                    {/* MANUAL */}

                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={() => handleTypeChange("manual")}
                                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${
                                            type === "manual"
                                                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                    >
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                            type === "manual"
                                                ? "bg-blue-100 text-blue-600"
                                                : "bg-slate-100 text-slate-500"
                                        }`}>
                                            <FiFileText size={19} />
                                        </div>

                                        <div>
                                            <p className={`text-sm font-semibold ${
                                                type === "manual"
                                                    ? "text-blue-700"
                                                    : "text-slate-700"
                                            }`}>
                                                Manual
                                            </p>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Auditee provided
                                            </p>
                                        </div>

                                    </button>

                                    {/* AUTOMATIC */}

                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={() => handleTypeChange("automatic")}
                                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${
                                            type === "automatic"
                                                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                    >
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                            type === "automatic"
                                                ? "bg-blue-100 text-blue-600"
                                                : "bg-slate-100 text-slate-500"
                                        }`}>
                                            <FiMonitor size={19} />
                                        </div>

                                        <div>
                                            <p className={`text-sm font-semibold ${
                                                type === "automatic"
                                                    ? "text-blue-700"
                                                    : "text-slate-700"
                                            }`}>
                                                Automatic
                                            </p>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Scanner generated
                                            </p>
                                        </div>

                                    </button>

                                </div>
                            </div>

                            {/* MANUAL FIELD TYPE */}

                            {type === "manual" && (
                                <div>
                                    <label className={styles.label}>
                                        Field Type
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <div className="relative">
                                        <FiSettings
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                            size={17}
                                        />

                                        <select
                                            name="field_type"
                                            value={form.field_type}
                                            onChange={handleChange}
                                            className={`${styles.select} pl-11`}
                                            disabled={loading}
                                        >
                                            <option value="">
                                                Select Field Type
                                            </option>
                                            <option value="text">Text</option>
                                            <option value="boolean">Boolean</option>
                                            <option value="textarea">Textarea</option>
                                            <option value="file">File</option>
                                            <option value="number">Number</option>
                                        </select>
                                    </div>

                                    <p className="mt-2 text-xs text-slate-400">
                                        Select the type of information the auditee will provide.
                                    </p>
                                </div>
                            )}

                            {/* AUTOMATIC SCANNER */}

                            {type === "automatic" && (
                                <div>
                                    <label className={styles.label}>
                                        Select Scanner
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <div className="relative">
                                        <FiMonitor
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                            size={17}
                                        />

                                        <select
                                            value={selectedScanner}
                                            onChange={(e) =>
                                                setSelectedScanner(e.target.value)
                                            }
                                            className={`${styles.select} pl-11`}
                                            disabled={loading || loadingScanners}
                                        >
                                            <option value="">
                                                {loadingScanners
                                                    ? "Loading scanners..."
                                                    : "Select Scanner"}
                                            </option>

                                            {scanners.map((scanner) => (
                                                <option
                                                    key={scanner.id}
                                                    value={scanner.id}
                                                >
                                                    {scanner.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {loadingScanners && (
                                        <p className="mt-2 flex items-center gap-2 text-xs text-blue-600">
                                            <FiLoader className="animate-spin" />
                                            Fetching available scanners...
                                        </p>
                                    )}

                                    {!loadingScanners && scanners.length === 0 && (
                                        <p className="mt-2 text-xs text-amber-600">
                                            No scanners are currently available.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* ACTIVE STATUS */}

                            {/* <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                        <FiCheckCircle size={20} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Active Evidence
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Make this evidence available for use.
                                        </p>
                                    </div>

                                </div>

                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={form.is_active}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="peer sr-only"
                                    />

                                    <div className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500 peer-focus:ring-4 peer-focus:ring-emerald-100 after:absolute after:left-[3px] after:top-[3px] after:h-[18px] after:w-[18px] after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5" />
                                </label>

                            </div> */}

                        </div>

                        {/* FOOTER */}

                        <div className={styles.footer}>

                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className={styles.cancelButton}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    !form.name.trim() ||
                                    (type === "manual" && !form.field_type) ||
                                    (type === "automatic" && !selectedScanner)
                                }
                                className={styles.submitButton}
                            >
                                {loading ? (
                                    <>
                                        <FiLoader
                                            className="animate-spin"
                                            size={17}
                                        />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <FiPlus size={18} />
                                        Create Evidence
                                    </>
                                )}
                            </button>

                        </div>

                    </form>

                </div>
            </div>
        </div>
    );
};

export default CreateEvidence;
