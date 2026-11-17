
import { useEffect, useMemo, useState } from "react";
import {
    FiChevronDown,
    FiChevronRight,
    FiEdit,
    FiTrash2,
    FiUpload,
    FiSearch,
    FiLayers,
    FiFileText,
    FiCheckCircle,
    FiClock,
    FiFolder,
    FiRefreshCw,
    FiArrowLeft,
    FiClipboard,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

// ================= DOMAIN COLOR PALETTES =================

const DOMAIN_COLORS = [
    {
        header: "bg-blue-50",
        icon: "bg-blue-100 text-blue-700",
        border: "border-l-blue-500",
        count: "bg-blue-100 text-blue-700",
    },
    {
        header: "bg-violet-50",
        icon: "bg-violet-100 text-violet-700",
        border: "border-l-violet-500",
        count: "bg-violet-100 text-violet-700",
    },
    {
        header: "bg-emerald-50",
        icon: "bg-emerald-100 text-emerald-700",
        border: "border-l-emerald-500",
        count: "bg-emerald-100 text-emerald-700",
    },
    {
        header: "bg-amber-50",
        icon: "bg-amber-100 text-amber-700",
        border: "border-l-amber-500",
        count: "bg-amber-100 text-amber-700",
    },
    {
        header: "bg-cyan-50",
        icon: "bg-cyan-100 text-cyan-700",
        border: "border-l-cyan-500",
        count: "bg-cyan-100 text-cyan-700",
    },
    {
        header: "bg-rose-50",
        icon: "bg-rose-100 text-rose-700",
        border: "border-l-rose-500",
        count: "bg-rose-100 text-rose-700",
    },
];

const ViewChecklist = () => {
    const navigate = useNavigate();

    const [checklists, setChecklists] = useState([]);
    const [domains, setDomains] = useState([]);
    const [applicationTypes, setApplicationTypes] = useState([]);

    const [openDomainId, setOpenDomainId] = useState(null);
    const [openChecklistId, setOpenChecklistId] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [loading, setLoading] = useState(true);

    // ================= FETCH DATA =================

    const fetchApplicationTypes = async () => {
        try {
            const res = await fetchWithAuth(
                "/api/applications/types/",
                { method: "GET" }
            );

            if (!res.ok) {
                throw new Error("Failed to fetch application types");
            }

            const data = await res.json();
            setApplicationTypes(data.data || []);
        } catch {
            toast.error("Failed to fetch application types");
        }
    };

    const fetchChecklist = async () => {
        try {
            const res = await fetchWithAuth(
                "/api/checklists/items/",
                { method: "GET" }
            );

            if (!res.ok) {
                throw new Error("Failed to fetch checklist");
            }

            const data = await res.json();
            setChecklists(data.data || []);
        } catch {
            toast.error("Failed to fetch checklist");
        }
    };

    const fetchDomains = async () => {
        try {
            const res = await fetchWithAuth(
                "/api/checklists/domains/",
                { method: "GET" }
            );

            if (!res.ok) {
                throw new Error("Failed to fetch domains");
            }

            const data = await res.json();
            setDomains(data.data || []);
        } catch {
            toast.error("Failed to fetch domains");
        }
    };

    const fetchAllData = async () => {
        setLoading(true);

        await Promise.all([
            fetchChecklist(),
            fetchDomains(),
            fetchApplicationTypes(),
        ]);

        setLoading(false);
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // ================= ACTIONS =================

    const handlePublish = async (id) => {
        try {
            const res = await fetchWithAuth(
                `/api/checklists/items/${id}/publish/`,
                { method: "POST" }
            );

            if (!res.ok) {
                throw new Error("Publish failed");
            }

            toast.success("Checklist published");
            await fetchChecklist();
        } catch {
            toast.error("Publish failed");
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this checklist?"
        );

        if (!confirmed) return;

        try {
            const res = await fetchWithAuth(
                `/api/checklists/items/${id}/`,
                { method: "DELETE" }
            );

            if (!res.ok) {
                throw new Error("Delete failed");
            }

            toast.success("Checklist deleted");

            if (openChecklistId === id) {
                setOpenChecklistId(null);
            }

            await fetchChecklist();
        } catch {
            toast.error("Delete failed");
        }
    };

    // ================= FILTERING =================

    const filteredChecklists = useMemo(() => {
        return checklists.filter((item) => {
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch =
                item.clause?.toLowerCase().includes(search) ||
                item.description?.toLowerCase().includes(search) ||
                String(item.version || "").toLowerCase().includes(search);

            const matchesStatus =
                selectedStatus === "all" ||
                item.status?.toLowerCase() === selectedStatus;

            return matchesSearch && matchesStatus;
        });
    }, [checklists, searchTerm, selectedStatus]);

    // ================= DOMAIN GROUPING =================

    const groupedChecklists = useMemo(() => {
        const groups = domains.map((domain) => ({
            id: domain.id,
            name: domain.name,
            checklists: filteredChecklists.filter(
                (item) => String(item.domain) === String(domain.id)
            ),
        }));

        const unassigned = filteredChecklists.filter(
            (item) =>
                !domains.some(
                    (domain) => String(domain.id) === String(item.domain)
                )
        );

        if (unassigned.length > 0) {
            groups.push({
                id: "unassigned",
                name: "Unassigned Domain",
                checklists: unassigned,
            });
        }

        return groups.filter(
            (group) => group.checklists.length > 0
        );
    }, [domains, filteredChecklists]);

    // ================= SUMMARY =================

    const totalCount = checklists.length;

    const publishedCount = checklists.filter(
        (item) => item.status?.toLowerCase() === "published"
    ).length;

    const draftCount = checklists.filter(
        (item) => item.status?.toLowerCase() === "draft"
    ).length;

    const deprecatedCount = checklists.filter(
        (item) => item.status?.toLowerCase() === "deprecated"
    ).length;

    // ================= STATUS STYLE =================

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "published":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";

            case "draft":
                return "bg-amber-50 text-amber-700 border-amber-200";

            case "deprecated":
                return "bg-red-50 text-red-700 border-red-200";

            default:
                return "bg-slate-100 text-slate-600 border-slate-200";
        }
    };

    // ================= CHECKLIST CARD =================

    const renderChecklist = (item, index) => {
        const isOpen = openChecklistId === item.id;

        return (
            <div
                key={item.id}
                className="w-[98%] mx-auto bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-blue-200 hover:shadow-md transition-all"
            >
                {/* MAIN ROW */}

                <div
                    onClick={() =>
                        setOpenChecklistId(isOpen ? null : item.id)
                    }
                    className="grid grid-cols-1 lg:grid-cols-[55px_minmax(0,2.5fr)_minmax(110px,0.7fr)_minmax(135px,0.8fr)_minmax(155px,1fr)] gap-4 lg:gap-6 items-center px-6 lg:px-8 py-7 cursor-pointer hover:bg-blue-50/30 transition-colors"
                >
                    {/* NUMBER / EXPAND */}

                    <div className="flex items-center gap-2 text-slate-400">
                        {isOpen ? (
                            <FiChevronDown
                                size={21}
                                className="text-blue-600"
                            />
                        ) : (
                            <FiChevronRight size={21} />
                        )}

                        <span className="text-base font-semibold">
                            {index + 1}
                        </span>
                    </div>

                    {/* CLAUSE AND DESCRIPTION */}

                    <div className="min-w-0">
                        <h4 className="text-lg xl:text-xl font-bold text-[#173B70] leading-snug">
                            {item.clause}
                        </h4>

                        {item.description && (
                            <p className="text-base text-slate-600 mt-3 leading-relaxed">
                                {item.description}
                            </p>
                        )}
                    </div>

                    {/* VERSION */}

                    <div className="flex flex-col gap-2">
                        <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                            Version
                        </span>

                        <span className="text-base font-semibold text-slate-700">
                            v{item.version}
                        </span>
                    </div>

                    {/* STATUS */}

                    <div className="flex flex-col items-start gap-2">
                        <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                            Status
                        </span>

                        <span
                            className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full border capitalize ${getStatusStyle(
                                item.status
                            )}`}
                        >
                            {item.status}
                        </span>
                    </div>

                    {/* ACTIONS */}

                    <div
                        className="flex items-center lg:justify-end gap-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {item.status?.toLowerCase() === "draft" ? (
                            <>
                                <button
                                    type="button"
                                    title="Edit checklist"
                                    onClick={() =>
                                        navigate(
                                            `/admin/editChecklist/${item.id}`
                                        )
                                    }
                                    className="p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                                >
                                    <FiEdit size={19} />
                                </button>

                                <button
                                    type="button"
                                    title="Delete checklist"
                                    onClick={() => handleDelete(item.id)}
                                    className="p-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                                >
                                    <FiTrash2 size={19} />
                                </button>

                                <button
                                    type="button"
                                    title="Publish checklist"
                                    onClick={() => handlePublish(item.id)}
                                    className="p-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                                >
                                    <FiUpload size={19} />
                                </button>
                            </>
                        ) : (
                            <span className="text-sm font-medium text-slate-400">
                                No actions
                            </span>
                        )}
                    </div>
                </div>

                {/* EXPANDED DETAILS */}

                {isOpen && (
                    <div className="border-t border-slate-200 bg-slate-50 p-5 lg:p-7">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                            {/* APPLICATION TYPES */}

                            <div className="bg-white border border-slate-200 rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <FiLayers
                                        className="text-blue-600"
                                        size={19}
                                    />

                                    <h4 className="text-sm font-bold text-[#173B70]">
                                        Application Types
                                    </h4>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {item.application_types?.length > 0 ? (
                                        item.application_types.map((typeId) => {
                                            const typeObj =
                                                applicationTypes.find(
                                                    (type) => type.id === typeId
                                                );

                                            return (
                                                <span
                                                    key={typeId}
                                                    className="px-3 py-1.5 text-sm font-medium rounded-full bg-violet-50 text-violet-700 border border-violet-100"
                                                >
                                                    {typeObj?.name || "Unknown"}
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-slate-400">
                                            No application types mapped
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* DOMAIN */}

                            <div className="bg-white border border-slate-200 rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <FiFolder
                                        className="text-blue-600"
                                        size={19}
                                    />

                                    <h4 className="text-sm font-bold text-[#173B70]">
                                        Domain
                                    </h4>
                                </div>

                                <p className="text-base font-semibold text-slate-700">
                                    {domains.find(
                                        (domain) =>
                                            String(domain.id) ===
                                            String(item.domain)
                                    )?.name || "N/A"}
                                </p>
                            </div>

                            {/* EVIDENCE */}

                            <div className="bg-white border border-slate-200 rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <FiFileText
                                        className="text-blue-600"
                                        size={19}
                                    />

                                    <h4 className="text-sm font-bold text-[#173B70]">
                                        Mapped Evidence
                                    </h4>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {item.evidence_mappings?.length > 0 ? (
                                        item.evidence_mappings.map((evMap) => (
                                            <span
                                                key={evMap.id}
                                                className="px-3 py-1.5 text-sm font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                                            >
                                                {evMap.evidence?.name || "Unknown"}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-400">
                                            No evidence mapped
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // ================= MAIN UI =================

    return (
        <div className="w-full min-h-screen bg-[#F4F7FB] p-4 md:p-6 xl:p-8">

            {/* PAGE HEADER */}

            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-8">
                <div className="flex items-start gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/admindashboard")}
                        className="mt-1 p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                        title="Back to dashboard"
                    >
                        <FiArrowLeft size={20} />
                    </button>

                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#14213D]">
                            Checklist Management
                        </h1>

                        <p className="text-sm md:text-base text-slate-500 mt-2">
                            Manage, review and publish checklist items organised by domain.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={fetchAllData}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                >
                    <FiRefreshCw
                        size={17}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh Data
                </button>
            </div>

            {/* SUMMARY CARDS */}

            <div
                className="grid gap-5 mb-8"
                style={{
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                }}
            >
                {[
                    {
                        label: "Total Checklists",
                        value: totalCount,
                        icon: FiClipboard,
                        iconStyle: "bg-blue-50 text-blue-700",
                        valueStyle: "text-[#173B70]",
                    },
                    {
                        label: "Published",
                        value: publishedCount,
                        icon: FiCheckCircle,
                        iconStyle: "bg-emerald-50 text-emerald-700",
                        valueStyle: "text-emerald-700",
                    },
                    {
                        label: "Draft",
                        value: draftCount,
                        icon: FiClock,
                        iconStyle: "bg-amber-50 text-amber-700",
                        valueStyle: "text-amber-700",
                    },
                    {
                        label: "Deprecated",
                        value: deprecatedCount,
                        icon: FiLayers,
                        iconStyle: "bg-red-50 text-red-700",
                        valueStyle: "text-red-700",
                    },
                ].map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.label}
                            className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        {stat.label}
                                    </p>

                                    <h3
                                        className={`text-3xl font-bold mt-3 ${stat.valueStyle}`}
                                    >
                                        {stat.value}
                                    </h3>
                                </div>

                                <div
                                    className={`p-4 rounded-xl ${stat.iconStyle}`}
                                >
                                    <Icon size={23} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* SEARCH AND FILTER */}

            <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <FiSearch
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={19}
                        />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search checklist by clause, description or version..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white text-base text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        />
                    </div>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full lg:w-56 px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="deprecated">Deprecated</option>
                    </select>
                </div>
            </div>

            {/* DOMAIN-WISE CHECKLIST LIST */}

            <div className="space-y-6 w-full">
                {loading ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center">
                        <FiRefreshCw
                            className="animate-spin text-blue-600 mb-4"
                            size={30}
                        />

                        <p className="text-base text-slate-500">
                            Loading checklist data...
                        </p>
                    </div>
                ) : groupedChecklists.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                        <FiFileText
                            className="mx-auto text-slate-300 mb-4"
                            size={42}
                        />

                        <h3 className="text-lg font-semibold text-slate-700">
                            No checklists found
                        </h3>

                        <p className="text-sm text-slate-500 mt-2">
                            Try changing your search term or status filter.
                        </p>
                    </div>
                ) : (
                    groupedChecklists.map((group, groupIndex) => {
                        const isDomainOpen =
                            openDomainId === group.id;

                        const colors =
                            DOMAIN_COLORS[
                                groupIndex % DOMAIN_COLORS.length
                            ];

                        return (
                            <section
                                key={group.id}
                                className={`w-full bg-white border border-slate-200 border-l-4 ${colors.border} rounded-2xl shadow-sm overflow-hidden`}
                            >
                                {/* DOMAIN HEADER */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpenDomainId(
                                            isDomainOpen ? null : group.id
                                        )
                                    }
                                    className={`w-full flex items-center justify-between gap-4 px-5 py-5 lg:px-7 lg:py-6 text-left ${colors.header} hover:brightness-[0.98] transition cursor-pointer`}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div
                                            className={`p-3.5 rounded-xl shrink-0 ${colors.icon}`}
                                        >
                                            <FiFolder size={24} />
                                        </div>

                                        <div className="min-w-0">
                                            <h2 className="text-lg md:text-xl font-bold text-[#173B70]">
                                                {group.name}
                                            </h2>

                                            <p className="text-sm text-slate-600 mt-1">
                                                {group.checklists.length} checklist
                                                {group.checklists.length !== 1
                                                    ? "s"
                                                    : ""}{" "}
                                                in this domain
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        <span
                                            className={`hidden sm:inline-flex px-4 py-2 rounded-full text-sm font-bold ${colors.count}`}
                                        >
                                            {group.checklists.length} Items
                                        </span>

                                        <span className="text-slate-500">
                                            {isDomainOpen ? (
                                                <FiChevronDown size={24} />
                                            ) : (
                                                <FiChevronRight size={24} />
                                            )}
                                        </span>
                                    </div>
                                </button>

                                {/* DOMAIN CHECKLISTS */}

                                {isDomainOpen && (
                                    <div className="p-5 lg:p-7 space-y-5 bg-[#F8FAFD]">
                                        <div className="hidden lg:grid grid-cols-[55px_minmax(0,2.5fr)_minmax(110px,0.7fr)_minmax(135px,0.8fr)_minmax(155px,1fr)] gap-4 lg:gap-6 px-6 lg:px-8 pb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
                                            <div>#</div>
                                            <div>Checklist Clause</div>
                                            <div>Version</div>
                                            <div>Status</div>
                                            <div className="lg:text-right">
                                                Actions
                                            </div>
                                        </div>

                                        {group.checklists.map((item, index) =>
                                            renderChecklist(item, index)
                                        )}
                                    </div>
                                )}
                            </section>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ViewChecklist;
