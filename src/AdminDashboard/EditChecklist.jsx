import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function EditChecklist() {

    const navigate = useNavigate();
    const { id } = useParams();
    const token = localStorage.getItem("access");

    const [formData, setFormData] = useState({
        rule_id: "",
        description: "",
        severity: "low",
        application_types: [],
    });

    const [applicationTypes, setApplicationTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Fetch Application Types
    const fetchApplicationTypes = async () => {
        try {
            // const res = await fetch(
            //     `${BASE_URL}/api/applications/types/`,
            //     {
            //         credentials: "include",
            //     }
            // );

            const res = await fetch(
                `${BASE_URL}/api/applications/types/`,
                {
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

    // Fetch Checklist by ID
    const fetchChecklistById = async () => {
        try {
            // const res = await fetch(
            //     `${BASE_URL}/api/checklists/checklists/${id}/`,
            //     {
            //         credentials: "include",
            //     }
            // );

            const res = await fetch(
                `${BASE_URL}/api/checklists/checklists/${id}/`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await res.json();

            if (res.ok) {
                const checklist = data.data;

                setFormData({
                    rule_id: checklist.rule_id,
                    description: checklist.description,
                    severity: checklist.severity,
                    application_types: checklist.application_types.map(t => t.id),
                });
            }

        } catch (err) {
            console.error("Error fetching checklist:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplicationTypes();
        fetchChecklistById();
    }, [id]);

    // Handle Input Change
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handle Checkbox Toggle
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

    // Update Checklist
    const handleSubmit = async (e) => {
        e.preventDefault();

        setUpdating(true);

        try {
            // const res = await fetch(
            //     `${BASE_URL}/api/checklists/checklists/update/${id}/`,
            //     {
            //         method: "PUT",
            //         credentials: "include",
            //         body: JSON.stringify(formData),
            //     }
            // );

            const res = await fetch(
                `${BASE_URL}/api/checklists/checklists/update/${id}/`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await res.json();

            if (res.ok) {
                alert("Checklist updated successfully");
                navigate(-1);
            } else {
                console.error(data);
            }

        } catch (err) {
            console.error("Update failed:", err);
        } finally {
            setUpdating(false);
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Loading checklist...
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 bg-[#0b1120] text-gray-200 p-6">

            <div className="max-w-2xl mx-auto bg-[#111827]/80 border border-gray-700 rounded-xl p-6 shadow-lg">

                <h2 className="text-lg font-semibold mb-6 text-indigo-400">
                    Edit Checklist
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Rule ID (Disabled) */}
                    <div>
                        <label className="text-sm text-gray-400">Rule ID</label>
                        <input
                            type="text"
                            name="rule_id"
                            value={formData.rule_id}
                            disabled
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-[#1e293b] border border-gray-600 text-white opacity-70 cursor-not-allowed"
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

                    {/* Application Types */}
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
                            disabled={updating}
                            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {updating ? "Updating..." : "Update Checklist"}
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