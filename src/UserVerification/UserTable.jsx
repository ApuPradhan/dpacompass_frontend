import UserRow from "./UserRow";

export default function UserTable({ users, onView, onApprove, onReject }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300 border-collapse">

                {/* Header */}
                <thead>
                    <tr className="border-b border-gray-700 text-gray-400 uppercase text-xs tracking-wide">
                        <th className="px-4 py-3 w-12">#</th>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Role</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                </thead>

                {/* Body */}
                <tbody>
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
                            <td colSpan="5" className="text-center py-6 text-gray-500">
                                No users found
                            </td>
                        </tr>
                    )}
                </tbody>

            </table>
        </div>
    );
}