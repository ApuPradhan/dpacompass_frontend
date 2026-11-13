
import { FiSearch, FiChevronDown, FiFilter } from "react-icons/fi";

const selectClass =
    "w-full appearance-none rounded-xl border border-slate-600/90 bg-[#17243a] py-3 pl-4 pr-10 text-sm font-medium text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/25";

export default function FilterBar({
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
}) {
    return (
        <div className="w-full">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <FiFilter className="text-indigo-400" size={17} />
                Search and filters
            </div>

            <div
                className="grid grid-cols-1 gap-3"
                style={{
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                }}
            >
                {/* Search */}
                <label className="relative block">
                    <span className="sr-only">Search users</span>

                    <FiSearch
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={19}
                    />

                    <input
                        type="search"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-600/90 bg-[#17243a] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/25"
                    />
                </label>

                {/* Role filter */}
                <label className="relative block">
                    <span className="sr-only">Filter by role</span>

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className={selectClass}
                    >
                        <option value="">All roles</option>
                        <option value="auditor">Auditor</option>
                        <option value="auditee">Auditee</option>
                        <option value="admin">Admin</option>
                    </select>

                    <FiChevronDown
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={17}
                    />
                </label>

                {/* Status filter */}
                <label className="relative block">
                    <span className="sr-only">Filter by status</span>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={selectClass}
                    >
                        <option value="">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <FiChevronDown
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={17}
                    />
                </label>
            </div>
        </div>
    );
}
