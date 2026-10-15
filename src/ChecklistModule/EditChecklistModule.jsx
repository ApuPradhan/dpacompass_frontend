import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

const inputClass =
    "w-full px-3 py-2 rounded-lg bg-[#1e293b] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

const EditChecklistModule = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const token = localStorage.getItem("access");

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [checklist, setChecklist] = useState(null);

    const [domains, setDomains] = useState([]);
    const [evidences, setEvidences] = useState([]);
    const [applicationTypes, setApplicationTypes] = useState([]);

    const [selectedDomain, setSelectedDomain] = useState("");
    const [selectedEvidence, setSelectedEvidence] = useState([]);

    const [form, setForm] = useState({
        description: "",
        application_types: [],
    });

    const descRef = useRef();

    const authHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    // ================= FETCH =================
    useEffect(() => {
        fetchChecklist();
        fetchDomains();
        fetchEvidences();
        fetchApplicationTypes();
    }, []);

    const fetchChecklist = async () => {
        try {
            const res = await fetchWithAuth(`/api/checklists/items/${id}/`);
            const data = await res.json();

            const item = data.data || data;

            setChecklist(item);

            setSelectedDomain(item.domain);

            setSelectedEvidence(
                item.evidence_mappings.map((e) => e.evidence.id)
            );

            setForm({
                description: item.description,
                application_types: item.application_types,
            });

        } catch {
            toast.error("Failed to load checklist");
        }

        setFetching(false);
    };

    const fetchDomains = async () => {
        const res = await fetchWithAuth("/api/checklists/domains/");
        const data = await res.json();
        setDomains(data.data || []);
    };

    const fetchEvidences = async () => {
        const res = await fetchWithAuth("/api/checklists/evidence/");
        const data = await res.json();
        setEvidences(data.data || []);
    };

    const fetchApplicationTypes = async () => {
        const res = await fetchWithAuth("/api/applications/types/");
        const data = await res.json();
        setApplicationTypes(data.data || []);
    };

    // ================= HANDLERS =================
    const handleAddEvidence = (id) => {
        const numId = parseInt(id);
        if (!selectedEvidence.includes(numId)) {
            setSelectedEvidence([...selectedEvidence, numId]);
        }
    };

    const handleRemoveEvidence = (id) => {
        setSelectedEvidence(selectedEvidence.filter((x) => x !== id));
    };

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

    // ================= UPDATE =================
    const handleUpdate = async () => {
        setLoading(true);

        try {
            const payload = JSON.stringify({
                description: form.description,
                application_types: form.application_types,
                domain: selectedDomain,
                evidence_mappings: selectedEvidence,
            });

            const res = await fetchWithAuth(
                `/api/checklists/items/${id}/`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: payload,
                }
            );

            if (res.ok) {
                toast.success("Checklist updated");
                navigate(-1);
            } else {
                toast.error("Update failed");
            }
        } catch {
            toast.error("Error updating");
        }

        setLoading(false);
    };

    if (fetching) return <div className="p-6 text-white">Loading...</div>;

    return (
        <div className="p-6 min-h-screen bg-linear-to-br from-[#0b0f2a] via-[#0f172a] to-[#020617] text-white">

            <h2 className="text-2xl font-semibold mb-6">Edit Checklist</h2>

            <div className="bg-[#0f172a] border border-gray-700 rounded-xl p-6 space-y-5">

                {/* READ ONLY */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <label className="text-gray-400">Clause</label>
                        <input className={inputClass} value={checklist.clause} />
                    </div>

                    <div>
                        <label className="text-gray-400">Version</label>
                        <input className={inputClass} value={checklist.version} />
                    </div>
                </div>

                {/* DOMAIN */}
                <div>
                    <label className="text-gray-400">Domain</label>
                    <select
                        className={inputClass}
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value)}
                    >
                        {domains.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* DESCRIPTION */}
                <div ref={descRef}>
                    <label className="text-gray-400">Description</label>
                    <textarea
                        className={inputClass}
                        value={form.description}
                        onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                        }
                    />
                </div>

                {/* APPLICATION TYPES */}
                <div>
                    <label className="text-gray-400">Application Types</label>
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
                </div>

                {/* EVIDENCE */}
                <div>
                    <label className="text-gray-400">Evidence</label>

                    <select
                        className={inputClass}
                        onChange={(e) => handleAddEvidence(e.target.value)}
                    >
                        <option value="">Add Evidence</option>
                        {evidences.map((e) => (
                            <option key={e.id} value={e.id}>
                                {e.name}
                            </option>
                        ))}
                    </select>

                    <div className="flex flex-wrap gap-2 mt-3">
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
                </div>

                {/* ACTION */}
                <div className="flex gap-3 pt-4">

                    <button
                        onClick={handleUpdate}
                        className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-lg"
                    >
                        {loading ? "Updating..." : "Update"}
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="border border-gray-600 hover:bg-gray-700 px-5 py-2 rounded-lg text-gray-300"
                    >
                        Cancel
                    </button>

                </div>
            </div>
        </div>
    );
};

export default EditChecklistModule;