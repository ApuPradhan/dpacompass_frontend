import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function CreateChecklist() {

    const navigate = useNavigate();
    const token = localStorage.getItem("access");

    const [formData, setFormData] = useState({
        rule_id: "",
        description: "",
        severity: "low",
        application_types: [],
    });

    const [applicationTypes, setApplicationTypes] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchApplicationTypes = async () => {
        try {
            // const res = await fetch(
            //     `${BASE_URL}/api/applications/types/`,
            //     {
            //         method: 'GET',
            //         credentials: "include",
            //     }
            // );

            const res = await fetch(
                `${BASE_URL}/api/applications/types/`,
                {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();
            if (res.ok) {
                setApplicationTypes(data.data);
            }

        } catch (err) {
            console.error("Error fetching types:", err);
        }
    };

    useEffect(() => {
        fetchApplicationTypes();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleCheckboxChange = (typeId) => {
        setFormData((prev) => {
            const exists = prev.application_types.includes(typeId);

            return {
                ...prev,
                application_types: exists
                    ? prev.application_types.filter(id => id !== typeId)
                    : [...prev.application_types, typeId],
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            // const res = await fetch(
            //     `${BASE_URL}/api/checklists/create/`,
            //     {
            //         method: "POST",
            //         credentials: "include",
            //         body: JSON.stringify(formData),
            //     }
            // );

            const res = await fetch(
                `${BASE_URL}/api/checklists/create/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await res.json();

            if (res.ok) {
                alert("Checklist created successfully");
                navigate(-1);
            } else {
                console.error(data);
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-40 bg-[#0b1120] text-gray-200 p-6">

            <div className="max-w-2xl mx-auto bg-[#111827]/80 border border-gray-700 rounded-xl p-6 shadow-lg">

                <h2 className="text-lg font-semibold mb-6 text-indigo-400">
                    Create Checklist
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Rule ID */}
                    <div>
                        <label className="text-sm text-gray-400">Rule ID *</label>
                        <input
                            type="text"
                            name="rule_id"
                            value={formData.rule_id}
                            onChange={handleChange}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-[#1e293b] border border-gray-600 text-white"
                            placeholder="e.g. CHK006"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm text-gray-400">Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-[#1e293b] border border-gray-600 text-white"
                            placeholder="Enter checklist description"
                        />
                    </div>

                    {/* Severity */}
                    <div>
                        <label className="text-sm text-gray-400">Severity *</label>
                        <select
                            name="severity"
                            value={formData.severity}
                            onChange={handleChange}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-[#1e293b] border border-gray-600 text-white"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>

                    {/* Application Types (Checkboxes) */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">
                            Application Types *
                        </label>

                        <div className="grid grid-cols-2 gap-3">

                            {applicationTypes.length > 0 ? (
                                applicationTypes.map((type) => (
                                    <label
                                        key={type.id}
                                        className="flex items-center gap-2 bg-[#1e293b] p-2 rounded-lg border border-gray-600 cursor-pointer hover:bg-[#2a3446]"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.application_types.includes(type.id)}
                                            onChange={() => handleCheckboxChange(type.id)}
                                        />
                                        <span>{type.name}</span>
                                    </label>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm">
                                    Loading types...
                                </p>
                            )}

                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Checklist"}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-5 py-2 rounded-lg border border-gray-600"
                        >
                            Cancel
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}