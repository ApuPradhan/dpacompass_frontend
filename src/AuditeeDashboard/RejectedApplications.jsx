
import { useEffect, useState } from "react";
import AuditTable from "../AdminDashboard/AuditTable";
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
                const uniqueOwnerIds = [
                    ...new Set(audits.map((a) => a.owner)),
                ];

                const results = await Promise.all(
                    uniqueOwnerIds.map((id) => fetchUserById(id))
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
        remarks: a.remarks,
    }));

    // =========================
    // UI
    // =========================
    return (
        <div className="min-h-screen bg-[#F4F7FB] px-4 py-6 sm:px-6 lg:px-8">

            <div className="mx-auto w-full max-w-[1600px]">

                {/* Page Header */}
                <div className="mb-7">

                    <button
                        onClick={() => navigate("/devdashboard")}
                        className="mb-6 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-[#075EB5]"
                    >
                        <FiArrowLeft size={17} />
                        Back to Dashboard
                    </button>

                    <div>
                        <div className="mb-2 text-sm font-semibold text-[#075EB5]">
                            Application Management
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-[#14213D] sm:text-3xl">
                            Rejected Applications
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            View and review applications that have been rejected.
                        </p>
                    </div>
                </div>

                {/* Application Records */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                        <h2 className="text-base font-semibold text-[#14213D]">
                            Rejected Application Records
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {formattedAudits.length} application(s) found
                        </p>
                    </div>

                    <div className="p-4 sm:p-6">

                        {/* Loading State */}
                        {loading ? (
                            <div className="flex min-h-[40vh] items-center justify-center">
                                <Loader text="Loading applications..." />
                            </div>
                        ) : error ? (
                            /* Error State */
                            <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
                                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                                    <span className="text-2xl font-bold">!</span>
                                </div>

                                <h3 className="font-semibold text-[#14213D]">
                                    Unable to load applications
                                </h3>

                                <p className="mt-2 text-sm text-red-600">
                                    {error}
                                </p>

                                <button
                                    onClick={() => {
                                        setLoading(true);
                                        setError(null);
                                        fetchAudits();
                                    }}
                                    className="mt-5 cursor-pointer rounded-lg bg-[#075EB5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#064D94]"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : formattedAudits.length === 0 ? (
                            /* Empty State */
                            <div className="flex min-h-[35vh] flex-col items-center justify-center text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                                    <svg
                                        className="h-7 w-7 text-slate-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.7}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z"
                                        />
                                    </svg>
                                </div>

                                <h3 className="mt-4 text-base font-semibold text-[#14213D]">
                                    No Rejected Applications
                                </h3>

                                <p className="mt-1 max-w-sm text-sm text-slate-500">
                                    There are currently no rejected applications to display.
                                </p>
                            </div>
                        ) : (
                            /* Audit Table */
                            <div className="overflow-x-auto">
                                <AuditTable
                                    audits={formattedAudits}
                                    onView={setSelectedAudit}
                                    userMap={userMap}
                                />
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Modal */}
            <RejectedAuditViewModal
                audit={selectedAudit}
                onClose={() => setSelectedAudit(null)}
            />

        </div>
    );
}
