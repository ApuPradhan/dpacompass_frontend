import { useState } from "react";
import { FiLoader, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../utilities/fetchWithAuth";


const CreateDomain = ({ onClose, onSuccess }) => {

    const [form, setForm] = useState({
        name: "",
        description: "",
        is_active: true
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!form.name.trim()) return;

        setLoading(true);

        try {
            const res = await fetchWithAuth(
                `/api/checklists/domains/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(form),
                }
            );

            if (res.ok) {
                toast.success("Domain created successfully");
                onSuccess();
                onClose();
            } else {
                toast.error("Failed to create domain");
            }

        } catch (err) {
            toast.error("Something went wrong");
        }

        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">

            <div className="bg-[#0f172a] border border-gray-700 rounded-xl w-105 p-6 shadow-xl animate-scaleIn">

                {/* HEADER */}
                <div className="flex flex-col items-center text-center mb-4">
                    <div className="bg-indigo-500/20 text-indigo-400 p-3 rounded-full mb-3">
                        <FiPlus size={22} />
                    </div>

                    <h3 className="text-lg font-semibold text-white">
                        Create Domain
                    </h3>

                    <p className="text-gray-400 text-sm mt-1">
                        Add a new domain to the system
                    </p>
                </div>

                {/* FORM */}
                <div className="space-y-3 mb-5">
                    <input
                        className="w-full p-2 bg-[#1e293b] border border-gray-600 rounded-lg text-sm outline-none focus:border-indigo-500"
                        placeholder="Domain Name"
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                    />

                    <textarea
                        className="w-full p-2 bg-[#1e293b] border border-gray-600 rounded-lg text-sm outline-none focus:border-indigo-500"
                        placeholder="Description"
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

export default CreateDomain;