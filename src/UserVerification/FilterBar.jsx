
import { FiSearch, FiChevronDown, FiFilter } from "react-icons/fi";

export default function FilterBar({
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
}) {
    const styles = {
        wrapper: "w-full min-w-0",

        grid: "grid w-full min-w-0 grid-cols-4 items-center gap-3",

        heading:
            "flex items-center gap-2 whitespace-nowrap text-sm font-bold text-[#14213D]",

        field: "relative block min-w-0 w-full",

        input:
            "h-12 w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-[#14213D] outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",

        select:
            "h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-3 pr-9 text-sm font-medium text-slate-700 outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",

        searchIcon:
            "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400",

        chevron:
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500",
    };

    return (
        <div className={styles.wrapper}>
            <div
                className={styles.grid}
                style={{
                    gridTemplateColumns:
                        "180px minmax(0, 2fr) minmax(140px, 1fr) minmax(140px, 1fr)",
                }}
            >
                {/* Heading */}
                <div className={styles.heading}>
                    <FiFilter size={19} className="shrink-0 text-blue-600" />
                    <span>Search and filters</span>
                </div>

                {/* Search */}
                <label className={styles.field}>
                    <span className="sr-only">Search users</span>
                    <FiSearch className={styles.searchIcon} size={18} />
                    <input
                        type="search"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.input}
                    />
                </label>

                {/* Role */}
                <label className={styles.field}>
                    <span className="sr-only">Filter by role</span>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className={styles.select}
                    >
                        <option value="">All roles</option>
                        <option value="auditor">Auditor</option>
                        <option value="auditee">Auditee</option>
                        <option value="admin">Admin</option>
                    </select>
                    <FiChevronDown className={styles.chevron} size={18} />
                </label>

                {/* Status */}
                <label className={styles.field}>
                    <span className="sr-only">Filter by status</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={styles.select}
                    >
                        <option value="">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <FiChevronDown className={styles.chevron} size={18} />
                </label>
            </div>
        </div>
    );
}
