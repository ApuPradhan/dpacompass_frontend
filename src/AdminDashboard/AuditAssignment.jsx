
import { useEffect, useMemo, useState } from "react";
import AuditTable from "./AuditTable";
import { useNavigate } from "react-router-dom";
import {
    FiArrowLeft,
    FiClipboard,
    FiSearch,
    FiX,
    FiCheckCircle
} from "react-icons/fi";
import Loader from "../utilities/Loader";
import AuditAssignmentModal from "./AuditAssignmentModal";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

export default function AuditAssignment() {

    const navigate = useNavigate();

    const [userMap, setUserMap] = useState({});
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [assignModal, setAssignModal] = useState(null);
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // =====================================================
    // LOCAL THEME STYLES
    // =====================================================

    const styles = {

        page: `
            min-h-screen w-full
            bg-white text-slate-800
            p-6
        `,

        backButton: `
            inline-flex items-center gap-2
            text-base font-semibold
            text-blue-700 hover:text-blue-900
            cursor-pointer
            transition-colors duration-200
        `,

        heading: `
            text-2xl font-bold tracking-tight
            text-[#14213D]
        `,

        subtitle: `
            text-sm font-medium
            text-slate-600 mt-1
        `,

        iconContainer: `
            h-12 w-12 rounded-xl
            bg-blue-50
            border border-blue-100
            flex items-center justify-center
        `,

        successMessage: `
            mb-5 flex items-center gap-3
            px-4 py-3
            rounded-xl
            bg-emerald-50
            border border-emerald-200
            text-emerald-800
            text-sm font-semibold
        `,

        searchWrapper: `
            relative w-full max-w-md
        `,

        searchInput: `
            w-full h-12
            pl-11 pr-10
            rounded-xl
            border border-slate-300
            bg-white
            text-base text-slate-800
            placeholder:text-slate-400
            outline-none
            transition-all duration-200
            focus:border-blue-500
            focus:ring-4 focus:ring-blue-100
        `,

        tableCard: `
            w-full
            bg-white
            border border-slate-200
            rounded-2xl
            p-4
            shadow-sm shadow-slate-200/60
        `,

        loadingContainer: `
            flex items-center justify-center
            min-h-[40vh]
        `,

        errorMessage: `
            px-5 py-4
            rounded-xl
            bg-red-50
            border border-red-200
            text-red-700
            text-base font-medium
        `,

        emptyContainer: `
            flex flex-col items-center justify-center
            min-h-[35vh]
            text-center
        `,

        emptyIcon: `
            h-14 w-14 rounded-2xl
            bg-blue-50
            border border-blue-100
            flex items-center justify-center
            text-blue-600 mb-4
        `
    };


    // =====================================================
    // REMOVE AUDIT
    // =====================================================

    const removeAudit = (id) => {
        setAudits((prev) => prev.filter((a) => a.id !== id));
    };


    // =====================================================
    // FETCH AUDITS
    // =====================================================

    const fetchAudits = async () => {
        try {

            const response = await fetchWithAuth(
                `/api/applications/applications/approved`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                setAudits(data);
                setError(null);
            } else {
                console.error(data);
                setError("Failed to fetch applications");
            }

        } catch (err) {
            console.error(err);
            setError("Server error");
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    };


    // =====================================================
    // FETCH USER
    // =====================================================

    const fetchUserById = async (userId) => {
        try {

            const res = await fetchWithAuth(
                `/api/auth/admin/user/${userId}/`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await res.json();

            if (res.ok) {
                return data.data;
            }

        } catch (err) {
            console.error(err);
        }

        return null;
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        fetchAudits();
    }, []);


    // =====================================================
    // REFRESH AFTER SUCCESS
    // =====================================================

    useEffect(() => {
        if (successMsg) {
            fetchAudits();
        }
    }, [successMsg]);


    // =====================================================
    // MAP OWNERS
    // =====================================================

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


    // =====================================================
    // FORMAT DATA
    // =====================================================

    const formattedAudits = audits.map((a) => ({
        id: a.id,
        name: a.name,
        owner: userMap[a.owner] || "Loading...",
        department: a.department,
        environment: a.environment,
        url: a.url,
        type: a.type,
        version: a.version,
        data_categories: a.data_categories,
        description: a.description,
        created_at: a.created_at,
        status: a.status,
        application_id: a.id
    }));


    // =====================================================
    // SEARCH FILTER
    // =====================================================

    const filteredAudits = useMemo(() => {

        const query = searchTerm.trim().toLowerCase();

        if (!query) return formattedAudits;

        return formattedAudits.filter((audit) => {

            const searchableFields = [
                audit.name,
                audit.owner,
                audit.status,
                audit.department,
                audit.environment,
                audit.type,
                audit.url
            ];

            return searchableFields
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(query)
                );
        });

    }, [formattedAudits, searchTerm]);


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className={styles.page}>

            {/* Back Navigation */}

            <button
                type="button"
                onClick={() => navigate("/admindashboard")}
                className={styles.backButton}
            >
                <FiArrowLeft size={19} />
                <span>Back to Dashboard</span>
            </button>


            {/* Page Heading */}

            <div className="mt-9 mb-7 flex items-center gap-3">

                <div className={styles.iconContainer}>
                    <FiClipboard size={23} />
                </div>

                <div>
                    <h1 className={styles.heading}>
                        New Audit Applications
                    </h1>

                    <p className={styles.subtitle}>
                        Review approved applications and assign auditors.
                    </p>
                </div>

            </div>


            {/* Success Message */}

            {successMsg && (
                <div className={styles.successMessage}>
                    <FiCheckCircle size={20} />
                    <span>{successMsg}</span>
                </div>
            )}


            {/* Search and Result Count */}

            {!loading && !error && (

                <div className="
                    flex flex-col sm:flex-row
                    sm:items-center sm:justify-between
                    gap-4 mb-5
                ">

                    <div className={styles.searchWrapper}>

                        <FiSearch
                            size={20}
                            className="
                                absolute left-4 top-1/2
                                -translate-y-1/2
                                text-slate-400
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
                                aria-label="Clear search"
                                onClick={() => setSearchTerm("")}
                                className="
                                    absolute right-3 top-1/2
                                    -translate-y-1/2
                                    text-slate-400
                                    hover:text-slate-700
                                    cursor-pointer
                                "
                            >
                                <FiX size={19} />
                            </button>
                        )}

                    </div>

                    <p className="text-sm font-medium text-slate-600">

                        Showing{" "}
                        <span className="font-bold text-blue-700">
                            {filteredAudits.length}
                        </span>

                        {" "}of{" "}

                        <span className="font-bold text-slate-900">
                            {formattedAudits.length}
                        </span>

                        {" "}applications

                    </p>

                </div>
            )}


            {/* Applications Table */}

            <div className={styles.tableCard}>

                {loading ? (

                    <div className={styles.loadingContainer}>
                        <Loader text="Loading applications..." />
                    </div>

                ) : error ? (

                    <div className={styles.loadingContainer}>
                        <p className={styles.errorMessage}>
                            {error}
                        </p>
                    </div>

                ) : filteredAudits.length === 0 ? (

                    <div className={styles.emptyContainer}>

                        <div className={styles.emptyIcon}>
                            <FiClipboard size={27} />
                        </div>

                        <h3 className="text-lg font-bold text-slate-800">
                            {searchTerm
                                ? "No matching applications"
                                : "No applications available"}
                        </h3>

                        <p className="text-sm text-slate-500 mt-2">
                            {searchTerm
                                ? "Try searching with another application name or owner."
                                : "There are currently no approved applications waiting for auditor assignment."}
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

            <AuditAssignmentModal
                mode="view"
                audit={selectedAudit}
                isOpen={!!selectedAudit}
                onClose={() => setSelectedAudit(null)}
                onAssign={(audit) => {
                    setSelectedAudit(null);
                    setAssignModal(audit);
                }}
            />


            {/* Assign Modal */}

            <AuditAssignmentModal
                mode="assign"
                audit={assignModal}
                isOpen={!!assignModal}
                onClose={() => setAssignModal(null)}
                onSuccess={() => {
                    fetchAudits();
                    setAssignModal(null);
                    setSuccessMsg("Auditor assigned successfully");
                    setTimeout(() => setSuccessMsg(""), 1500);
                }}
            />

        </div>
    );
}
