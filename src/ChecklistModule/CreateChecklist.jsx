
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiFileText,
    FiLayers,
    FiCheckCircle,
    FiTag,
    FiPlus,
    FiX,
    FiLoader,
    FiArrowLeft,
    FiClipboard,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

const ChecklistModule = () => {
    const navigate = useNavigate();

    const [applicationTypes, setApplicationTypes] = useState([]);
    const [domains, setDomains] = useState([]);
    const [evidences, setEvidences] = useState([]);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [form, setForm] = useState({
        clause: "",
        description: "",
        version: "",
        status: "",
        application_types: [],
    });

    const [selectedDomain, setSelectedDomain] = useState("");
    const [selectedEvidence, setSelectedEvidence] = useState([]);

    const [errors, setErrors] = useState({});

    // --------------------------------------------------
    // REFS FOR VALIDATION SCROLL
    // --------------------------------------------------

    const refs = {
        clause: useRef(null),
        version: useRef(null),
        description: useRef(null),
        status: useRef(null),
        domain: useRef(null),
        evidence: useRef(null),
        application_types: useRef(null),
    };

    // --------------------------------------------------
    // LOCAL STYLES
    // --------------------------------------------------

    const styles = {
        page: "min-h-screen bg-[#F4F7FB] px-4 py-6 sm:px-6 lg:px-8",

        container: "mx-auto max-w-5xl",

        card: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",

        sectionTitle: "text-base font-bold text-[#14213D]",

        sectionSubtitle: "mt-1 text-xs text-slate-500",

        label: "mb-2 block text-sm font-semibold text-slate-700",

        input:
            "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100",

        textarea:
            "w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100",

        select:
            "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100",

        primaryButton:
            "inline-flex items-center justify-center gap-2 rounded-xl bg-[#075EB5] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#064D94] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer",

        secondaryButton:
            "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer",

        error: "mt-1.5 text-xs font-medium text-red-600",
    };

    // --------------------------------------------------
    // FETCH DATA
    // --------------------------------------------------

    useEffect(() => {
        const loadInitialData = async () => {
            setFetching(true);

            try {
                const [applicationRes, domainRes, evidenceRes] =
                    await Promise.all([
                        fetchWithAuth("/api/applications/types/"),
                        fetchWithAuth("/api/checklists/domains/"),
                        fetchWithAuth("/api/checklists/evidence/"),
                    ]);

                if (!applicationRes.ok || !domainRes.ok || !evidenceRes.ok) {
                    throw new Error("Failed to load checklist configuration.");
                }

                const [applicationData, domainData, evidenceData] =
                    await Promise.all([
                        applicationRes.json(),
                        domainRes.json(),
                        evidenceRes.json(),
                    ]);

                setApplicationTypes(applicationData.data || []);
                setDomains(domainData.data || []);
                setEvidences(evidenceData.data || []);

            } catch (error) {
                console.error("Checklist initialization error:", error);
                toast.error(error.message || "Unable to load checklist data.");
            } finally {
                setFetching(false);
            }
        };

        loadInitialData();
    }, []);

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    const validate = () => {
        const newErrors = {};

        if (!form.clause.trim()) {
            newErrors.clause = "Clause is required.";
        }

        if (!form.version.trim()) {
            newErrors.version = "Version is required.";
        }

        if (!form.description.trim()) {
            newErrors.description = "Description is required.";
        }

        if (!form.status) {
            newErrors.status = "Please select a status.";
        }

        if (!selectedDomain) {
            newErrors.domain = "Please select a domain.";
        }

        if (form.application_types.length === 0) {
            newErrors.application_types = "Select at least one application type.";
        }

        if (selectedEvidence.length === 0) {
            newErrors.evidence = "Select at least one evidence item.";
        }

        setErrors(newErrors);

        const firstError = Object.keys(newErrors)[0];

        if (firstError && refs[firstError]?.current) {
            refs[firstError].current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }

        return Object.keys(newErrors).length === 0;
    };

    // --------------------------------------------------
    // FORM HANDLERS
    // --------------------------------------------------

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((previous) => ({
                ...previous,
                [name]: "",
            }));
        }
    };

    const handleCheckboxChange = (id) => {
        setForm((previous) => {
            const exists = previous.application_types.includes(id);

            return {
                ...previous,
                application_types: exists
                    ? previous.application_types.filter((x) => x !== id)
                    : [...previous.application_types, id],
            };
        });

        setErrors((previous) => ({
            ...previous,
            application_types: "",
        }));
    };

    const handleAddEvidence = (id) => {
        if (!id) return;

        const numId = parseInt(id, 10);

        if (!selectedEvidence.includes(numId)) {
            setSelectedEvidence((previous) => [...previous, numId]);
        }

        setErrors((previous) => ({
            ...previous,
            evidence: "",
        }));
    };

    const handleRemoveEvidence = (id) => {
        setSelectedEvidence((previous) =>
            previous.filter((x) => x !== id)
        );
    };

    // --------------------------------------------------
    // SAVE CHECKLIST
    // --------------------------------------------------

    const handleSave = async () => {
        if (!validate()) return;

        const payload = {
            domain: parseInt(selectedDomain, 10),
            clause: form.clause,
            description: form.description,
            version: form.version,
            status: form.status.toLowerCase(),
            application_types: form.application_types,
            evidence_mappings: selectedEvidence,
        };

        try {
            setLoading(true);

            const res = await fetchWithAuth("/api/checklists/items/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(
                    data.message ||
                    data.detail ||
                    "Failed to create checklist."
                );
            }

            toast.success("Checklist created successfully.");
            navigate(-1);

        } catch (error) {
            console.error("Create checklist error:", error);
            toast.error(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // SECTION HEADER
    // --------------------------------------------------

    const SectionHeader = ({ number, title, subtitle, icon }) => (
        <div className="mb-5 flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#075EB5]">
                {icon}
            </div>

            <div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600">
                        {number}.
                    </span>

                    <h3 className={styles.sectionTitle}>
                        {title}
                    </h3>
                </div>

                <p className={styles.sectionSubtitle}>
                    {subtitle}
                </p>
            </div>

        </div>
    );

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <main className={styles.page}>
            <div className={styles.container}>

                {/* PAGE HEADER */}

                <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#075EB5]">
                            <FiClipboard size={16} />
                            Checklist Configuration
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-[#14213D] sm:text-3xl">
                            Create Checklist
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Configure checklist clauses, application types, domains and evidence mappings.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        disabled={loading}
                        className={styles.secondaryButton}
                    >
                        <FiArrowLeft size={17} />
                        Back
                    </button>

                </div>

                {fetching ? (

                    <div className={`${styles.card} flex min-h-[350px] flex-col items-center justify-center gap-3`}>
                        <FiLoader className="animate-spin text-blue-600" size={30} />

                        <p className="text-sm text-slate-500">
                            Loading checklist configuration...
                        </p>
                    </div>

                ) : (

                    <div className={styles.card}>

                        {/* FORM INTRODUCTION */}

                        <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/80 to-white px-6 py-5 sm:px-8">

                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                                    <FiFileText size={21} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-[#14213D]">
                                        Checklist Information
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Complete the required information below to create a checklist item.
                                    </p>

                                    <p className="mt-2 text-xs text-slate-400">
                                        Fields marked with <span className="text-red-500">*</span> are mandatory.
                                    </p>
                                </div>
                            </div>

                        </div>

                        <div className="space-y-8 p-6 sm:p-8">

                            {/* SECTION 1: BASIC INFORMATION */}

                            <section>
                                <SectionHeader
                                    number="01"
                                    title="Basic Information"
                                    subtitle="Enter the checklist clause and its description."
                                    icon={<FiFileText size={20} />}
                                />

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                    {/* CLAUSE */}

                                    <div ref={refs.clause}>
                                        <label className={styles.label}>
                                            Clause
                                            <span className="ml-1 text-red-500">*</span>
                                        </label>

                                        <input
                                            name="clause"
                                            value={form.clause}
                                            onChange={handleFormChange}
                                            placeholder="Enter clause reference"
                                            className={`${styles.input} ${errors.clause ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`}
                                        />

                                        {errors.clause && (
                                            <p className={styles.error}>
                                                {errors.clause}
                                            </p>
                                        )}
                                    </div>

                                    {/* VERSION */}

                                    <div ref={refs.version}>
                                        <label className={styles.label}>
                                            Version
                                            <span className="ml-1 text-red-500">*</span>
                                        </label>

                                        <input
                                            name="version"
                                            value={form.version}
                                            onChange={handleFormChange}
                                            placeholder="e.g. 1.0"
                                            className={`${styles.input} ${errors.version ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`}
                                        />

                                        {errors.version && (
                                            <p className={styles.error}>
                                                {errors.version}
                                            </p>
                                        )}
                                    </div>

                                    {/* DESCRIPTION */}

                                    <div ref={refs.description} className="sm:col-span-2">
                                        <label className={styles.label}>
                                            Description
                                            <span className="ml-1 text-red-500">*</span>
                                        </label>

                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={handleFormChange}
                                            placeholder="Describe the compliance requirement covered by this checklist item..."
                                            rows={4}
                                            className={`${styles.textarea} ${errors.description ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`}
                                        />

                                        {errors.description && (
                                            <p className={styles.error}>
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* STATUS */}

                                    <div ref={refs.status} className="sm:col-span-2">
                                        <label className={styles.label}>
                                            Status
                                            <span className="ml-1 text-red-500">*</span>
                                        </label>

                                        <select
                                            name="status"
                                            value={form.status}
                                            onChange={handleFormChange}
                                            className={`${styles.select} ${errors.status ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="Published">Published</option>
                                            <option value="Draft">Draft</option>
                                            <option value="Deprecated">Deprecated</option>
                                        </select>

                                        {errors.status && (
                                            <p className={styles.error}>
                                                {errors.status}
                                            </p>
                                        )}
                                    </div>

                                </div>
                            </section>

                            <div className="border-t border-slate-100" />

                            {/* SECTION 2: APPLICATION TYPES */}

                            <section ref={refs.application_types}>
                                <SectionHeader
                                    number="02"
                                    title="Application Types"
                                    subtitle="Select the application categories to which this checklist applies."
                                    icon={<FiLayers size={20} />}
                                />

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                                    {applicationTypes.map((type) => {
                                        const checked =
                                            form.application_types.includes(type.id);

                                        return (
                                            <label
                                                key={type.id}
                                                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                                                    checked
                                                        ? "border-blue-400 bg-blue-50"
                                                        : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() =>
                                                        handleCheckboxChange(type.id)
                                                    }
                                                    className="h-4 w-4 accent-blue-600"
                                                />

                                                <span className={`text-sm font-medium ${
                                                    checked
                                                        ? "text-blue-800"
                                                        : "text-slate-700"
                                                }`}>
                                                    {type.name}
                                                </span>

                                                {checked && (
                                                    <FiCheckCircle
                                                        size={17}
                                                        className="ml-auto text-blue-600"
                                                    />
                                                )}
                                            </label>
                                        );
                                    })}

                                </div>

                                {applicationTypes.length === 0 && (
                                    <p className="text-sm text-slate-500">
                                        No application types are available.
                                    </p>
                                )}

                                {errors.application_types && (
                                    <p className={styles.error}>
                                        {errors.application_types}
                                    </p>
                                )}
                            </section>

                            <div className="border-t border-slate-100" />

                            {/* SECTION 3: DOMAIN */}

                            <section ref={refs.domain}>
                                <SectionHeader
                                    number="03"
                                    title="Domain Selection"
                                    subtitle="Associate this checklist item with a compliance domain."
                                    icon={<FiLayers size={20} />}
                                />

                                <label className={styles.label}>
                                    Select Domain
                                    <span className="ml-1 text-red-500">*</span>
                                </label>

                                <select
                                    value={selectedDomain}
                                    onChange={(e) => {
                                        setSelectedDomain(e.target.value);

                                        setErrors((previous) => ({
                                            ...previous,
                                            domain: "",
                                        }));
                                    }}
                                    className={`${styles.select} ${errors.domain ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`}
                                >
                                    <option value="">Select Domain</option>

                                    {domains
                                        .filter((domain) => domain.is_active)
                                        .map((domain) => (
                                            <option
                                                key={domain.id}
                                                value={domain.id}
                                            >
                                                {domain.name}
                                            </option>
                                        ))}
                                </select>

                                {errors.domain && (
                                    <p className={styles.error}>
                                        {errors.domain}
                                    </p>
                                )}

                                <p className="mt-2 text-xs text-slate-400">
                                    Only active domains are available for selection.
                                </p>
                            </section>

                            <div className="border-t border-slate-100" />

                            {/* SECTION 4: EVIDENCE */}

                            <section ref={refs.evidence}>
                                <SectionHeader
                                    number="04"
                                    title="Evidence Mapping"
                                    subtitle="Associate one or more evidence configurations with this checklist item."
                                    icon={<FiCheckCircle size={20} />}
                                />

                                <label className={styles.label}>
                                    Select Evidence
                                    <span className="ml-1 text-red-500">*</span>
                                </label>

                                <select
                                    value=""
                                    onChange={(e) =>
                                        handleAddEvidence(e.target.value)
                                    }
                                    className={`${styles.select} ${errors.evidence ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`}
                                >
                                    <option value="">Add Evidence</option>

                                    {evidences
                                        .filter((evidence) =>
                                            evidence.is_active &&
                                            !selectedEvidence.includes(evidence.id)
                                        )
                                        .map((evidence) => (
                                            <option
                                                key={evidence.id}
                                                value={evidence.id}
                                            >
                                                {evidence.name}
                                            </option>
                                        ))}
                                </select>

                                {errors.evidence && (
                                    <p className={styles.error}>
                                        {errors.evidence}
                                    </p>
                                )}

                                {/* SELECTED EVIDENCE */}

                                <div className="mt-4">

                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Selected Evidence
                                        </p>

                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                            {selectedEvidence.length} selected
                                        </span>
                                    </div>

                                    <div className="min-h-[65px] rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">

                                        {selectedEvidence.length === 0 ? (
                                            <p className="py-2 text-center text-sm text-slate-400">
                                                No evidence selected yet.
                                            </p>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">

                                                <AnimatePresence>
                                                    {selectedEvidence.map((id) => {
                                                        const evidence = evidences.find(
                                                            (e) => e.id === id
                                                        );

                                                        return (
                                                            <motion.div
                                                                key={id}
                                                                initial={{
                                                                    scale: 0.85,
                                                                    opacity: 0,
                                                                }}
                                                                animate={{
                                                                    scale: 1,
                                                                    opacity: 1,
                                                                }}
                                                                exit={{
                                                                    scale: 0.85,
                                                                    opacity: 0,
                                                                }}
                                                                className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800"
                                                            >
                                                                <FiFileText size={15} />

                                                                {evidence?.name || `Evidence #${id}`}

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleRemoveEvidence(id)
                                                                    }
                                                                    className="ml-1 rounded-md p-0.5 text-blue-500 transition hover:bg-blue-100 hover:text-red-600 cursor-pointer"
                                                                    title="Remove evidence"
                                                                >
                                                                    <FiX size={15} />
                                                                </button>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </AnimatePresence>

                                            </div>
                                        )}

                                    </div>
                                </div>

                            </section>

                        </div>

                        {/* FOOTER */}

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">

                            <p className="text-xs text-slate-400">
                                Please review all information before creating.
                            </p>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row">

                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    disabled={loading}
                                    className={styles.secondaryButton}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={loading}
                                    className={styles.primaryButton}
                                >
                                    {loading ? (
                                        <>
                                            <FiLoader
                                                size={17}
                                                className="animate-spin"
                                            />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <FiPlus size={18} />
                                            Create Checklist
                                        </>
                                    )}
                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </div>
        </main>
    );
};

export default ChecklistModule;
