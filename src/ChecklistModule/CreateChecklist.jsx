import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const inputClass =
    "w-full px-3 py-2 rounded-lg bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

const ChecklistModule = () => {
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("access");

    const [applicationTypes, setApplicationTypes] = useState([]);
    const [domains, setDomains] = useState([]);
    const [evidences, setEvidences] = useState([]);

    const [loading, setLoading] = useState(false);

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

    // refs for scroll
    const refs = {
        clause: useRef(),
        version: useRef(),
        description: useRef(),
        status: useRef(),
        domain: useRef(),
        evidence: useRef(),
    };

    const authHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    // ================= FETCH =================
    useEffect(() => {
        fetchApplicationTypes();
        fetchDomains();
        fetchEvidences();
    }, []);

    const fetchApplicationTypes = async () => {
        const res = await fetch(`${BASE_URL}/api/applications/types/`, {
            headers: authHeaders,
        });
        const data = await res.json();
        setApplicationTypes(data.data || []);
    };

    const fetchDomains = async () => {
        const res = await fetch(`${BASE_URL}/api/checklists/domains/`, {
            headers: authHeaders,
        });
        const data = await res.json();
        setDomains(data.data || []);
    };

    const fetchEvidences = async () => {
        const res = await fetch(`${BASE_URL}/api/checklists/evidence/`, {
            headers: authHeaders,
        });
        const data = await res.json();
        setEvidences(data.data || []);
    };

    // ================= VALIDATION =================
    const validate = () => {
        const newErrors = {};

        if (!form.clause.trim()) newErrors.clause = "Required";
        if (!form.version.trim()) newErrors.version = "Required";
        if (!form.description.trim()) newErrors.description = "Required";
        if (!form.status) newErrors.status = "Required";
        if (!selectedDomain) newErrors.domain = "Required";
        if (form.application_types.length === 0)
            newErrors.application_types = "Select at least one";
        if (selectedEvidence.length === 0)
            newErrors.evidence = "Select at least one";

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

    // ================= HANDLERS =================
    const handleCheckboxChange = (id) => {
        setForm((prev) => {
            const exists = prev.application_types.includes(id);
            return {
                ...prev,
                application_types: exists
                    ? prev.application_types.filter((x) => x !== id)
                    : [...prev.application_types, id],
            };
        });
    };

    const handleAddEvidence = (id) => {
        if (!id) return;
        const numId = parseInt(id);

        if (!selectedEvidence.includes(numId)) {
            setSelectedEvidence([...selectedEvidence, numId]);
        }
    };

    const handleRemoveEvidence = (id) => {
        setSelectedEvidence(selectedEvidence.filter((x) => x !== id));
    };

    // ================= SAVE =================
    const handleSave = async () => {
        if (!validate()) return;

        const payload = {
            domain: parseInt(selectedDomain),
            clause: form.clause,
            description: form.description,
            version: form.version,
            status: form.status.toLowerCase(),
            application_types: form.application_types,
            evidence_mappings: selectedEvidence,
        };

        setLoading(true);

        try {
            const res = await fetch(`${BASE_URL}/api/checklists/items/`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success("Checklist created successfully");
                navigate(-1);
            } else {
                toast.error("Failed to create checklist");
            }
        } catch {
            toast.error("Something went wrong");
        }

        setLoading(false);
    };

    // ================= UI =================
    return (
        <div className="p-6 min-h-screen bg-linear-to-br from-[#0b0f2a] via-[#0f172a] to-[#020617] text-white">
            <div className="max-w-5xl mx-auto">

                <h2 className="text-2xl font-semibold mb-6 text-gray-200">
                    Create Checklist
                </h2>

                <div className="bg-[#0f172a] border border-gray-700 rounded-xl p-6 space-y-5">

                    {/* CLAUSE */}
                    <div ref={refs.clause}>
                        <label className="text-sm text-gray-400">
                            Clause <span className="text-red-400">*</span>
                        </label>
                        <input
                            className={`${inputClass} ${errors.clause ? "border-red-500" : ""
                                }`}
                            value={form.clause}
                            onChange={(e) =>
                                setForm({ ...form, clause: e.target.value })
                            }
                        />
                        {errors.clause && (
                            <p className="text-red-400 text-xs mt-1">
                                {errors.clause}
                            </p>
                        )}
                    </div>

                    {/* VERSION */}
                    <div ref={refs.version}>
                        <label className="text-sm text-gray-400">
                            Version <span className="text-red-400">*</span>
                        </label>
                        <input
                            className={`${inputClass} ${errors.version ? "border-red-500" : ""
                                }`}
                            value={form.version}
                            onChange={(e) =>
                                setForm({ ...form, version: e.target.value })
                            }
                        />
                        {errors.version && (
                            <p className="text-red-400 text-xs mt-1">
                                {errors.version}
                            </p>
                        )}
                    </div>

                    {/* DESCRIPTION */}
                    <div ref={refs.description}>
                        <label className="text-sm text-gray-400">
                            Description <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            className={`${inputClass} ${errors.description ? "border-red-500" : ""
                                }`}
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                        />
                        {errors.description && (
                            <p className="text-red-400 text-xs mt-1">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* STATUS */}
                    <div ref={refs.status}>
                        <label className="text-sm text-gray-400">
                            Status <span className="text-red-400">*</span>
                        </label>
                        <select
                            className={`${inputClass} ${errors.status ? "border-red-500" : ""
                                }`}
                            value={form.status}
                            onChange={(e) =>
                                setForm({ ...form, status: e.target.value })
                            }
                        >
                            <option value="">Select Status</option>
                            <option>Published</option>
                            <option>Draft</option>
                            <option>Deprecated</option>
                        </select>
                        {errors.status && (
                            <p className="text-red-400 text-xs mt-1">
                                {errors.status}
                            </p>
                        )}
                    </div>

                    {/* APPLICATION TYPES */}
                    <div>
                        <label className="text-sm text-gray-400">
                            Application Types <span className="text-red-400">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {applicationTypes.map((type) => (
                                <label key={type.id} className="flex gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.application_types.includes(type.id)}
                                        onChange={() => handleCheckboxChange(type.id)}
                                    />
                                    {type.name}
                                </label>
                            ))}
                        </div>
                        {errors.application_types && (
                            <p className="text-red-400 text-xs mt-1">
                                {errors.application_types}
                            </p>
                        )}
                    </div>

                    {/* DOMAIN */}
                    <div ref={refs.domain}>
                        <label className="text-sm text-gray-400">
                            Select Domain <span className="text-red-400">*</span>
                        </label>
                        <select
                            className={`${inputClass} ${errors.domain ? "border-red-500" : ""
                                }`}
                            value={selectedDomain}
                            onChange={(e) => setSelectedDomain(e.target.value)}
                        >
                            <option value="">Select Domain</option>
                            {domains.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                        {errors.domain && (
                            <p className="text-red-400 text-xs mt-1">
                                {errors.domain}
                            </p>
                        )}
                    </div>

                    {/* EVIDENCE */}
                    <div ref={refs.evidence}>
                        <label className="text-sm text-gray-400">
                            Select Evidence <span className="text-red-400">*</span>
                        </label>
                        <select
                            className={`${inputClass} ${errors.evidence ? "border-red-500" : ""
                                }`}
                            onChange={(e) => handleAddEvidence(e.target.value)}
                        >
                            <option value="">Add Evidence</option>
                            {evidences.map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.name}
                                </option>
                            ))}
                        </select>

                        <div className="flex flex-wrap gap-2 mt-2">
                            <AnimatePresence>
                                {selectedEvidence.map((id) => {
                                    const ev = evidences.find((e) => e.id === id);
                                    return (
                                        <motion.div
                                            key={id}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.8, opacity: 0 }}
                                            className="px-3 py-1 bg-indigo-500/20 rounded-full flex gap-2"
                                        >
                                            {ev?.name}
                                            <button
                                                onClick={() => handleRemoveEvidence(id)}
                                                className="text-red-400"
                                            >
                                                ✕
                                            </button>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {errors.evidence && (
                            <p className="text-red-400 text-xs mt-1">
                                {errors.evidence}
                            </p>
                        )}
                    </div>

                    {/* BUTTON */}
                    <button
                        onClick={handleSave}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg"
                    >
                        {loading ? "Creating..." : "Create Checklist"}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default ChecklistModule;