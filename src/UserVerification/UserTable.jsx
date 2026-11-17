import UserRow from "./UserRow";
import { FiUsers } from "react-icons/fi";

export default function UserTable({ users, onView, onApprove, onReject }) {
    const styles = {
        wrapper: "overflow-hidden rounded-xl border border-slate-200",
        viewport: "overflow-x-auto",
        table: "w-full min-w-[900px] border-collapse text-left",
        head: "bg-[#EAF3FF]",
        headRow: "border-b border-blue-100 text-sm font-bold uppercase tracking-wide text-[#24466F]",
        th: "whitespace-nowrap px-5 py-4",
        body: "divide-y divide-slate-100 bg-white",
        emptyCell: "px-6 py-16 text-center",
        emptyIcon: "flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500",
        emptyTitle: "mt-4 text-lg font-semibold text-[#14213D]",
        emptyDescription: "mt-1 text-base text-slate-500",
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.viewport}>
                <table className={styles.table}>
                    <thead className={styles.head}>
                        <tr className={styles.headRow}>
                            <th className={`${styles.th} w-16`}>#</th>
                            <th className={styles.th}>User</th>
                            <th className={styles.th}>Email address</th>
                            <th className={styles.th}>Role</th>
                            <th className={styles.th}>Status</th>
                            <th className={`${styles.th} text-center`}>Actions</th>
                        </tr>
                    </thead>

                    <tbody className={styles.body}>
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
                                <td colSpan={6} className={styles.emptyCell}>
                                    <div className="mx-auto flex max-w-sm flex-col items-center">
                                        <div className={styles.emptyIcon}>
                                            <FiUsers size={25} />
                                        </div>
                                        <p className={styles.emptyTitle}>No users found</p>
                                        <p className={styles.emptyDescription}>
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
