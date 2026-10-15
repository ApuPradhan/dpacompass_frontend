import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEye, FiCheck, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

import DynamicAuditTable from "../AdminDashboard/DynamicAuditTable";
import Loader from "../utilities/Loader";
import AuditViewModal from "./AuditViewModal";
import { fetchWithAuth } from "../utilities/fetchWithAuth";




export default function PendingAssignments() {
    const navigate = useNavigate();
    const token = localStorage.getItem("access");

    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAudit, setSelectedAudit] = useState(null);

    const [acceptingId, setAcceptingId] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [auditToReject, setAuditToReject] = useState(null);

    const fetchPendingAssignments = async () => {
        try {
            const res = await fetchWithAuth("/api/audits/assignments/pending/");

            const data = await res.json();

            if (!res.ok) {
                setError("Failed to fetch pending assignments");
                return;
            }

            const applicationIds = [...new Set(data.map(a => a.application_id))];

            const appResponses = await Promise.all(
                applicationIds.map(id =>
                    fetchWithAuth(`/api/applications/applications/${id}/`)
                        .then(res => res.json())
                )
            );

            const appMap = {};
            appResponses.forEach(app => {
                if (app?.data) appMap[app.data.id] = app.data;
            });

            const checklistResponses = await Promise.all(
                applicationIds.map(id =>
                    fetchWithAuth(`/api/checklists/application/${id}/`)
                        .then(res => res.json())
                )
            );

            const checklistMap = {};
            checklistResponses.forEach(res => {
                if (res?.application?.id) {
                    checklistMap[res.application.id] = res.domains || [];
                }
            });

            const enriched = data.map(a => ({
                ...a,
                application_details: appMap[a.application_id] || null,
                domains: checklistMap[a.application_id] || [],
            }));

            setAudits(enriched);
        } catch (err) {
            console.error(err);
            setError("Server Error");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (auditId) => {
        try {
            setAcceptingId(auditId);

            const res = await fetchWithAuth(
                `/api/audits/assignments/${auditId}/accept/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to accept assignment");
            }

            toast.success("Assignment Accepted");
            setSelectedAudit(null);
            fetchPendingAssignments();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setAcceptingId(null);
        }
    };

    const openRejectModal = (auditId) => {
        setAuditToReject(auditId);
        setRejectReason("");
        setShowRejectModal(true);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.warning("Please provide rejection reason");
            return;
        }

        try {
            setRejectingId(auditToReject);

            const res = await fetchWithAuth(
                `/api/audits/assignments/${auditToReject}/reject/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        reason: rejectReason,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to reject assignment");
            }

            toast.success("Assignment Rejected");
            setShowRejectModal(false);
            setSelectedAudit(null);
            fetchPendingAssignments();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setRejectingId(null);
        }
    };

    useEffect(() => {
        fetchPendingAssignments();
    }, []);

    const formattedAudits = audits.map(a => ({
        id: a.audit_id,
        application_id: a.application_id,
        name: a.application_details?.name || "N/A",
        auditor_name: a.auditor_name || "N/A",
        status: a.status || "Pending",
        created_at: a.created_at,
        url: a.application_details?.url,
        domains: a.domains,
    }));

    const columns = [
        { key: "name", label: "Application" },
        { key: "auditor_name", label: "Auditor" },
        {
            key: "status",
            label: "Status",
            render: value => (
                <span
                    className={`px-3 py-1 text-xs rounded-full border ${value === "assigned"
                        ? "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
                        : value === "accepted"
                            ? "text-green-400 bg-green-500/20 border-green-500/30"
                            : "text-red-400 bg-red-500/20 border-red-500/30"
                        }`}
                >
                    {value}
                </span>
            ),
        },
    ];

    const renderActions = row => (
        <div className="flex justify-center items-center gap-3">
            <button
                onClick={() => setSelectedAudit(row)}
                className="text-indigo-400 hover:text-indigo-300"
                title="View"
            >
                <FiEye />
            </button>

            <button
                disabled={acceptingId === row.id}
                onClick={() => handleAccept(row.id)}
                className="text-green-400 hover:text-green-300"
                title="Accept"
            >
                <FiCheck />
            </button>

            <button
                disabled={rejectingId === row.id}
                onClick={() => openRejectModal(row.id)}
                className="text-red-400 hover:text-red-300"
                title="Reject"
            >
                <FiX />
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0b1120] text-gray-200 p-6">

            <div
                className="mb-10 flex items-center gap-2 text-xl text-indigo-400 cursor-pointer"
                onClick={() => navigate("/auditdashboard")}
            >
                <FiArrowLeft size={16} />
                <span>Back to Dashboard</span>
            </div>

            <h1 className="text-xl font-semibold text-indigo-400 mb-6">
                Pending Assignments
            </h1>

            <div className="bg-[#111827]/80 border border-gray-700 rounded-xl p-4">
                {loading ? (
                    <Loader text="Loading pending assignments..." />
                ) : error ? (
                    <div className="text-red-400">{error}</div>
                ) : (
                    <DynamicAuditTable
                        audits={formattedAudits}
                        columns={columns}
                        customActions={renderActions}
                        expandableContent={true}
                    />
                )}
            </div>

            <AuditViewModal
                audit={selectedAudit}
                onClose={() => setSelectedAudit(null)}
            />

            {showRejectModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="w-full max-w-lg rounded-xl bg-[#111827] border border-gray-700 p-6">

                        <h2 className="text-xl font-semibold text-red-400 mb-4">
                            Reject Assignment
                        </h2>

                        <textarea
                            rows={5}
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            className="w-full rounded-lg bg-[#1e293b] border border-gray-700 p-3 text-sm outline-none focus:border-red-500"
                        />

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason("");
                                    setAuditToReject(null);
                                }}
                                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={rejectingId !== null}
                                onClick={handleReject}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
                            >
                                Submit Rejection
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}