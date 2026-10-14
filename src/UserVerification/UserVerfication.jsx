import { useState, useEffect } from "react";
import FilterBar from "./FilterBar";
import UserTable from "./UserTable";
import UserDetailView from "./UserDetailView";
import ConfirmDialog from "./ConfirmDialog";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
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
    const [error, setError] = useState(null);

    // =========================
    // SAFE JSON PARSER
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
    // FETCH USERS
    // =========================
    const fetchUsers = async () => {
        try {
            const res = await fetchWithAuth(`/api/auth/admin/users/`, {
                method: "GET",
            });

            const data = await safeJson(res);

            if (!res.ok) {
                throw new Error(data?.detail || "Failed to fetch users");
            }

            setUsers(data.data);

        } catch (err) {
            console.error(err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // =========================
    // UPDATE STATUS
    // =========================
    const updateUserStatus = async (userId, status) => {
        try {
            const res = await fetchWithAuth(
                `/api/auth/users/${userId}/status/`,
                {
                    method: "PATCH",
                    body: JSON.stringify({ status }),
                }
            );

            const data = await safeJson(res);

            if (!res.ok) {
                throw new Error(data?.message || "Failed to update status");
            }

            toast.success("User status updated");
            fetchUsers();
            setSelectedUser(null);

        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    };

    // =========================
    // ACTIONS
    // =========================
    const handleApprove = (user) => {
        setConfirmAction({ type: "approved", user });
    };

    const handleReject = (user) => {
        setConfirmAction({ type: "rejected", user });
    };

    const confirmActionHandler = () => {
        const { type, user } = confirmAction;
        updateUserStatus(user.id, type);
        setConfirmAction(null);
    };

    // =========================
    // FILTERING
    // =========================
    const formattedUsers = users.map((u) => ({
        ...u,
        name: `${u.first_name} ${u.last_name}`,
    }));

    const filteredUsers = formattedUsers.filter((u) => {
        return (
            (!search ||
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase())) &&
            (!roleFilter || u.role.toLowerCase() === roleFilter) &&
            (!statusFilter || u.status === statusFilter)
        );
    });

    // =========================
    // UI
    // =========================
    return (
        <div className="min-h-screen bg-linear-to-br from-[#0f172a] to-[#1e293b] text-white p-6">

            {/* BACK BUTTON */}
            <div
                className="mb-6 flex items-center gap-2 text-indigo-400 cursor-pointer hover:text-indigo-300"
                onClick={() => navigate("/admindashboard")}
            >
                <FiArrowLeft size={18} />
                <span>Back to Dashboard</span>
            </div>

            {/* TITLE */}
            <h1 className="text-2xl font-semibold text-indigo-300 mb-6">
                User Verification
            </h1>

            {/* FILTER */}
            <div className="bg-[#0f172a]/80 border border-gray-700 rounded-xl p-4 mb-6">
                <FilterBar
                    search={search}
                    setSearch={setSearch}
                    roleFilter={roleFilter}
                    setRoleFilter={setRoleFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />
            </div>

            {/* TABLE */}
            <div className="bg-[#0f172a]/80 border border-gray-700 rounded-xl p-4">
                {loading ? (
                    <div className="text-center">Loading users...</div>
                ) : error ? (
                    <div className="text-center text-red-400">{error}</div>
                ) : (
                    <UserTable
                        users={filteredUsers}
                        onView={setSelectedUser}
                        onApprove={handleApprove}
                        onReject={handleReject}
                    />
                )}
            </div>

            {/* MODALS */}
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
        </div>
    );
}