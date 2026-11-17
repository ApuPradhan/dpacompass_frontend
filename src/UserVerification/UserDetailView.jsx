import { useEffect, useState } from "react";
import {
    FiX, FiUser, FiMail, FiShield, FiBriefcase, FiPhone,
    FiCheckCircle, FiXCircle, FiClock, FiInfo,
} from "react-icons/fi";

export default function UserDetailView({
    user,
    onClose,
    onApprove,
    onReject,
}) {
    const [show, setShow] = useState(false);

    const styles = {
        overlay: "fixed inset-0 z-40 cursor-default bg-slate-900/35 backdrop-blur-sm",
        panel: "fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl shadow-slate-900/20 transition-transform duration-300",
        header: "border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white px-6 py-6",
        eyebrow: "text-sm font-bold uppercase tracking-[0.16em] text-blue-700",
        title: "mt-2 text-2xl font-bold text-[#14213D]",
        subtitle: "mt-1 text-base leading-6 text-slate-600",
        close: "cursor-pointer rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900",
        avatar: "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-100 text-xl font-bold text-blue-800",
        userName: "truncate text-lg font-bold text-[#14213D]",
        email: "truncate text-base text-slate-600",
        body: "flex-1 overflow-y-auto p-6",
        sectionTitle: "mb-4 flex items-center gap-2 text-base font-bold text-[#14213D]",
        details: "space-y-3",
        guidance: "mt-6 rounded-xl border border-blue-100 bg-blue-50/70 p-4",
        guidanceTitle: "text-base font-bold text-[#173B70]",
        guidanceText: "mt-1.5 text-sm leading-6 text-slate-600",
        footer: "border-t border-slate-200 bg-white p-6",
        actionGrid: "grid grid-cols-1 gap-3 sm:grid-cols-2",
        approve: "cursor-pointer rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500",
        reject: "cursor-pointer rounded-xl bg-rose-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500",
        closeDetails: "mt-3 w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50",
    };

    useEffect(() => {
        if (user) {
            const frame = requestAnimationFrame(() => setShow(true));
            return () => cancelAnimationFrame(frame);
        }
        setShow(false);
    }, [user]);

    if (!user) return null;

    const status = user.status?.toLowerCase();
    const isPending = status === "pending";

    return (
        <>
            <button
                type="button"
                aria-label="Close user details"
                onClick={onClose}
                className={styles.overlay}
            />

            <aside
                aria-label="User details panel"
                className={`${styles.panel} ${show ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className={styles.header}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className={styles.eyebrow}>Account review</p>
                            <h2 className={styles.title}>User details</h2>
                            <p className={styles.subtitle}>
                                Review the account information and verification status.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className={styles.close}
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="mt-6 flex items-center gap-4">
                        <div className={styles.avatar}>
                            {(user.name || "U").trim().charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h3 className={styles.userName}>{user.name || "Unnamed user"}</h3>
                            <p className={styles.email}>{user.email || "No email provided"}</p>
                        </div>
                    </div>
                </div>

                <div className={styles.body}>
                    <div className={styles.sectionTitle}>
                        <FiInfo className="text-blue-600" size={18} />
                        Account information
                    </div>

                    <div className={styles.details}>
                        <DetailItem icon={FiUser} label="Full name" value={user.name} />
                        <DetailItem icon={FiMail} label="Email address" value={user.email} />
                        <DetailItem icon={FiShield} label="Assigned role" value={user.role} capitalize />
                        <DetailItem
                            icon={status === "approved" ? FiCheckCircle : status === "rejected" ? FiXCircle : FiClock}
                            label="Verification status"
                            value={user.status}
                            status={status}
                        />
                        <DetailItem icon={FiBriefcase} label="Organization" value={user.organization} />
                        <DetailItem icon={FiPhone} label="Phone number" value={user.phone} />
                    </div>

                    <div className={styles.guidance}>
                        <p className={styles.guidanceTitle}>Verification guidance</p>
                        <p className={styles.guidanceText}>
                            {isPending
                                ? "This account is awaiting verification. Approve the account if the submitted details are satisfactory, or reject it if they are not."
                                : `This account has been ${status || "updated"}. No verification action is currently available.`}
                        </p>
                    </div>
                </div>

                <div className={styles.footer}>
                    {isPending ? (
                        <div className={styles.actionGrid}>
                            <button
                                type="button"
                                onClick={() => onApprove(user)}
                                className={styles.approve}
                            >
                                Approve account
                            </button>
                            <button
                                type="button"
                                onClick={() => onReject(user)}
                                className={styles.reject}
                            >
                                Reject account
                            </button>
                        </div>
                    ) : (
                        <p className="text-center text-sm text-slate-500">
                            No actions available for this account.
                        </p>
                    )}
                    <button type="button" onClick={onClose} className={styles.closeDetails}>
                        Close details
                    </button>
                </div>
            </aside>
        </>
    );
}

function DetailItem({ icon: Icon, label, value, capitalize = false, status }) {
    const styles = {
        item: "flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
        icon: "mt-0.5 text-blue-600",
        label: "text-xs font-bold uppercase tracking-wide text-slate-500",
        value: "mt-1 break-words text-base font-semibold text-[#14213D]",
        status: "mt-1.5 inline-flex rounded-full border px-3 py-1 text-sm font-bold capitalize",
    };

    const statusClass =
        status === "approved"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : status === "rejected"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : status === "pending"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-slate-50 text-slate-700";

    return (
        <div className={styles.item}>
            <div className={styles.icon}><Icon size={19} /></div>
            <div className="min-w-0 flex-1">
                <p className={styles.label}>{label}</p>
                {status ? (
                    <span className={`${styles.status} ${statusClass}`}>
                        {value || "Unknown"}
                    </span>
                ) : (
                    <p className={`${styles.value} ${capitalize ? "capitalize" : ""}`}>
                        {value || <span className="font-normal italic text-slate-400">Not provided</span>}
                    </p>
                )}
            </div>
        </div>
    );
}
