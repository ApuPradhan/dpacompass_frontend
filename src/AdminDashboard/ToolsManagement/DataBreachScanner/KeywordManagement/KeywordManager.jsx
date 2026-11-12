import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FiPlus,
    FiSearch,
    FiRefreshCw,
    FiAlertCircle,
    FiCheckCircle,
    FiX,
} from "react-icons/fi";

import {
    getKeywords,
    createKeyword,
    updateKeyword,
    deactivateKeyword,
} from "../../../../services/dataBreachKeywordService";

import KeywordTable from './components/KeywordTable'
import KeywordForm from "./components/KeywordForm";

const INITIAL_FORM = {
    keyword: "",
    match_type: "contains",
    priority: 100,
};

const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.keywords)) return data.keywords;
    return [];
};

const getErrorMessage = (error) => {
    const data = error?.data;

    if (data && typeof data === "object") {
        for (const value of Object.values(data)) {
            const message = Array.isArray(value)
                ? value.find((item) => typeof item === "string")
                : typeof value === "string"
                    ? value
                    : null;

            if (message) return message;
        }
    }

    return error?.message || "Something went wrong.";
};

const KeywordManager = ({ group }) => {
    const [keywords, setKeywords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [showForm, setShowForm] = useState(false);
    const [editingKeyword, setEditingKeyword] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM);

    const loadKeywords = useCallback(async () => {
        if (!group?.id) return;

        setLoading(true);
        setError("");

        try {
            const filters = {};

            if (statusFilter === "active") filters.is_active = true;
            if (statusFilter === "inactive") filters.is_active = false;

            const response = await getKeywords(group.id, filters);
            setKeywords(normalizeList(response));
        } catch (err) {
            setKeywords([]);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [group?.id, statusFilter]);

    useEffect(() => {
        setSearchTerm("");
        setStatusFilter("all");
        setShowForm(false);
        setEditingKeyword(null);
        setForm(INITIAL_FORM);
        setSuccess("");
        setError("");
    }, [group?.id]);

    useEffect(() => {
        loadKeywords();
    }, [loadKeywords]);

    const filteredKeywords = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        if (!query) return keywords;

        return keywords.filter((item) =>
            [
                item.keyword,
                item.match_type,
                item.priority,
            ].some((value) =>
                String(value ?? "").toLowerCase().includes(query)
            )
        );
    }, [keywords, searchTerm]);

    const activeCount = keywords.filter((item) => item.is_active).length;
    const inactiveCount = keywords.length - activeCount;

    const openCreateForm = () => {
        setEditingKeyword(null);
        setForm(INITIAL_FORM);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const openEditForm = (item) => {
        setEditingKeyword(item);
        setForm({
            keyword: item.keyword || "",
            match_type: item.match_type || "contains",
            priority: item.priority ?? 100,
        });
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const closeForm = () => {
        if (saving) return;

        setShowForm(false);
        setEditingKeyword(null);
        setForm(INITIAL_FORM);
        setError("");
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.keyword.trim()) {
            setError("Keyword is required.");
            return;
        }

        if (
            form.priority === "" ||
            !Number.isInteger(Number(form.priority)) ||
            Number(form.priority) < 0
        ) {
            setError("Priority must be a non-negative integer.");
            return;
        }

        const payload = {
            keyword: form.keyword.trim(),
            match_type: form.match_type,
            priority: Number(form.priority),
        };

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            if (editingKeyword) {
                await updateKeyword(editingKeyword.id, payload);
                setSuccess("Keyword updated successfully.");
            } else {
                await createKeyword(group.id, {
                    ...payload,
                    is_active: true,
                });
                setSuccess("Keyword created successfully.");
            }

            setShowForm(false);
            setEditingKeyword(null);
            setForm(INITIAL_FORM);

            await loadKeywords();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (item) => {
        const action = item.is_active ? "deactivate" : "activate";

        if (!window.confirm(`Are you sure you want to ${action} this keyword?`)) {
            return;
        }

        setProcessingId(item.id);
        setError("");
        setSuccess("");

        try {
            if (item.is_active) {
                await deactivateKeyword(item.id);
                setSuccess("Keyword deactivated successfully.");
            } else {
                await updateKeyword(item.id, { is_active: true });
                setSuccess("Keyword activated successfully.");
            }

            await loadKeywords();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="min-w-0 bg-slate-900 border border-slate-800 rounded-xl">

            {/* GROUP HEADER */}

            <div className="p-5 md:p-6 border-b border-slate-800">
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">

                    <div className="min-w-0">
                        <div className="flex items-center flex-wrap gap-3">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-100">
                                {group.display_name || group.group_code}
                            </h2>

                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                group.is_active
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-slate-700 text-slate-400"
                            }`}>
                                {group.is_active ? "Active" : "Inactive"}
                            </span>
                        </div>

                        <p className="text-sm text-indigo-400 font-mono mt-2">
                            {group.group_code}
                        </p>

                        {group.description && (
                            <p className="text-sm text-slate-400 mt-2">
                                {group.description}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={openCreateForm}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shrink-0 transition"
                    >
                        <FiPlus size={18} />
                        Add Keyword
                    </button>
                </div>

                {/* SUMMARY */}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                        <p className="text-xs text-slate-400">Total Keywords</p>
                        <p className="text-2xl font-bold mt-2">
                            {keywords.length}
                        </p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                        <p className="text-xs text-slate-400">Active Keywords</p>
                        <p className="text-2xl font-bold text-emerald-400 mt-2">
                            {activeCount}
                        </p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                        <p className="text-xs text-slate-400">Inactive Keywords</p>
                        <p className="text-2xl font-bold text-slate-400 mt-2">
                            {inactiveCount}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-5 md:p-6">

                {/* MESSAGES */}

                {error && !showForm && (
                    <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                        <FiAlertCircle />
                        <span className="flex-1">{error}</span>
                        <button onClick={() => setError("")}><FiX /></button>
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
                        <FiCheckCircle />
                        <span className="flex-1">{success}</span>
                        <button onClick={() => setSuccess("")}><FiX /></button>
                    </div>
                )}

                {/* INLINE FORM */}

                {showForm && (
                    <KeywordForm
                        form={form}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        onCancel={closeForm}
                        saving={saving}
                        editing={Boolean(editingKeyword)}
                        error={error}
                    />
                )}

                {/* TOOLBAR */}

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">

                    <div>
                        <h3 className="text-lg font-semibold">
                            Keyword Configuration
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                            Configure matching rules for this category.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search keywords..."
                                className="w-full sm:w-64 bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        >
                            <option value="all">All Keywords</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <button
                            onClick={loadKeywords}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-sm transition"
                        >
                            <FiRefreshCw className={loading ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* TABLE */}

                {loading ? (
                    <div className="py-16 text-center text-slate-400">
                        <FiRefreshCw className="animate-spin mx-auto text-2xl text-indigo-400 mb-3" />
                        Loading keywords...
                    </div>
                ) : (
                    <KeywordTable
                        keywords={filteredKeywords}
                        onEdit={openEditForm}
                        onToggleStatus={handleToggleStatus}
                        processingId={processingId}
                    />
                )}

                <div className="mt-4 text-xs text-slate-500">
                    Showing {filteredKeywords.length} of {keywords.length} keywords
                </div>
            </div>
        </div>
    );
};

export default KeywordManager;