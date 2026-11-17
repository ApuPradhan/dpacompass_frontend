
import { useCallback, useEffect, useState } from "react";
import {
    FiEdit,
    FiTrash2,
    FiPlus,
    FiLoader,
    FiLayers,
    FiRefreshCw,
    FiSearch,
    FiAlertCircle,
    FiX,
} from "react-icons/fi";

import CreateDomain from "./CreateDomain";
import EditDomain from "./EditDomain";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

const DomainTable = () => {
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [selected, setSelected] = useState(null);

    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showCreate, setShowCreate] = useState(false);

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
            "inline-flex items-center justify-center gap-2 rounded-xl bg-[#075EB5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#064D94] cursor-pointer",

        secondaryButton:
            "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer",

        input:
            "w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100",

        tableHeader:
            "bg-[#EAF3FF] text-xs font-semibold uppercase tracking-wide text-[#173B70]",

        tableCell:
            "px-5 py-4 text-sm text-slate-600",

        actionButton:
            "flex h-9 w-9 items-center justify-center rounded-lg transition cursor-pointer",
    };

    // --------------------------------------------------
    // FETCH DOMAINS
    // --------------------------------------------------

    const fetchDomains = useCallback(async (isRefresh = false) => {
        const token = localStorage.getItem("access");

        if (!token) {
            setLoading(false);
            return;
        }

        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await fetchWithAuth(
                "/api/checklists/domains/",
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
                    "Failed to fetch domains."
                );
            }

            setDomains(Array.isArray(data.data) ? data.data : []);

        } catch (err) {
            console.error("Fetch domains error:", err);
            toast.error(err.message || "Unable to load domains.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchDomains();
    }, [fetchDomains]);

    // --------------------------------------------------
    // DELETE DOMAIN
    // --------------------------------------------------

    const handleDelete = async () => {
        if (!selected?.id) return;

        try {
            setDeleting(true);

            const res = await fetchWithAuth(
                `/api/checklists/domains/${selected.id}/`,
                {
                    method: "DELETE",
                }
            );

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));

                throw new Error(
                    data.message ||
                    data.detail ||
                    "Failed to delete domain."
                );
            }

            toast.success("Domain deleted successfully.");

            setShowDelete(false);
            setSelected(null);

            await fetchDomains(true);

        } catch (err) {
            console.error("Delete domain error:", err);
            toast.error(err.message || "Something went wrong.");
        } finally {
            setDeleting(false);
        }
    };

    // --------------------------------------------------
    // FILTER DOMAINS
    // --------------------------------------------------

    const filteredDomains = domains.filter((domain) => {
        const query = search.trim().toLowerCase();

        if (!query) return true;

        return (
            (domain.name || "").toLowerCase().includes(query) ||
            (domain.description || "").toLowerCase().includes(query)
        );
    });

    const activeCount = domains.filter((d) => d.is_active).length;
    const inactiveCount = domains.length - activeCount;

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
                            <FiLayers size={16} />
                            <span>Checklist Configuration</span>
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-[#14213D] sm:text-3xl">
                            Domain Management
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage and organize compliance domains used across audits and checklists.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                        <button
                            type="button"
                            onClick={() => fetchDomains(true)}
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
                            Create Domain
                        </button>

                    </div>
                </div>

                {/* SUMMARY CARDS */}

                {/* SUMMARY CARDS */}

                <div
                    className="mb-6 grid gap-4"
                    style={{
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    }}
                >
                    {/* TOTAL DOMAINS */}

                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Domains
                            </p>

                            <h3 className="mt-2 text-2xl font-bold text-[#14213D]">
                                {domains.length}
                            </h3>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FiLayers size={21} />
                        </div>
                    </div>

                    {/* ACTIVE DOMAINS */}

                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Active Domains
                            </p>

                            <h3 className="mt-2 text-2xl font-bold text-emerald-600">
                                {activeCount}
                            </h3>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <FiLayers size={21} />
                        </div>
                    </div>

                    {/* INACTIVE DOMAINS */}

                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Inactive Domains
                            </p>

                            <h3 className="mt-2 text-2xl font-bold text-amber-600">
                                {inactiveCount}
                            </h3>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <FiLayers size={21} />
                        </div>
                    </div>
                </div>

                {/* DOMAIN TABLE CARD */}

                <section className={styles.card}>

                    {/* TABLE HEADER */}

                    <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">

                        <div>
                            <h2 className="text-base font-bold text-[#14213D]">
                                All Domains
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {filteredDomains.length} domain(s) found
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
                                placeholder="Search domains..."
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
                                Loading domains...
                            </p>
                        </div>

                    ) : filteredDomains.length === 0 ? (

                        /* EMPTY STATE */

                        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">

                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                                {search ? (
                                    <FiSearch size={27} />
                                ) : (
                                    <FiLayers size={27} />
                                )}
                            </div>

                            <h3 className="text-base font-semibold text-[#14213D]">
                                {search
                                    ? "No matching domains found"
                                    : "No domains created yet"}
                            </h3>

                            <p className="mt-2 max-w-sm text-sm text-slate-500">
                                {search
                                    ? "Try changing your search keyword."
                                    : "Create your first compliance domain to get started."}
                            </p>

                            {!search && (
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(true)}
                                    className={`${styles.primaryButton} mt-5`}
                                >
                                    <FiPlus size={17} />
                                    Create Domain
                                </button>
                            )}

                        </div>

                    ) : (

                        /* TABLE */

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[850px] text-left">

                                <thead className={styles.tableHeader}>
                                    <tr>
                                        <th className="px-5 py-4">#</th>
                                        <th className="px-5 py-4">Domain Name</th>
                                        <th className="px-5 py-4">Description</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">

                                    {filteredDomains.map((domain, index) => (

                                        <tr
                                            key={domain.id}
                                            className="transition hover:bg-blue-50/50"
                                        >
                                            <td className="px-5 py-4 text-sm font-medium text-slate-400">
                                                {index + 1}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                                        <FiLayers size={17} />
                                                    </div>

                                                    <span className="font-semibold text-slate-800">
                                                        {domain.name}
                                                    </span>

                                                </div>
                                            </td>

                                            <td className="max-w-md px-5 py-4">
                                                <p className="line-clamp-2 text-sm leading-6 text-slate-500">
                                                    {domain.description || "No description provided"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">

                                                <span
                                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${domain.is_active
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-amber-50 text-amber-700"
                                                        }`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${domain.is_active
                                                                ? "bg-emerald-500"
                                                                : "bg-amber-500"
                                                            }`}
                                                    />

                                                    {domain.is_active ? "Active" : "Inactive"}
                                                </span>

                                            </td>

                                            <td className="px-5 py-4">

                                                <div className="flex items-center justify-center gap-2">

                                                    <button
                                                        type="button"
                                                        title="Edit domain"
                                                        onClick={() => {
                                                            setSelected(domain);
                                                            setShowEdit(true);
                                                        }}
                                                        className={`${styles.actionButton} bg-blue-50 text-blue-600 hover:bg-blue-100`}
                                                    >
                                                        <FiEdit size={17} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title="Delete domain"
                                                        onClick={() => {
                                                            setSelected(domain);
                                                            setShowDelete(true);
                                                        }}
                                                        className={`${styles.actionButton} bg-red-50 text-red-600 hover:bg-red-100`}
                                                    >
                                                        <FiTrash2 size={17} />
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                    {/* TABLE FOOTER */}

                    {!loading && filteredDomains.length > 0 && (
                        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                            <p className="text-xs text-slate-500">
                                Showing {filteredDomains.length} of {domains.length} domains
                            </p>
                        </div>
                    )}

                </section>

            </div>

            {/* CREATE MODAL */}

            {showCreate && (
                <CreateDomain
                    onClose={() => setShowCreate(false)}
                    onSuccess={fetchDomains}
                />
            )}

            {/* EDIT MODAL */}

            {showEdit && selected && (
                <EditDomain
                    domain={selected}
                    onClose={() => {
                        setShowEdit(false);
                        setSelected(null);
                    }}
                    onSuccess={fetchDomains}
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
                                        Delete Domain
                                    </h3>

                                    <p className="text-xs text-slate-500">
                                        Confirm domain deletion
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
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
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
                                        This action cannot be undone. The selected domain will be permanently deleted.
                                    </p>

                                </div>
                            </div>

                            <p className="text-sm text-slate-600">
                                Are you sure you want to delete this domain?
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
                                        <FiLoader size={16} className="animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <FiTrash2 size={16} />
                                        Delete Domain
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

export default DomainTable;
