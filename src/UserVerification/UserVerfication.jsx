
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
        indigo: "border-indigo-400/20 bg-indigo-500/10 text-indigo-300",
        amber: "border-amber-400/20 bg-amber-500/10 text-amber-300",
        emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
        rose: "border-rose-400/20 bg-rose-500/10 text-rose-300",
    };

    return (
        <main className="min-h-screen bg-[#0a1220] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1600px]">
                <button
                    type="button"
                    onClick={() => navigate("/admindashboard")}
                    className="mb-6 inline-flex items-center gap-2 rounded-lg text-base font-semibold text-slate-200 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                >
                    <FiArrowLeft size={18} />
                    Back to dashboard
                </button>

                <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 text-left">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
                            Administration
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            User verification
                        </h1>
                        <p className="mt-2 max-w-2xl text-base leading-7 text-slate-300">
                            Review registered accounts, check their details, and manage access approval.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => fetchUsers(true)}
                        disabled={refreshing || loading}
                        className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-500 bg-[#182943] px-4 py-3 text-base font-semibold text-slate-100 shadow-sm transition hover:border-indigo-300 hover:bg-[#203653] disabled:cursor-not-allowed disabled:opacity-50 sm:self-center"
                    >
                        <FiRefreshCw className={refreshing ? "animate-spin" : ""} size={18} />
                        Refresh users
                    </button>
                </header>

                {/* Compact summary cards */}
                <section
                    className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4"
                    aria-label="User verification summary"
                >
                    {summaryCards.map(({ label, value, icon: Icon, tone }) => (
                        <div
                            key={label}
                            className="flex min-h-[88px] items-center justify-between gap-3 rounded-xl border border-slate-700/80 bg-[#111d31] px-4 py-3 shadow-md shadow-black/10"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-400">
                                    {label}
                                </p>
                                <p className="mt-1 text-2xl font-bold leading-none tabular-nums text-white">
                                    {value}
                                </p>
                            </div>
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${toneClasses[tone]}`}>
                                <Icon size={17} />
                            </div>
                        </div>
                    ))}
                </section>

                {/* Search and filters */}
                <section className="mb-5 rounded-2xl border border-slate-700/80 bg-[#111d31] p-5 shadow-lg shadow-black/10 sm:p-6">
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
                <section className="overflow-hidden rounded-2xl border border-slate-700/80 bg-[#111d31] shadow-xl shadow-black/10">
                    <div className="flex flex-col gap-1 border-b border-slate-700/80 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Registered accounts
                            </h2>
                            <p className="mt-1 text-sm text-slate-400">
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
                                className="self-start text-sm font-semibold text-indigo-300 transition hover:text-indigo-200"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-400">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-indigo-400" />
                            <p className="text-sm font-medium">
                                Loading user accounts...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                            <FiAlertCircle size={30} className="text-rose-400" />
                            <p className="mt-3 text-base font-semibold text-slate-200">
                                Unable to load users
                            </p>
                            <p className="mt-1 text-sm text-slate-400">{error}</p>
                            <button
                                type="button"
                                onClick={() => fetchUsers()}
                                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                            >
                                Try again
                            </button>
                        </div>
                    ) : (
                        <div className="p-3 sm:p-4">
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
