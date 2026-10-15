import { useEffect, useState } from "react";
import {
    FiChevronDown,
    FiChevronRight,
    FiEdit,
    FiTrash2,
    FiUpload,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../utilities/fetchWithAuth";


const ViewChecklist = () => {
    const token = localStorage.getItem("access");
    const navigate = useNavigate();

    const [checklists, setChecklists] = useState([]);
    const [domains, setDomains] = useState([]);
    const [openId, setOpenId] = useState(null);
    const [applicationTypes, setApplicationTypes] = useState([]);

    const authHeaders = {
        Authorization: `Bearer ${token}`,
    };

    // ================= FETCH =================

    const fetchApplicationTypes = async () => {
        try {
            const res = await fetchWithAuth(`/api/applications/types/`, {
                method: "GET",
            });
            const data = await res.json();
            setApplicationTypes(data.data || []);
        } catch {
            toast.error("Failed to fetch application types");
        }
    };

    const fetchChecklist = async () => {
        try {
            const res = await fetchWithAuth(`/api/checklists/items/`, {
                method: "GET",
            });
            const data = await res.json();
            setChecklists(data.data || []);
        } catch {
            toast.error("Failed to fetch checklist");
        }
    };

    const fetchDomains = async () => {
        try {
            const res = await fetchWithAuth(`/api/checklists/domains/`, {
                method: "GET",
            });
            const data = await res.json();
            setDomains(data.data || []);
        } catch {
            toast.error("Failed to fetch domains");
        }
    };

    useEffect(() => {
        fetchChecklist();
        fetchDomains();
        fetchApplicationTypes();
    }, []);

    // ================= ACTIONS =================
    const handlePublish = async (id) => {
        try {
            const res = await fetchWithAuth(
                `/api/checklists/items/${id}/publish/`,
                {
                    method: "POST",
                }
            );

            if (!res.ok) {
                throw new Error("Publish failed");
            }

            toast.success("Checklist published");
            fetchChecklist();
        } catch {
            toast.error("Publish failed");
        }
    };
    const handleDelete = async (id) => {
        try {
            const res = await fetchWithAuth(
                `/api/checklists/items/${id}/`,
                {
                    method: "DELETE",
                }
            );

            if (!res.ok) {
                throw new Error("Delete failed");
            }

            toast.success("Checklist deleted");
            fetchChecklist();
        } catch {
            toast.error("Delete failed");
        }
    };

    // ================= UI =================
    return (
        <div className="p-6 min-h-screen bg-linear-to-br from-[#0b0f2a] via-[#0f172a] to-[#020617] text-white">

            <h2 className="text-2xl font-semibold mb-6 text-gray-200">
                Checklist Management
            </h2>

            <div className="bg-[#0f172a] border border-gray-700 rounded-xl overflow-hidden">

                {/* HEADER */}
                <div className="grid grid-cols-5 text-gray-400 text-sm border-b border-gray-700 p-3">
                    <div>#</div>
                    <div>Clause</div>
                    <div>Version</div>
                    <div>Status</div>
                    <div className="text-center">Actions</div>
                </div>

                {/* BODY */}
                {checklists.map((item, index) => {
                    const domainObj = domains.find((d) => d.id === item.domain);

                    return (
                        <div key={item.id} className="border-b border-gray-800">

                            {/* ROW */}
                            <div
                                className="grid grid-cols-5 p-3 items-center hover:bg-[#1e293b] transition cursor-pointer"
                                onClick={() =>
                                    setOpenId(openId === item.id ? null : item.id)
                                }
                            >
                                <div className="flex items-center gap-2">
                                    {openId === item.id ? (
                                        <FiChevronDown />
                                    ) : (
                                        <FiChevronRight />
                                    )}
                                    {index + 1}
                                </div>

                                <div>{item.clause}</div>

                                <div>{item.version}</div>

                                <div>
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full ${item.status === "published"
                                            ? "bg-green-500/20 text-green-400"
                                            : item.status === "draft"
                                                ? "bg-yellow-500/20 text-yellow-400"
                                                : "bg-red-500/20 text-red-400"
                                            }`}
                                    >
                                        {item.status}
                                    </span>
                                </div>

                                {/* ACTIONS */}
                                <div
                                    className="flex justify-center gap-3 text-lg"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* DRAFT */}
                                    {item.status === "draft" && (
                                        <>
                                            <FiEdit
                                                className="text-violet-400 hover:scale-110"
                                                onClick={() =>
                                                    navigate(`/admin/editChecklist/${item.id}`)
                                                }
                                            />

                                            <FiTrash2
                                                className="text-red-400 hover:scale-110"
                                                onClick={() => handleDelete(item.id)}
                                            />

                                            <FiUpload
                                                className="text-green-400 hover:scale-110"
                                                onClick={() => handlePublish(item.id)}
                                            />
                                        </>
                                    )}

                                    {/* DEPRECATED */}
                                    {(item.status === "deprecated" || item.status === "published") && (
                                        <span className="px-3 py-1 text-xs rounded-full bg-gray-600/20 text-gray-400 border border-gray-600/30">
                                            No Actions
                                        </span>
                                    )}

                                    {/* PUBLISHED → NO ACTION */}
                                </div>
                            </div>

                            {/* ACCORDION */}
                            {openId === item.id && (
                                <div className="bg-[#020617] px-6 py-4 text-sm space-y-4">
                                    {/* APPLICATION TYPES */}
                                    <div>
                                        <p className="text-gray-400 mb-2">Application Types</p>

                                        <div className="flex flex-wrap gap-2">
                                            {item.application_types?.map((typeId) => {
                                                const typeObj = applicationTypes.find(
                                                    (t) => t.id === typeId
                                                );

                                                return (
                                                    <span
                                                        key={typeId}
                                                        className="px-2 py-1 text-xs bg-violet-500/20 text-violet-300 rounded-full border border-violet-500/20"
                                                    >
                                                        {typeObj?.name || "Unknown"}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {/* DOMAIN */}
                                    <div>
                                        <p className="text-gray-400">Domain</p>
                                        <p className="text-indigo-300 font-medium">
                                            {domainObj?.name || "N/A"}
                                        </p>
                                    </div>

                                    {/* EVIDENCE */}
                                    <div>
                                        <p className="text-gray-400 mb-2">Evidence</p>

                                        <div className="flex flex-wrap gap-2">
                                            {item.evidence_mappings?.map((evMap) => (
                                                <span
                                                    key={evMap.id}
                                                    className="px-2 py-1 text-xs bg-indigo-500/20 text-indigo-300 rounded-full"
                                                >
                                                    {evMap.evidence?.name || "Unknown"}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ViewChecklist;