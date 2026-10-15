import { useEffect, useState } from "react";
import {
    FiEye,
    FiEdit,
    FiTrash2,
    FiPlus,
    FiLoader
} from "react-icons/fi";

import CreateEvidence from "./CreateEvidence";
import EditEvidence from "./EditEvidence";
import ViewEvidence from "./ViewEvidence";
import { fetchWithAuth } from "../utilities/fetchWithAuth";


const EvidenceTable = () => {
    const token = localStorage.getItem("access");

    const [evidences, setEvidences] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selected, setSelected] = useState(null);

    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showView, setShowView] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const authHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };

    // ================= FETCH =================
    const fetchEvidence = async () => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(`/api/checklists/evidence/`, {
                method: "GET",
            });
            const data = await res.json();
            setEvidences(data.data || []);
        } catch (err) {
            console.error(err);
            setEvidences([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEvidence();
    }, []);

    // ================= DELETE =================
    const handleDelete = async () => {
        if (!selected) return;

        try {
            const res = await fetchWithAuth(
                `/api/checklists/evidence/${selected.id}/`,
                {
                    method: "DELETE",
                }
            );

            if (!res.ok) {
                throw new Error("Failed to delete evidence");
            }

            setShowDelete(false);
            setSelected(null);
            fetchEvidence();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-6 min-h-screen bg-linear-to-br from-[#0b0f2a] to-[#020617] text-white">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl text-indigo-300 font-semibold">
                    Evidence Management
                </h2>

                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                    <FiPlus />
                    Create Evidence
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-[#0f172a] border border-gray-700 rounded-xl overflow-hidden">

                {loading ? (
                    <div className="flex justify-center p-6">
                        <FiLoader className="animate-spin text-indigo-400 text-xl" />
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="text-gray-400 border-b border-gray-700">
                            <tr>
                                <th className="p-3 text-left">#</th>
                                <th className="p-3 text-left">Name</th>
                                <th className="p-3 text-left">Type</th>
                                <th className="p-3 text-left">Collection</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {evidences.map((e, index) => (
                                <tr
                                    key={e.id}
                                    className="border-b border-gray-800 hover:bg-[#1e293b] transition"
                                >
                                    <td className="p-3 text-gray-400">
                                        {index + 1}
                                    </td>

                                    <td className="p-3 text-gray-200">
                                        {e.name}
                                    </td>

                                    <td className="p-3 text-gray-400">
                                        {e.field_type}
                                    </td>

                                    <td className="p-3 text-gray-400">
                                        {e.collection_type}
                                    </td>

                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${e.is_active
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-yellow-500/20 text-yellow-400"
                                                }`}
                                        >
                                            {e.is_active ? "Published" : "Draft"}
                                        </span>
                                    </td>

                                    <td className="p-3 flex justify-center gap-5 text-lg">

                                        {/* VIEW */}
                                        <FiEye
                                            className="cursor-pointer text-indigo-400 hover:scale-110"
                                            onClick={() => {
                                                setSelected(e);
                                                setShowView(true);
                                            }}
                                        />

                                        {/* EDIT */}
                                        <FiEdit
                                            className="cursor-pointer text-violet-400 hover:scale-110"
                                            onClick={() => {
                                                setSelected(e);
                                                setShowEdit(true);
                                            }}
                                        />

                                        {/* DELETE (ONLY DRAFT) */}
                                        {!e.is_active && (
                                            <FiTrash2
                                                className="cursor-pointer text-red-400 hover:scale-110"
                                                onClick={() => {
                                                    setSelected(e);
                                                    setShowDelete(true);
                                                }}
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* CREATE */}
            {showCreate && (
                <CreateEvidence
                    onClose={() => setShowCreate(false)}
                    onSuccess={fetchEvidence}
                />
            )}

            {/* EDIT */}
            {showEdit && selected && (
                <EditEvidence
                    evidence={selected}
                    onClose={() => setShowEdit(false)}
                    onSuccess={fetchEvidence}
                />
            )}

            {/* VIEW */}
            {showView && selected && (
                <ViewEvidence
                    evidence={selected}
                    onClose={() => setShowView(false)}
                />
            )}

            {/* DELETE MODAL */}
            {showDelete && selected && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">

                    <div className="bg-[#0f172a] border border-gray-700 rounded-xl w-[400px] p-6 shadow-xl animate-scaleIn">

                        <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-red-400">
                                Delete Evidence
                            </h3>
                            <p className="text-gray-400 text-sm mt-1">
                                This action cannot be undone
                            </p>
                        </div>

                        <div className="text-center mb-5">
                            <p className="text-gray-300">
                                Delete
                            </p>
                            <p className="text-red-400 font-medium mt-1">
                                {selected.name} ?
                            </p>
                        </div>

                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setShowDelete(false)}
                                className="px-4 py-1.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDelete}
                                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default EvidenceTable;