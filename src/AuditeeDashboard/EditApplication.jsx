import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Input from "./Input";
import Textarea from "./TextArea";
import Select from "./Select";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function EditApplication() {

    const { id } = useParams();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "",
        environment: "",
        owner: user?.first_name + " " + user?.last_name,
        department: "",
        url: "",
        version: "",
        dataCategories: "",
    });

    const [applicationTypes, setApplicationTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState(false);
    const token = localStorage.getItem("access");

    const fetchApplication = async () => {
        try {
            // const res = await fetch(
            //     `${BASE_URL}/api/applications/applications/${id}/`,
            //     {
            //        credentials: "include",
            //     }
            // );

            const res = await fetch(`${BASE_URL}/api/applications/applications/${id}/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });


            const data = await res.json();

            if (res.ok) {
                const app = data.data;

                setFormData({
                    name: app.name || "",
                    description: app.description || "",
                    type: app.type || "",
                    environment: app.environment || "",
                    owner: user?.first_name + " " + user?.last_name, // from localStorage
                    department: app.department || "",
                    url: app.url || "",
                    version: app.version || "",
                    dataCategories: app.data_categories || "",
                });
            }

        } catch (err) {
            console.error("Error fetching application:", err);
        } finally {
            setLoading(false);
        }
    };


    const fetchTypes = async () => {
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
            setApplicationTypes(data.data);

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchApplication();
        fetchTypes();
    }, [id]);


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };


    const handleUpdate = async () => {
        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                type: formData.type,
                environment: formData.environment,
                department: formData.department,
                url: formData.url,
                version: formData.version,
                data_categories: formData.dataCategories,
            };

            const res = await fetch(
                `${BASE_URL}/api/applications/applications/${id}/update/`,
                {
                    method: "PATCH",
                    credentials: "include",
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();

            if (res.ok) {
                setConfirmModal(false);
                alert("Application updated successfully");
                navigate("/devdashboard");
            } else {
                console.error(data);
            }

        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Loading application...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b1120] text-gray-200 p-6">

            <div className="bg-[#111827]/80 border border-gray-700 rounded-xl p-6 shadow-lg">

                <h2 className="text-lg font-semibold mb-6 text-indigo-400">
                    Edit Application
                </h2>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    setConfirmModal(true);
                }}>

                    <Input label="Name *" name="name" value={formData.name} onChange={handleChange} />

                    <Textarea label="Description *" name="description" value={formData.description} onChange={handleChange} />

                    <div className="grid grid-cols-2 gap-4">
                        <select
                            className="w-full px-3 py-2 rounded-lg bg-[#1e293b] border border-gray-600 text-white"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="">Select type</option>
                            {applicationTypes.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>

                        <Select
                            label="Environment *"
                            name="environment"
                            value={formData.environment}
                            onChange={handleChange}
                            options={["Production", "Staging", "Development"]}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Owner" name="owner" value={formData.owner} disabled />
                        <Input label="Department" name="department" value={formData.department} onChange={handleChange} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="URL" name="url" value={formData.url} onChange={handleChange} />
                        <Input label="Version *" name="version" value={formData.version} onChange={handleChange} />
                    </div>

                    <Textarea
                        label="Data Categories"
                        name="dataCategories"
                        value={formData.dataCategories}
                        onChange={handleChange}
                    />

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700"
                        >
                            Update Application
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
                {confirmModal && (
                    <>
                        {/* Overlay */}
                        <div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                            onClick={() => setConfirmModal(false)}
                        />

                        {/* Modal */}
                        <div className="fixed inset-0 flex items-center justify-center z-50">
                            <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 w-100 shadow-lg">

                                <h2 className="text-lg font-semibold text-indigo-400 mb-4">
                                    Confirm Update
                                </h2>

                                <p className="text-sm text-gray-300 mb-6">
                                    Are you sure you want to update this application?
                                </p>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setConfirmModal(false)}
                                        className="px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-700/40"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleUpdate}
                                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Yes, Update
                                    </button>
                                </div>

                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}