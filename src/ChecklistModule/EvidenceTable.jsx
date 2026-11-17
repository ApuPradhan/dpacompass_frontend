
import { useCallback, useEffect, useState } from "react";
import {
    FiEye,
    FiEdit,
    FiTrash2,
    FiPlus,
    FiLoader,
    FiRefreshCw,
    FiSearch,
    FiFileText,
    FiAlertCircle,
    FiX,
    FiCheckCircle,
    FiLayers,
} from "react-icons/fi";

import CreateEvidence from "./CreateEvidence";
import EditEvidence from "./EditEvidence";
import ViewEvidence from "./ViewEvidence";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

const EvidenceTable = () => {
    const [evidences, setEvidences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [selected, setSelected] = useState(null);

    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showView, setShowView] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const [deleting, setDeleting] = useState(false);
    const [search, setSearch] = useState("");

    // --------------------------------------------------
    // LOCAL STYLES
    // --------------------------------------------------

    const styles = {
        page: "min-h-screen bg-[#F4F7FB] p-4 sm:p-6 lg:p-8",

        container: "mx-auto max-w-[1400px]",

        card: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",

        primaryButton:
            "inline-flex items-center justify-center gap-2 rounded-xl bg-[#075EB5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#064D94] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer",

        secondaryButton:
            "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer",

        input:
            "w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100",

        actionButton:
            "flex h-9 w-9 items-center justify-center rounded-lg transition cursor-pointer",
    };

    // --------------------------------------------------
    // FETCH EVIDENCE
    // --------------------------------------------------

    const fetchEvidence = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await fetchWithAuth(
                "/api/checklists/evidence/",
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message ||
                    data.detail ||
                    "Failed to fetch evidence."
                );
            }

            setEvidences(
                Array.isArray(data.data) ? data.data : []
            );

        } catch (err) {
            console.error("Fetch evidence error:", err);
            toast.error(err.message || "Unable to load evidence.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchEvidence();
    }, [fetchEvidence]);

    // --------------------------------------------------
    // DELETE EVIDENCE
    // --------------------------------------------------

    const handleDelete = async () => {
        if (!selected?.id) return;

        try {
            setDeleting(true);

            const res = await fetchWithAuth(
                `/api/checklists/evidence/${selected.id}/`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(
                    data.message ||
                    data.detail ||
                    "Failed to delete evidence."
                );
            }

            toast.success("Evidence deleted successfully.");

            setShowDelete(false);
            setSelected(null);

            await fetchEvidence(true);

        } catch (err) {
            console.error("Delete evidence error:", err);
            toast.error(err.message || "Unable to delete evidence.");
        } finally {
            setDeleting(false);
        }
    };

    // --------------------------------------------------
    // FILTER EVIDENCE
    // --------------------------------------------------

    const filteredEvidences = evidences.filter((evidence) => {
        const query = search.trim().toLowerCase();

        if (!query) return true;

        return [
            evidence.name,
            evidence.description,
            evidence.field_type,
            evidence.collection_type,
        ].some((value) =>
            String(value || "").toLowerCase().includes(query)
        );
    });

    // --------------------------------------------------
    // SUMMARY COUNTS
    // --------------------------------------------------

    const publishedCount = evidences.filter(
        (evidence) => evidence.is_active
    ).length;

    const draftCount = evidences.length - publishedCount;

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <main className={styles.page}>
            <div className={styles.container}>

                {/* PAGE HEADER */}

                <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#075EB5]">
                            <FiFileText size={16} />
                            <span>Checklist Configuration</span>
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-[#14213D] sm:text-3xl">
                            Evidence Management
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage manual and automated evidence configurations used across audits.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                        <button
                            type="button"
                            onClick={() => fetchEvidence(true)}
                            disabled={refreshing}
                            className={styles.secondaryButton}
                        >
                            <FiRefreshCw
                                size={16}
                                className={refreshing ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowCreate(true)}
                            className={styles.primaryButton}
                        >
                            <FiPlus size={18} />
                            Create Evidence
                        </button>

                    </div>
                </div>

                {/* SUMMARY CARDS */}

                <div
                    className="mb-6 grid gap-4"
                    style={{
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    }}
                >

                    {/* TOTAL EVIDENCE */}

                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Evidence
                            </p>

                            <h3 className="mt-2 text-2xl font-bold text-[#14213D]">
                                {evidences.length}
                            </h3>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FiLayers size={21} />
                        </div>
                    </div>

                    {/* PUBLISHED */}

                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Published
                            </p>

                            <h3 className="mt-2 text-2xl font-bold text-emerald-600">
                                {publishedCount}
                            </h3>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <FiCheckCircle size={21} />
                        </div>
                    </div>

                    {/* DRAFT */}

                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Draft Evidence
                            </p>

                            <h3 className="mt-2 text-2xl font-bold text-amber-600">
                                {draftCount}
                            </h3>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <FiFileText size={21} />
                        </div>
                    </div>

                </div>

                {/* EVIDENCE TABLE */}

                <section className={styles.card}>

                    {/* TABLE HEADER */}

                    <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">

                        <div>
                            <h2 className="text-base font-bold text-[#14213D]">
                                All Evidence
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {filteredEvidences.length} evidence item(s) found
                            </p>
                        </div>

                        <div className="relative w-full sm:max-w-xs">
                            <FiSearch
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search evidence..."
                                className={styles.input}
                            />
                        </div>

                    </div>

                    {/* LOADING */}

                    {loading ? (

                        <div className="flex min-h-[260px] flex-col items-center justify-center gap-3">
                            <FiLoader
                                size={28}
                                className="animate-spin text-blue-600"
                            />

                            <p className="text-sm text-slate-500">
                                Loading evidence...
                            </p>
                        </div>

                    ) : filteredEvidences.length === 0 ? (

                        /* EMPTY STATE */

                        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">

                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                                {search ? (
                                    <FiSearch size={27} />
                                ) : (
                                    <FiFileText size={27} />
                                )}
                            </div>

                            <h3 className="text-base font-semibold text-[#14213D]">
                                {search
                                    ? "No matching evidence found"
                                    : "No evidence created yet"}
                            </h3>

                            <p className="mt-2 max-w-sm text-sm text-slate-500">
                                {search
                                    ? "Try changing your search keyword."
                                    : "Create your first evidence configuration to get started."}
                            </p>

                            {!search && (
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(true)}
                                    className={`${styles.primaryButton} mt-5`}
                                >
                                    <FiPlus size={17} />
                                    Create Evidence
                                </button>
                            )}

                        </div>

                    ) : (

                        /* TABLE */

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[950px] text-left">

                                <thead className="bg-[#EAF3FF] text-xs font-semibold uppercase tracking-wide text-[#173B70]">
                                    <tr>
                                        <th className="px-5 py-4">#</th>
                                        <th className="px-5 py-4">Evidence Name</th>
                                        <th className="px-5 py-4">Field Type</th>
                                        <th className="px-5 py-4">Collection</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">

                                    {filteredEvidences.map((evidence, index) => (

                                        <tr
                                            key={evidence.id}
                                            className="transition hover:bg-blue-50/50"
                                        >

                                            <td className="px-5 py-4 text-sm font-medium text-slate-400">
                                                {index + 1}
                                            </td>

                                            {/* NAME */}

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                                        <FiFileText size={17} />
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-slate-800">
                                                            {evidence.name}
                                                        </p>

                                                        {evidence.description && (
                                                            <p className="mt-0.5 max-w-xs truncate text-xs text-slate-400">
                                                                {evidence.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                </div>
                                            </td>

                                            {/* FIELD TYPE */}

                                            <td className="px-5 py-4">
                                                <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                                                    {(evidence.field_type || "N/A")
                                                        .replaceAll("_", " ")}
                                                </span>
                                            </td>

                                            {/* COLLECTION TYPE */}

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                                        evidence.collection_type === "automated"
                                                            ? "bg-violet-50 text-violet-700"
                                                            : "bg-blue-50 text-blue-700"
                                                    }`}
                                                >
                                                    {evidence.collection_type === "automated"
                                                        ? "Automatic"
                                                        : "Manual"}
                                                </span>
                                            </td>

                                            {/* STATUS */}

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                        evidence.is_active
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-amber-50 text-amber-700"
                                                    }`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            evidence.is_active
                                                                ? "bg-emerald-500"
                                                                : "bg-amber-500"
                                                        }`}
                                                    />

                                                    {evidence.is_active
                                                        ? "Published"
                                                        : "Draft"}
                                                </span>
                                            </td>

                                            {/* ACTIONS */}

                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-2">

                                                    {/* VIEW */}

                                                    <button
                                                        type="button"
                                                        title="View evidence"
                                                        onClick={() => {
                                                            setSelected(evidence);
                                                            setShowView(true);
                                                        }}
                                                        className={`${styles.actionButton} bg-blue-50 text-blue-600 hover:bg-blue-100`}
                                                    >
                                                        <FiEye size={17} />
                                                    </button>

                                                    {/* EDIT */}

                                                    <button
                                                        type="button"
                                                        title="Edit evidence"
                                                        onClick={() => {
                                                            setSelected(evidence);
                                                            setShowEdit(true);
                                                        }}
                                                        className={`${styles.actionButton} bg-violet-50 text-violet-600 hover:bg-violet-100`}
                                                    >
                                                        <FiEdit size={17} />
                                                    </button>

                                                    {/* DELETE - DRAFT ONLY */}

                                                    {!evidence.is_active && (
                                                        <button
                                                            type="button"
                                                            title="Delete evidence"
                                                            onClick={() => {
                                                                setSelected(evidence);
                                                                setShowDelete(true);
                                                            }}
                                                            className={`${styles.actionButton} bg-red-50 text-red-600 hover:bg-red-100`}
                                                        >
                                                            <FiTrash2 size={17} />
                                                        </button>
                                                    )}

                                                </div>
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                    {/* TABLE FOOTER */}

                    {!loading && filteredEvidences.length > 0 && (
                        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                            <p className="text-xs text-slate-500">
                                Showing {filteredEvidences.length} of {evidences.length} evidence items
                            </p>
                        </div>
                    )}

                </section>

            </div>

            {/* CREATE MODAL */}

            {showCreate && (
                <CreateEvidence
                    onClose={() => setShowCreate(false)}
                    onSuccess={fetchEvidence}
                />
            )}

            {/* EDIT MODAL */}

            {showEdit && selected && (
                <EditEvidence
                    evidence={selected}
                    onClose={() => {
                        setShowEdit(false);
                        setSelected(null);
                    }}
                    onSuccess={fetchEvidence}
                />
            )}

            {/* VIEW MODAL */}

            {showView && selected && (
                <ViewEvidence
                    evidence={selected}
                    onClose={() => {
                        setShowView(false);
                        setSelected(null);
                    }}
                />
            )}

            {/* DELETE CONFIRMATION MODAL */}

            {showDelete && selected && (

                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget && !deleting) {
                            setShowDelete(false);
                            setSelected(null);
                        }
                    }}
                >

                    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                        {/* MODAL HEADER */}

                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                    <FiTrash2 size={20} />
                                </div>

                                <div>
                                    <h3 className="font-bold text-[#14213D]">
                                        Delete Evidence
                                    </h3>

                                    <p className="text-xs text-slate-500">
                                        Confirm evidence deletion
                                    </p>
                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowDelete(false);
                                    setSelected(null);
                                }}
                                disabled={deleting}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 cursor-pointer"
                            >
                                <FiX size={19} />
                            </button>

                        </div>

                        {/* MODAL CONTENT */}

                        <div className="px-6 py-6">

                            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4">
                                <div className="flex items-start gap-3">

                                    <FiAlertCircle
                                        size={19}
                                        className="mt-0.5 shrink-0 text-red-600"
                                    />

                                    <p className="text-sm leading-6 text-red-700">
                                        This action cannot be undone. The selected evidence configuration will be permanently deleted.
                                    </p>

                                </div>
                            </div>

                            <p className="text-sm text-slate-600">
                                Are you sure you want to delete this evidence?
                            </p>

                            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <p className="text-sm font-semibold text-slate-800">
                                    {selected.name}
                                </p>

                                {selected.description && (
                                    <p className="mt-1 text-xs text-slate-500">
                                        {selected.description}
                                    </p>
                                )}
                            </div>

                        </div>

                        {/* MODAL FOOTER */}

                        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">

                            <button
                                type="button"
                                onClick={() => {
                                    setShowDelete(false);
                                    setSelected(null);
                                }}
                                disabled={deleting}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                            >
                                {deleting ? (
                                    <>
                                        <FiLoader
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <FiTrash2 size={16} />
                                        Delete Evidence
                                    </>
                                )}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </main>
    );
};

export default EvidenceTable;
