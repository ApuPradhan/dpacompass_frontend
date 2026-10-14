import { useEffect, useState } from "react";
import AuditTable from "./AuditTable";
import RejectModal from "./RejectModal";
import { cardClass } from "../theme";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Loader from "../utilities/Loader";
import AuditPendingViewModal from "./AuditPendingViewModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

export default function PendingAudits() {

    const navigate = useNavigate();

    const [userMap, setUserMap] = useState({});
    const [typeMap, setTypeMap] = useState({});
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [rejectModal, setRejectModal] = useState(null);
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // =========================
    // 🔁 FETCH TYPES (ID → NAME)
    // =========================
    const fetchTypes = async () => {
        try {
            const res = await fetchWithAuth(`/api/applications/types/`, {
                method: "GET",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.detail || "Failed to fetch types");
            }

            const map = {};
            data.data.forEach((t) => {
                map[t.id] = t.name;
            });

            setTypeMap(map);

        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    };

    // =========================
    // 📥 FETCH AUDITS
    // =========================
    const fetchAudits = async () => {
        try {
            const res = await fetchWithAuth(
                `/api/applications/applications/pending`,
                { method: "GET" }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data?.detail || data?.message || "Failed to fetch applications"
                );
            }

            setAudits(data);

        } catch (err) {
            console.error(err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setTimeout(() => setLoading(false), 1000);
        }
    };

    // =========================
    // 👤 FETCH USER
    // =========================
    const fetchUserById = async (userId) => {
        try {
            const res = await fetchWithAuth(
                `/api/auth/admin/user/${userId}/`,
                { method: "GET" }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.detail || "Failed to fetch user");
            }

            return data.data;

        } catch (err) {
            console.error(err);
            return null;
        }
    };

    // =========================
    // 🔁 ACTION (APPROVE / REJECT)
    // =========================
    const handleApplicationAction = async ({
        appId,
        status,
        reason = "",
    }) => {
        try {
            const body = { status };

            if (status === "rejected") {
                body.remarks = reason;
            }

            const res = await fetchWithAuth(
                `/api/applications/applications/${appId}/status/`,
                {
                    method: "PATCH",
                    body: JSON.stringify(body),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    data?.error ||
                    "Action failed"
                );
            }

            // ✅ instant UI update
            setAudits((prev) => prev.filter((a) => a.id !== Number(appId)));

            // ✅ backend sync (VERY IMPORTANT)
            await fetchAudits();

            setRejectModal(null);
            setSelectedAudit(null);

            toast.success(
                status === "approved"
                    ? "Audit application approved"
                    : "Application rejected"
            );

        } catch (err) {
            console.error(err);
            toast.error(err.message || "Server error");
        }
    };

    // =========================
    // 🚀 INITIAL LOAD
    // =========================
    useEffect(() => {
        fetchAudits();
        fetchTypes();
    }, []);

    // =========================
    // 👤 MAP OWNERS
    // =========================
    useEffect(() => {
        if (audits.length === 0) return;

        const fetchOwners = async () => {
            try {
                const uniqueOwnerIds = [...new Set(audits.map(a => a.owner))];

                const results = await Promise.all(
                    uniqueOwnerIds.map(id => fetchUserById(id))
                );

                const newUserMap = {};

                results.forEach((user) => {
                    if (user) {
                        newUserMap[user.id] = user.name;
                    }
                });

                setUserMap(newUserMap);

            } catch (err) {
                console.error(err);
            }
        };

        fetchOwners();
    }, [audits]);

    // =========================
    // 📊 FORMAT DATA
    // =========================
    const formattedAudits = audits.map((a) => ({
        id: a.id,
        name: a.name,
        owner: userMap[a.owner] || "Loading...",
        department: a.department,
        environment: a.environment,
        url: a.url,
        type: typeMap[Number(a.type)] || "Unknown",
        version: a.version,
        data_categories: a.data_categories,
        description: a.description,
        created_at: a.created_at,
        status: a.status,
    }));

    // =========================
    // 🧱 UI
    // =========================
    return (
        <div className="min-h-screen bg-linear-to-br from-[#0f172a] to-[#1e293b] text-white p-6">

            {/* Back */}
            <div
                className="mb-10 flex items-center gap-2 text-xl text-indigo-400 cursor-pointer hover:text-indigo-300"
                onClick={() => navigate("/admindashboard")}
            >
                <FiArrowLeft size={16} />
                <span>Back to Dashboard</span>
            </div>

            <h1 className="text-2xl font-semibold text-indigo-300 mb-6">
                New Pending Audit Applications
            </h1>

            <div className={`${cardClass} p-4`}>
                {loading ? (
                    <div className="flex items-center justify-center h-[40vh]">
                        <Loader text="Loading applications..." />
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-[40vh]">
                        <p className="text-red-400">{error}</p>
                    </div>
                ) : formattedAudits.length === 0 ? (
                    <div>No records to show</div>
                ) : (
                    <AuditTable
                        audits={formattedAudits}
                        onView={setSelectedAudit}
                        userMap={userMap}
                    />
                )}
            </div>

            {/* View Modal */}
            <AuditPendingViewModal
                audit={selectedAudit}
                onClose={() => setSelectedAudit(null)}
                onApprove={(appId) =>
                    handleApplicationAction({
                        appId: String(appId),
                        status: "approved",
                    })
                }
                onReject={setRejectModal}
            />

            {/* Reject Modal */}
            <RejectModal
                audit={rejectModal}
                onClose={() => setRejectModal(null)}
                onReject={(appId, reason) =>
                    handleApplicationAction({
                        appId: String(appId),
                        status: "rejected",
                        reason: reason
                    })
                }
            />
        </div>
    );
}