import UserRow from "./UserRow";
import { FiUsers } from "react-icons/fi";

export default function UserTable({ users, onView, onApprove, onReject }) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-700/70">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] border-collapse text-left">
                    <thead className="bg-[#17253d]">
                        <tr className="border-b border-slate-700 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                            <th className="w-16 px-5 py-4">#</th>
                            <th className="px-5 py-4">User</th>
                            <th className="px-5 py-4">Email address</th>
                            <th className="px-5 py-4">Role</th>
                            <th className="px-5 py-4">Status</th>
                            <th className="px-5 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60 bg-[#111d31]">
                        {users.length > 0 ? (
                            users.map((user, index) => (
                                <UserRow
                                    key={user.id}
                                    index={index}
                                    user={user}
                                    onView={onView}
                                    onApprove={onApprove}
                                    onReject={onReject}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-14 text-center">
                                    <div className="mx-auto flex max-w-sm flex-col items-center">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-slate-400">
                                            <FiUsers size={25} />
                                        </div>
                                        <p className="mt-4 text-base font-semibold text-slate-200">No users found</p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Try changing your search term or filter selection.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
