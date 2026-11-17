
import { useEffect, useState } from "react";
import AuditTable from "./AuditTable";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiClipboard, FiXCircle } from "react-icons/fi";
import Loader from "../utilities/Loader";
import AuditRejectedViewModal from "./AuditRejectedViewModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

export default function RejectedAudits() {
    const navigate = useNavigate();

    const [userMap, setUserMap] = useState({});
    const [typeMap, setTypeMap] = useState({});
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // =====================================================
    // LOCAL STYLING VARIABLES
    // =====================================================

    const styles = {
        page: "rejected-audits-page",
        backButton:
            "inline-flex items-center gap-2 text-base font-semibold text-[#087FD3] transition-colors duration-200 hover:text-[#0568B5] cursor-pointer",
        pageTitle:
            "text-2xl font-bold tracking-tight text-[#14213D] sm:text-3xl",
        pageDescription:
            "mt-2 text-sm leading-6 text-slate-500 sm:text-base",
        card:
            "overflow-hidden rounded-xl border border-[#DCE7F3] bg-white shadow-sm",
        emptyState:
            "flex min-h-[300px] flex-col items-center justify-center text-center",
        retryButton:
            "mt-5 inline-flex items-center gap-2 rounded-lg bg-[#087FD3] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0568B5] cursor-pointer",
    };

    // =====================================================
    // FETCH APPLICATION TYPES
    // =====================================================

    const fetchTypes = async () => {
        try {
            const res = await fetchWithAuth(
                "/api/applications/types/",
                { method: "GET" }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.detail || "Failed to fetch types");
            }

            const map = {};

            data.data.forEach((type) => {
                map[type.id] = type.name;
            });

            setTypeMap(map);
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    };

    // =====================================================
    // FETCH REJECTED AUDITS
    // =====================================================

    const fetchAudits = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetchWithAuth(
                "/api/applications/applications/rejected",
                { method: "GET" }
            );

            const data = await res.json();

            console.log(data);

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

    // =====================================================
    // FETCH USER BY ID
    // =====================================================

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

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        fetchAudits();
        fetchTypes();
    }, []);

    // =====================================================
    // MAP APPLICATION OWNERS
    // =====================================================

    useEffect(() => {
        if (audits.length === 0) return;

        const fetchOwners = async () => {
            try {
                const uniqueOwnerIds = [
                    ...new Set(audits.map((audit) => audit.owner)),
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

    // =====================================================
    // FORMAT DATA
    // =====================================================

    const formattedAudits = audits.map((audit) => ({
        id: audit.id,
        name: audit.name,
        owner: userMap[audit.owner] || "Loading...",
        department: audit.department,
        environment: audit.environment,
        url: audit.url,
        type: typeMap[Number(audit.type)] || "Unknown",
        version: audit.version,
        data_categories: audit.data_categories,
        description: audit.description,
        created_at: audit.created_at,
        status: audit.status,
        remarks: audit.remarks,
        application_id: audit.application_id,
    }));

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className={styles.page}>
            <style>{`
                .rejected-audits-page {
                    min-height: 100vh;
                    width: 100%;
                    box-sizing: border-box;
                    padding: 28px 32px 40px;
                    background: #F4F7FB;
                    color: #1E293B;
                }

                .rejected-audits-page *,
                .rejected-audits-page *::before,
                .rejected-audits-page *::after {
                    box-sizing: border-box;
                }

                .rejected-audits-page .rejected-content-card {
                    width: 100%;
                    min-width: 0;
                }

                @media (max-width: 768px) {
                    .rejected-audits-page {
                        padding: 20px 16px 30px;
                    }
                }

                @media (max-width: 480px) {
                    .rejected-audits-page {
                        padding: 18px 12px 24px;
                    }
                }
            `}</style>

            {/* BACK BUTTON */}

            <button
                type="button"
                onClick={() => navigate("/admindashboard")}
                className={styles.backButton}
            >
                <FiArrowLeft size={19} />
                Back to Dashboard
            </button>

            {/* PAGE HEADER */}

            <div className="mb-8 mt-7 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className={styles.pageTitle}>
                        Rejected Audit Applications
                    </h1>

                    <p className={styles.pageDescription}>
                        Review applications that have been rejected and
                        examine the associated details and remarks.
                    </p>
                </div>

                <div className="hidden shrink-0 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 sm:flex">
                    <FiClipboard size={17} />
                    Audit Management
                </div>
            </div>

            {/* MAIN CONTENT */}


            {/* MAIN CONTENT */}

            <div className={styles.card}>
                {loading ? (
                    <div className="flex min-h-[350px] items-center justify-center">
                        <Loader text="Loading applications..." />
                    </div>
                ) : error ? (
                    <div className={styles.emptyState}>
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                            <FiXCircle size={29} />
                        </div>

                        <h3 className="text-lg font-semibold text-slate-800">
                            Unable to load applications
                        </h3>

                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={fetchAudits}
                            className={styles.retryButton}
                        >
                            Try Again
                        </button>
                    </div>
                ) : formattedAudits.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                            <FiClipboard size={30} />
                        </div>

                        <h3 className="text-lg font-semibold text-[#173B70]">
                            No Rejected Applications
                        </h3>

                        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                            There are currently no rejected application records available.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* CARD HEADER - ONLY WHEN RECORDS EXIST */}

                        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
                            <div>
                                <h2 className="text-lg font-bold text-[#173B70]">
                                    Rejected Applications
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    View rejected application records and their details.
                                </p>
                            </div>

                            <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                                {formattedAudits.length} Records
                            </span>
                        </div>

                        {/* TABLE */}

                        <div className="p-4 sm:p-6">
                            <div className="mb-4 text-sm text-slate-500">
                                Showing{" "}
                                <span className="font-semibold text-slate-800">
                                    {formattedAudits.length}
                                </span>{" "}
                                rejected applications
                            </div>

                            <div className="w-full overflow-x-auto">
                                <AuditTable
                                    audits={formattedAudits}
                                    onView={setSelectedAudit}
                                    userMap={userMap}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* VIEW MODAL */}

            <AuditRejectedViewModal
                audit={selectedAudit}
                onClose={() => setSelectedAudit(null)}
            />
        </div>
    );
}
