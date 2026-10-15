import { useState, useEffect } from "react";
import { FiLoader, FiEdit } from "react-icons/fi";

const EditEvidence = ({ evidence, onClose, onSuccess }) => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("access");

    const [loading, setLoading] = useState(false);
    const [type, setType] = useState("manual");

    const [form, setForm] = useState({
        name: "",
        description: "",
        collection_type: "manual",
        data_provider: "auditee",
        field_type: "",
        is_active: true
    });

    // ✅ Initialize
    useEffect(() => {
        if (evidence) {
            setForm(evidence);

            if (evidence.field_type === "scanner_result") {
                setType("automatic");
            } else {
                setType("manual");
            }
        }
    }, [evidence]);

    const handleUpdate = async () => {
        if (!evidence) return;

        setLoading(true);

        const payload = {
            ...form,
            field_type:
                type === "automatic"
                    ? "scanner_result"
                    : form.field_type,
            scanner: null // ✅ always null
        };

        try {
            const res = await fetchWithAuth(
                `/api/checklists/evidence/${evidence.id}/`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                throw new Error("Failed to update evidence");
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
        }

        setLoading(false);
    };

    if (!evidence) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">

            <div className="bg-[#0f172a] border border-gray-700 rounded-xl w-115 p-6 shadow-xl animate-scaleIn text-white">

                {/* HEADER */}
                <div className="flex flex-col items-center text-center mb-5">
                    <div className="bg-violet-500/20 text-violet-400 p-3 rounded-full mb-3">
                        <FiEdit size={22} />
                    </div>

                    <h3 className="text-lg font-semibold">
                        Edit Evidence
                    </h3>

                    <p className="text-gray-400 text-sm">
                        Update evidence configuration
                    </p>
                </div>

                {/* FORM */}
                <div className="space-y-3 text-sm">

                    {/* NAME */}
                    <input
                        className="w-full p-2 bg-[#1e293b] border border-gray-600 rounded-lg outline-none focus:border-violet-500"
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                    />

                    {/* DESCRIPTION */}
                    <textarea
                        className="w-full p-2 bg-[#1e293b] border border-gray-600 rounded-lg outline-none focus:border-violet-500"
                        value={form.description || ""}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                description: e.target.value
                            })
                        }
                    />

                    {/* RADIO */}
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

                    {/* CONDITIONAL */}
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
                            <option value="text">Text</option>
                            <option value="boolean">Boolean</option>
                            <option value="textarea">Textarea</option>
                            <option value="file">File</option>
                            <option value="number">Number</option>
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
                        onClick={handleUpdate}
                        className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2"
                    >
                        {loading && <FiLoader className="animate-spin" />}
                        Update
                    </button>

                </div>

            </div>
        </div>
    );
};

export default EditEvidence;