import { useEffect, useState } from "react";
import {
    FiEdit,
    FiTrash2,
    FiPlus,
    FiLoader
} from "react-icons/fi";

import CreateDomain from "./CreateDomain";
import EditDomain from "./EditDomain";
import { toast } from "react-toastify";

const DomainTable = () => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("access");

    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selected, setSelected] = useState(null);

    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showCreate, setShowCreate] = useState(false);

    const authHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };

    // ================= FETCH =================
    const fetchDomains = async () => {
        if (!token) return;

        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/checklists/domains/`, {
                headers: authHeaders
            });
            const data = await res.json();
            setDomains(data.data || []);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDomains();
    }, []);

    // ================= DELETE =================
    const handleDelete = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/checklists/domains/${selected.id}/`, {
                method: "DELETE",
                headers: authHeaders
            });

            if (res.ok) {
                toast.success("Domain deleted successfully");
                setShowDelete(false);
                fetchDomains();
            } else {
                toast.error("Failed to delete domain");
            }
        } catch (err) {
            toast.error("Something went wrong");
        }
    };
    return (
        <div className="p-6 min-h-screen bg-linear-to-br from-[#0b0f2a] via-[#0f172a] to-[#020617] text-white">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-200">
                    Domain Management
                </h2>

                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                    <FiPlus />
                    Create Domain
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-[#0f172a] border border-gray-700 rounded-xl overflow-hidden">

                {loading ? (
                    <div className="flex justify-center p-6">
                        <FiLoader className="animate-spin text-xl text-indigo-400" />
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="text-gray-400 border-b border-gray-700">
                            <tr>
                                <th className="p-3 text-left">#</th>
                                <th className="p-3 text-left">Name</th>
                                <th className="p-3 text-left">Description</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {domains.map((d, index) => (
                                <tr
                                    key={d.id}
                                    className="border-b border-gray-800 hover:bg-[#1e293b] transition"
                                >
                                    <td className="p-3 text-gray-400">
                                        {index + 1}
                                    </td>

                                    <td className="p-3 text-gray-200">
                                        {d.name}
                                    </td>

                                    <td className="p-3 text-gray-400">
                                        {d.description}
                                    </td>

                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${d.is_active
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-red-500/20 text-red-400"
                                                }`}
                                        >
                                            {d.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    <td className="p-3 flex justify-center gap-5 text-lg">
                                        <FiEdit
                                            className="cursor-pointer text-violet-400 hover:scale-110"
                                            onClick={() => {
                                                setSelected(d);
                                                setShowEdit(true);
                                            }}
                                        />

                                        <FiTrash2
                                            className="cursor-pointer text-red-400 hover:scale-110"
                                            onClick={() => {
                                                setSelected(d);
                                                setShowDelete(true);
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* CREATE */}
            {showCreate && (
                <CreateDomain
                    onClose={() => setShowCreate(false)}
                    onSuccess={fetchDomains}
                />
            )}

            {/* EDIT */}
            {showEdit && selected && (
                <EditDomain
                    domain={selected}
                    onClose={() => setShowEdit(false)}
                    onSuccess={fetchDomains}
                />
            )}

            {/* DELETE MODAL */}
            {showDelete && selected && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">

                    <div className="bg-[#0f172a] border border-gray-700 rounded-xl w-100 p-6 shadow-xl animate-scaleIn">

                        {/* ICON + TITLE */}
                        <div className="flex flex-col items-center text-center mb-4">
                            <div className="bg-red-500/20 text-red-400 p-3 rounded-full mb-3">
                                <FiTrash2 size={22} />
                            </div>

                            <h3 className="text-lg font-semibold text-white">
                                Delete Domain
                            </h3>

                            <p className="text-gray-400 text-sm mt-1">
                                This action cannot be undone
                            </p>
                        </div>

                        {/* CONTENT */}
                        <div className="text-center mb-5">
                            <p className="text-gray-300">
                                Are you sure you want to delete
                            </p>
                            <p className="text-red-400 font-medium mt-1">
                                {selected.name} ?
                            </p>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setShowDelete(false)}
                                className="px-4 py-1.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDelete}
                                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition flex items-center gap-2"
                            >
                                <FiTrash2 size={16} />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DomainTable;