
import { useState, useEffect, useMemo, useCallback } from "react";
import FilterBar from "./FilterBar";
import UserTable from "./UserTable";
import UserDetailView from "./UserDetailView";
import ConfirmDialog from "./ConfirmDialog";
import { useNavigate } from "react-router-dom";
import {
    FiArrowLeft, FiUsers, FiClock, FiCheckCircle, FiXCircle,
    FiRefreshCw, FiAlertCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

export default function UserVerification() {
    const navigate = useNavigate();

    // Local styling variables for the User Verification page.
    const styles = {
        page: "min-h-screen bg-[#F4F7FB] px-4 py-6 text-slate-700 sm:px-6 lg:px-8",
        container: "mx-auto max-w-[1600px]",
        backButton: "mb-6 inline-flex cursor-pointer items-center gap-2 rounded-lg text-lg font-semibold text-blue-700 transition hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400/50",
        header: "mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        eyebrow: "text-sm font-bold uppercase tracking-[0.16em] text-blue-700",
        title: "mt-2 text-3xl font-bold tracking-tight text-[#14213D] sm:text-4xl",
        subtitle: "mt-2 max-w-2xl text-lg leading-7 text-slate-600",
        refreshButton: "inline-flex cursor-pointer items-center justify-center gap-2 self-start rounded-xl border border-blue-200 bg-white px-5 py-3 text-base font-semibold text-blue-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-center",
        summaryGrid: "mb-6 grid grid-cols-4 gap-3",
        summaryCard: "relative flex min-h-[94px] min-w-0 items-center justify-between gap-2 overflow-hidden rounded-xl border bg-white px-3 py-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md",
        summaryCardAccent: "absolute inset-y-0 left-0 w-1.5 rounded-l-xl",
        summaryLabel: "truncate text-sm font-semibold text-slate-600",
        summaryValue: "mt-1.5 text-2xl font-bold leading-none tabular-nums text-[#14213D]",
        summaryIcon: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
        filterPanel: "mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5",
        tableSection: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
        tableHeader: "flex flex-col gap-2 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        tableTitle: "text-xl font-bold text-[#14213D]",
        tableDescription: "mt-1 text-base text-slate-600",
        clearFilters: "inline-flex cursor-pointer items-center rounded-lg px-3 py-2 text-base font-semibold text-blue-700 transition hover:bg-blue-50 hover:text-blue-900",
        loadingState: "flex min-h-64 flex-col items-center justify-center gap-3 text-slate-600",
        spinner: "h-9 w-9 animate-spin rounded-full border-[3px] border-blue-100 border-t-blue-600",
        loadingText: "text-base font-medium text-slate-600",
        errorState: "flex min-h-64 flex-col items-center justify-center px-6 text-center",
        errorTitle: "mt-3 text-lg font-semibold text-[#14213D]",
        errorMessage: "mt-1 text-base text-slate-600",
        retryButton: "mt-4 cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700",
        tableContent: "p-3 sm:p-5",
    };

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const safeJson = async (res) => {
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch {
            throw new Error("Invalid server response");
        }
    };

    const fetchUsers = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await fetchWithAuth("/api/auth/admin/users/", {
                method: "GET",
            });
            const data = await safeJson(res);

            if (!res.ok) {
                throw new Error(data?.detail || "Failed to fetch users");
            }

            setUsers(Array.isArray(data.data) ? data.data : []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.message || "Unable to load users.");
            toast.error(err.message || "Unable to load users.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const updateUserStatus = async (userId, status) => {
        try {
            const res = await fetchWithAuth(`/api/auth/users/${userId}/status/`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });
            const data = await safeJson(res);

            if (!res.ok) {
                throw new Error(data?.message || data?.detail || "Failed to update status");
            }

            toast.success(`User ${status} successfully.`);
            setSelectedUser(null);
            setConfirmAction(null);
            await fetchUsers(true);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Unable to update user status.");
        }
    };

    const handleApprove = (user) => {
        setSelectedUser(null);
        setConfirmAction({ type: "approved", user });
    };

    const handleReject = (user) => {
        setSelectedUser(null);
        setConfirmAction({ type: "rejected", user });
    };

    const confirmActionHandler = () => {
        if (!confirmAction) return;
        const { type, user } = confirmAction;
        updateUserStatus(user.id, type);
    };

    const formattedUsers = useMemo(
        () =>
            users.map((u) => ({
                ...u,
                name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.username || "Unnamed user",
            })),
        [users]
    );

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return formattedUsers.filter((u) => {
            const matchesSearch =
                !query ||
                (u.name || "").toLowerCase().includes(query) ||
                (u.email || "").toLowerCase().includes(query);
            const matchesRole =
                !roleFilter || (u.role || "").toLowerCase() === roleFilter.toLowerCase();
            const matchesStatus =
                !statusFilter || (u.status || "").toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [formattedUsers, search, roleFilter, statusFilter]);

    const counts = useMemo(() => ({
        total: users.length,
        pending: users.filter((u) => (u.status || "").toLowerCase() === "pending").length,
        approved: users.filter((u) => (u.status || "").toLowerCase() === "approved").length,
        rejected: users.filter((u) => (u.status || "").toLowerCase() === "rejected").length,
    }), [users]);

    const summaryCards = [
        { label: "Total users", value: counts.total, icon: FiUsers, tone: "indigo" },
        { label: "Pending review", value: counts.pending, icon: FiClock, tone: "amber" },
        { label: "Approved", value: counts.approved, icon: FiCheckCircle, tone: "emerald" },
        { label: "Rejected", value: counts.rejected, icon: FiXCircle, tone: "rose" },
    ];

    const toneClasses = {
        indigo: {
            card: "border-blue-200 bg-gradient-to-br from-blue-50 to-white",
            accent: "bg-blue-500",
            icon: "border-blue-200 bg-blue-100 text-blue-700",
            value: "text-blue-900",
        },
        amber: {
            card: "border-amber-200 bg-gradient-to-br from-amber-50 to-white",
            accent: "bg-amber-500",
            icon: "border-amber-200 bg-amber-100 text-amber-700",
            value: "text-amber-900",
        },
        emerald: {
            card: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white",
            accent: "bg-emerald-500",
            icon: "border-emerald-200 bg-emerald-100 text-emerald-700",
            value: "text-emerald-900",
        },
        rose: {
            card: "border-rose-200 bg-gradient-to-br from-rose-50 to-white",
            accent: "bg-rose-500",
            icon: "border-rose-200 bg-rose-100 text-rose-700",
            value: "text-rose-900",
        },
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <button
                    type="button"
                    onClick={() => navigate("/admindashboard")}
                    className={styles.backButton}
                >
                    <FiArrowLeft size={18} />
                    Back to dashboard
                </button>

                <header className={styles.header}>
                    <div className="min-w-0 text-left">
                        <p className={styles.eyebrow}>
                            Administration
                        </p>
                        <h1 className={styles.title}>
                            User verification
                        </h1>
                        <p className={styles.subtitle}>
                            Review registered accounts, check their details, and manage access approval.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => fetchUsers(true)}
                        disabled={refreshing || loading}
                        className={styles.refreshButton}
                    >
                        <FiRefreshCw className={refreshing ? "animate-spin" : ""} size={18} />
                        Refresh users
                    </button>
                </header>

                {/* Compact summary cards */}
                <section
                    className={styles.summaryGrid}
                    aria-label="User verification summary"
                >
                    {summaryCards.map(({ label, value, icon: Icon, tone }) => (
                        <div
                            key={label}
                            className={`${styles.summaryCard} ${toneClasses[tone].card}`}
                        >
                            <span className={`${styles.summaryCardAccent} ${toneClasses[tone].accent}`} />
                            <div className="min-w-0 pl-1">
                                <p className={styles.summaryLabel}>
                                    {label}
                                </p>
                                <p className={`${styles.summaryValue} ${toneClasses[tone].value}`}>
                                    {value}
                                </p>
                            </div>
                            <div className={`${styles.summaryIcon} ${toneClasses[tone].icon}`}>
                                <Icon size={19} />
                            </div>
                        </div>
                    ))}
                </section>

                {/* Search and filters */}
                <section className={styles.filterPanel}>
                    <FilterBar
                        search={search}
                        setSearch={setSearch}
                        roleFilter={roleFilter}
                        setRoleFilter={setRoleFilter}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                    />
                </section>

                {/* Registered users table */}
                <section className={styles.tableSection}>
                    <div className={styles.tableHeader}>
                        <div>
                            <h2 className={styles.tableTitle}>
                                Registered accounts
                            </h2>
                            <p className={styles.tableDescription}>
                                Showing {filteredUsers.length} of {users.length} users
                            </p>
                        </div>

                        {(search || roleFilter || statusFilter) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setRoleFilter("");
                                    setStatusFilter("");
                                }}
                                className={styles.clearFilters}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner} />
                            <p className={styles.loadingText}>
                                Loading user accounts...
                            </p>
                        </div>
                    ) : error ? (
                        <div className={styles.errorState}>
                            <FiAlertCircle size={32} className="text-rose-600" />
                            <p className={styles.errorTitle}>
                                Unable to load users
                            </p>
                            <p className={styles.errorMessage}>{error}</p>
                            <button
                                type="button"
                                onClick={() => fetchUsers()}
                                className={styles.retryButton}
                            >
                                Try again
                            </button>
                        </div>
                    ) : (
                        <div className={styles.tableContent}>
                            <UserTable
                                users={filteredUsers}
                                onView={setSelectedUser}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        </div>
                    )}
                </section>
            </div>

            <UserDetailView
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
                onApprove={handleApprove}
                onReject={handleReject}
            />

            <ConfirmDialog
                open={!!confirmAction}
                actionType={confirmAction?.type}
                user={confirmAction?.user}
                onConfirm={confirmActionHandler}
                onCancel={() => setConfirmAction(null)}
            />
        </main>
    );
}
