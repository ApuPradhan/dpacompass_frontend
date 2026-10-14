import { useEffect, useState } from "react";
import AuditTable from "../AdminDashboard/AuditTable";
import { cardClass } from "../theme";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Loader from "../utilities/Loader";
import RejectedAuditViewModal from "./RejectedAuditViewModal";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

export default function RejectedApplications() {

    const navigate = useNavigate();

    const [userMap, setUserMap] = useState({});
    const [typeMap, setTypeMap] = useState({});
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // =========================
    // SAFE JSON
    // =========================
    const safeJson = async (res) => {
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch {
            throw new Error("Invalid server response");
        }
    };

    // =========================
    // FETCH TYPES
    // =========================
    const fetchTypes = async () => {
        try {
            const res = await fetchWithAuth(`/api/applications/types/`, {
                method: "GET",
            });

            const data = await safeJson(res);

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
    // FETCH REJECTED AUDITS
    // =========================
    const fetchAudits = async () => {
        try {
            const res = await fetchWithAuth(
                `/api/applications/applications/rejected`,
                { method: "GET" }
            );

            const data = await safeJson(res);

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
            setTimeout(() => setLoading(false), 800);
        }
    };

    // =========================
    // FETCH USER
    // =========================
    const fetchUserById = async (userId) => {
        try {
            const res = await fetchWithAuth(
                `/api/auth/admin/user/${userId}/`,
                { method: "GET" }
            );

            const data = await safeJson(res);

            if (!res.ok) {
                throw new Error("Failed to fetch user");
            }

            return data.data;

        } catch (err) {
            console.error(err);
            return null;
        }
    };

    // =========================
    // INITIAL LOAD
    // =========================
    useEffect(() => {
        fetchAudits();
        fetchTypes();
    }, []);

    // =========================
    // MAP OWNERS
    // =========================
    useEffect(() => {
        if (audits.length === 0) return;

        const fetchOwners = async () => {
            try {
                const uniqueOwnerIds = [...new Set(audits.map(a => a.owner))];

                const results = await Promise.all(
                    uniqueOwnerIds.map(id => fetchUserById(id))
                );

                const map = {};
                results.forEach((user) => {
                    if (user) {
                        map[user.id] = user.name;
                    }
                });

                setUserMap(map);

            } catch (err) {
                console.error(err);
            }
        };

        fetchOwners();
    }, [audits]);

    // =========================
    // FORMAT DATA
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
        remarks: a.remarks
    }));

    // =========================
    // UI
    // =========================
    return (
        <div className="min-h-screen bg-linear-to-br from-[#0f172a] to-[#1e293b] text-white p-6">

            {/* Back */}
            <div
                className="mb-10 flex items-center gap-2 text-xl text-indigo-400 cursor-pointer hover:text-indigo-300"
                onClick={() => navigate("/devdashboard")}
            >
                <FiArrowLeft size={16} />
                <span>Back to Dashboard</span>
            </div>

            <h1 className="text-2xl font-semibold text-indigo-300 mb-6">
                Rejected Applications
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

            {/* Modal */}
            <RejectedAuditViewModal
                audit={selectedAudit}
                onClose={() => setSelectedAudit(null)}
            />

        </div>
    );
}