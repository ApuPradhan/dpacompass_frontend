
import { useEffect, useMemo, useState } from "react";
import AuditTable from "./AuditTable";
import RejectModal from "./RejectModal";
import { useNavigate } from "react-router-dom";
import {
    FiArrowLeft,
    FiClipboard,
    FiSearch,
    FiX
} from "react-icons/fi";
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
    const [searchTerm, setSearchTerm] = useState("");

    // =========================
    // FETCH TYPES
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
    // FETCH AUDITS
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
                    data?.detail ||
                    data?.message ||
                    "Failed to fetch applications"
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
    // FETCH USER
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
    // APPROVE / REJECT
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

            setAudits((prev) =>
                prev.filter((a) => a.id !== Number(appId))
            );

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
                const uniqueOwnerIds = [
                    ...new Set(audits.map((a) => a.owner))
                ];

                const results = await Promise.all(
                    uniqueOwnerIds.map((id) => fetchUserById(id))
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
    }));

    // =========================
    // SEARCH FILTER
    // =========================
    const filteredAudits = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        if (!query) return formattedAudits;

        return formattedAudits.filter((audit) =>
            [
                audit.name,
                audit.owner,
                audit.status,
                audit.type,
                audit.environment,
                audit.url
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(query)
                )
        );
    }, [formattedAudits, searchTerm]);

    // =========================
    // LOCAL THEME STYLES
    // =========================
    const styles = {
        page: "min-h-screen bg-white text-slate-800 p-6",

        backButton: `
        inline-flex items-center gap-2
        text-base font-semibold text-blue-700
        hover:text-blue-900
        cursor-pointer
        transition-colors duration-200
        `,

        heading: "text-2xl font-bold tracking-tight text-slate-900",

        subtitle: "text-sm text-slate-600 mt-1",

        tableCard: `
            bg-white border border-slate-200
            rounded-2xl p-4
            shadow-sm shadow-slate-200/60
        `,

        searchWrapper: `
            relative w-full max-w-md
        `,

        searchInput: `
            w-full h-12 pl-11 pr-10
            rounded-xl border border-slate-300
            bg-white text-base text-slate-800
            placeholder:text-slate-400
            outline-none transition-all duration-200
            focus:border-blue-500 focus:ring-4 focus:ring-blue-100
        `
    };

    // =========================
    // UI
    // =========================
    return (
        <div className={styles.page}>

            {/* Back Navigation */}
            <button
                type="button"
                onClick={() => navigate("/admindashboard")}
                className={styles.backButton}
            >
                <FiArrowLeft size={19} />
                Back to Dashboard
            </button>

            {/* Page Heading */}
            <div className="mt-9 mb-7 flex items-center gap-3">
                <div className="
                    h-12 w-12 rounded-xl bg-blue-50
                    flex items-center justify-center
                ">
                    <FiClipboard size={23} className="text-blue-700" />
                </div>

                <div>
                    <h1 className={styles.heading}>
                        New Pending Audit Applications
                    </h1>

                    <p className={styles.subtitle}>
                        Review and manage newly submitted audit applications.
                    </p>
                </div>
            </div>

            {/* Search and Results */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

                <div className={styles.searchWrapper}>
                    <FiSearch
                        size={20}
                        className="
                            absolute left-4 top-1/2
                            -translate-y-1/2 text-slate-400
                        "
                    />

                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by application, owner or status..."
                        className={styles.searchInput}
                    />

                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            aria-label="Clear search"
                            className="
                                absolute right-3 top-1/2
                                -translate-y-1/2
                                text-slate-400 hover:text-slate-700
                            "
                        >
                            <FiX size={19} />
                        </button>
                    )}
                </div>

                {!loading && !error && (
                    <p className="text-sm font-medium text-slate-600">
                        Showing{" "}
                        <span className="text-blue-700 font-bold">
                            {filteredAudits.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-bold text-slate-800">
                            {formattedAudits.length}
                        </span>{" "}
                        applications
                    </p>
                )}
            </div>

            {/* Applications Table */}
            <div className={styles.tableCard}>
                {loading ? (
                    <div className="flex items-center justify-center min-h-[40vh]">
                        <Loader text="Loading applications..." />
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center min-h-[40vh]">
                        <p className="text-base font-medium text-red-600">
                            {error}
                        </p>
                    </div>
                ) : filteredAudits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[35vh] text-center">
                        <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                            <FiClipboard size={26} className="text-blue-600" />
                        </div>

                        <h3 className="text-lg font-semibold text-slate-800">
                            {searchTerm
                                ? "No matching applications"
                                : "No pending applications"}
                        </h3>

                        <p className="text-sm text-slate-500 mt-2">
                            {searchTerm
                                ? "Try another application name, owner or status."
                                : "There are currently no applications awaiting review."}
                        </p>
                    </div>
                ) : (
                    <AuditTable
                        audits={filteredAudits}
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
                        reason
                    })
                }
            />

        </div>
    );
}
