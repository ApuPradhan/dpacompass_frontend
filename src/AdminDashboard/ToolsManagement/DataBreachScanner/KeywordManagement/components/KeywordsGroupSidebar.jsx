import {
    FiPlus,
    FiSearch,
    FiTag,
    FiRefreshCw,
} from "react-icons/fi";

const KeywordGroupSidebar = ({
    groups,
    selectedGroupId,
    onSelect,
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusChange,
    loading,
    onRefresh,
    onAddCategory,
}) => {
    const filteredGroups = groups.filter((group) => {
        const query = searchTerm.trim().toLowerCase();

        if (!query) return true;

        return [
            group.display_name,
            group.group_code,
            group.category_code,
            group.description,
        ]
            .filter(Boolean)
            .some((value) =>
                String(value).toLowerCase().includes(query)
            );
    });

    return (
        <aside className="w-full bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[650px]">

            {/* HEADER */}

            <div className="p-5 border-b border-slate-800">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Keyword Groups
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            {groups.length} categories
                        </p>
                    </div>

                    <button
                        onClick={onAddCategory}
                        title="Add category"
                        className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
                    >
                        <FiPlus size={19} />
                    </button>
                </div>

                <div className="relative mt-5">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search groups..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-3 text-sm outline-none focus:border-indigo-500"
                    />
                </div>

                <div className="flex gap-2 mt-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                    >
                        <option value="all">All Groups</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="px-3 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Refresh groups"
                    >
                        <FiRefreshCw
                            className={loading ? "animate-spin" : ""}
                        />
                    </button>
                </div>
            </div>

            {/* GROUP LIST */}

            <div className="flex-1 overflow-y-auto p-3 space-y-2">

                {loading && (
                    <div className="py-10 text-center text-slate-400 text-sm">
                        Loading groups...
                    </div>
                )}

                {!loading && filteredGroups.length === 0 && (
                    <div className="py-10 text-center text-slate-500 text-sm">
                        No keyword groups found.
                    </div>
                )}

                {!loading && filteredGroups.map((group) => {
                    const active = selectedGroupId === group.id;

                    return (
                        <button
                            key={group.id}
                            onClick={() => onSelect(group)}
                            className={`w-full text-left p-4 rounded-lg border transition ${active
                                    ? "bg-indigo-500/10 border-indigo-500"
                                    : "bg-slate-950 border-slate-800 hover:border-slate-600"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 p-2 rounded-lg ${active
                                        ? "bg-indigo-500/20 text-indigo-400"
                                        : "bg-slate-800 text-slate-400"
                                    }`}>
                                    <FiTag size={17} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className={`text-sm font-semibold truncate ${active
                                            ? "text-indigo-300"
                                            : "text-slate-200"
                                        }`}>
                                        {group.display_name || group.group_code}
                                    </p>

                                    <p className="text-xs text-slate-500 mt-1 font-mono truncate">
                                        {group.group_code}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                        <span className="text-xs text-slate-400">
                                            {group.keyword_count ?? 0} keywords
                                        </span>

                                        <span className={`w-1.5 h-1.5 rounded-full ${group.is_active
                                                ? "bg-emerald-400"
                                                : "bg-slate-500"
                                            }`} />

                                        <span className={`text-xs ${group.is_active
                                                ? "text-emerald-400"
                                                : "text-slate-500"
                                            }`}>
                                            {group.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="p-4 border-t border-slate-800">
                <p className="text-xs text-slate-500">
                    Select a group to manage its keywords.
                </p>
            </div>
        </aside>
    );
};

export default KeywordGroupSidebar;