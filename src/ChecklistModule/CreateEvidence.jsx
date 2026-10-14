import { useState, useEffect } from "react";
import { FiLoader, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

const CreateEvidence = ({ onClose, onSuccess }) => {

    const [loading, setLoading] = useState(false);
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
        is_active: true
    });

    // ================= FETCH SCANNERS =================
    useEffect(() => {
        if (type === "automatic") {
            fetchScanners();
        }
    }, [type]);

    const fetchScanners = async () => {
        try {
            const res = await fetchWithAuth("/api/scanner/scanners/");
            const data = await res.json();
            setScanners(data.data || data || []);
        } catch {
            toast.error("Failed to fetch scanners");
        }
    };

    // ================= SUBMIT =================
    const handleSubmit = async () => {

        if (!form.name.trim()) {
            toast.error("Name is required");
            return;
        }

        if (type === "manual" && !form.field_type) {
            toast.error("Please select field type");
            return;
        }

        if (type === "automatic" && !selectedScanner) {
            toast.error("Select a scanner");
            return;
        }

        setLoading(true);

        const payload = {
            ...form,
            field_type:
                type === "automatic"
                    ? "scanner_result"
                    : form.field_type,

            collection_type:
                type === "automatic"
                    ? "automated"
                    : form.collection_type,

            scanner:
                type === "automatic"
                    ? parseInt(selectedScanner)
                    : null
        };
        

        try {
            const res = await fetchWithAuth(
                "/api/checklists/evidence/",
                {
                    method: "POST",
                    body: JSON.stringify(payload)
                }
            );

            if (res.ok) {
                toast.success("Evidence created successfully");
                onSuccess();
                onClose();
            } else {
                const err = await res.json();
                toast.error(err?.message || "Failed to create evidence");
            }

        } catch (err) {
            toast.error("Something went wrong");
            console.error(err);
        }

        setLoading(false);
    };

    // ================= UI =================
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">

            <div className="bg-[#0f172a] border border-gray-700 rounded-xl w-115 p-6 shadow-xl animate-scaleIn text-white">

                {/* HEADER */}
                <div className="flex flex-col items-center text-center mb-5">
                    <div className="bg-indigo-500/20 text-indigo-400 p-3 rounded-full mb-3">
                        <FiPlus size={22} />
                    </div>

                    <h3 className="text-lg font-semibold">
                        Create Evidence
                    </h3>

                    <p className="text-gray-400 text-sm">
                        Add new evidence configuration
                    </p>
                </div>

                {/* FORM */}
                <div className="space-y-3 text-sm">

                    {/* NAME */}
                    <input
                        className="w-full p-2 bg-[#1e293b] border border-gray-600 rounded-lg outline-none focus:border-indigo-500"
                        placeholder="Evidence Name"
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                    />

                    {/* DESCRIPTION */}
                    <textarea
                        className="w-full p-2 bg-[#1e293b] border border-gray-600 rounded-lg outline-none focus:border-indigo-500"
                        placeholder="Description"
                        value={form.description}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                description: e.target.value
                            })
                        }
                    />

                    {/* TYPE */}
                    <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked={type === "manual"}
                                onChange={() => setType("manual")}
                            />
                            Manual
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked={type === "automatic"}
                                onChange={() => setType("automatic")}
                            />
                            Automatic
                        </label>
                    </div>

                    {/* MANUAL FIELD */}
                    {type === "manual" && (
                        <select
                            className="w-full p-2 bg-[#1e293b] border border-gray-600 rounded-lg outline-none"
                            value={form.field_type}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    field_type: e.target.value
                                })
                            }
                        >
                            <option value="">Select Field Type</option>
                            <option value="text">Text</option>
                            <option value="boolean">Boolean</option>
                            <option value="textarea">Textarea</option>
                            <option value="file">File</option>
                            <option value="number">Number</option>
                        </select>
                    )}

                    {/* AUTOMATIC SCANNER */}
                    {type === "automatic" && (
                        <select
                            className="w-full p-2 bg-[#1e293b] border border-gray-600 rounded-lg"
                            value={selectedScanner}
                            onChange={(e) =>
                                setSelectedScanner(e.target.value)
                            }
                        >
                            <option value="">Select Scanner</option>
                            {scanners.map((sc) => (
                                <option key={sc.id} value={sc.id}>
                                    {sc.name}
                                </option>
                            ))}
                        </select>
                    )}

                </div>

                {/* ACTIONS */}
                <div className="flex justify-center gap-3 mt-6">

                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                    >
                        {loading && <FiLoader className="animate-spin" />}
                        Create
                    </button>

                </div>

            </div>
        </div>
    );
};

export default CreateEvidence;