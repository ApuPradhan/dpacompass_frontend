import { useState, useEffect } from "react";
import { FiLoader, FiEdit } from "react-icons/fi";
import { fetchWithAuth } from "../utilities/fetchWithAuth";


const EditDomain = ({ domain, onClose, onSuccess }) => {

    const [form, setForm] = useState({
        name: "",
        description: ""
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (domain) {
            setForm({
                name: domain.name,
                description: domain.description
            });
        }
    }, [domain]);

    const handleUpdate = async () => {
        setLoading(true);

        try {
            const res = await fetchWithAuth(
                `/api/checklists/domains/${domain.id}/`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...domain,
                        ...form,
                    }),
                }
            );

            if (!res.ok) {
                throw new Error("Failed to update domain");
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error updating domain:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">

            <div className="bg-[#0f172a] border border-gray-700 rounded-xl w-105 p-6 shadow-xl animate-scaleIn">

                {/* HEADER */}
                <div className="flex flex-col items-center text-center mb-4">
                    <div className="bg-violet-500/20 text-violet-400 p-3 rounded-full mb-3">
                        <FiEdit size={22} />
                    </div>

                    <h3 className="text-lg font-semibold text-white">
                        Edit Domain
                    </h3>

                    <p className="text-gray-400 text-sm mt-1">
                        Update domain details
                    </p>
                </div>

                {/* FORM */}
                <div className="space-y-3 mb-5">
                    <input
                        className="w-full p-2 bg-[#1e293b] border border-gray-600 rounded-lg text-sm outline-none focus:border-violet-500"
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                    />

                    <textarea
                        className="w-full p-2 bg-[#1e293b] border border-gray-600 rounded-lg text-sm outline-none focus:border-violet-500"
                        value={form.description}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                description: e.target.value
                            })
                        }
                    />
                </div>

                {/* ACTIONS */}
                <div className="flex justify-center gap-3">
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

export default EditDomain;