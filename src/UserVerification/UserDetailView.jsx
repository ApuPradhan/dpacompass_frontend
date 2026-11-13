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
                className="fixed inset-0 z-40 cursor-default bg-slate-950/70 backdrop-blur-sm"
            />

            <aside
                aria-label="User details panel"
                className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-slate-700 bg-[#101b2e] shadow-2xl shadow-black/50 transition-transform duration-300 ${
                    show ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="border-b border-slate-700/80 bg-[#14223a] px-6 py-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">
                                Account review
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-white">User details</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Review the account information and verification status.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="rounded-xl border border-slate-600 p-2.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="mt-6 flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/15 text-xl font-bold text-indigo-200">
                            {(user.name || "U").trim().charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-lg font-semibold text-white">{user.name || "Unnamed user"}</h3>
                            <p className="truncate text-sm text-slate-400">{user.email || "No email provided"}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                        <FiInfo className="text-indigo-300" />
                        Account information
                    </div>

                    <div className="space-y-3">
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

                    <div className="mt-6 rounded-xl border border-slate-700 bg-[#142238] p-4">
                        <p className="text-sm font-semibold text-slate-200">Verification guidance</p>
                        <p className="mt-1.5 text-sm leading-6 text-slate-400">
                            {isPending
                                ? "This account is awaiting verification. Approve the account if the submitted details are satisfactory, or reject it if they are not."
                                : `This account has been ${status || "updated"}. No verification action is currently available.`}
                        </p>
                    </div>
                </div>

                <div className="border-t border-slate-700 bg-[#111c30] p-6">
                    {isPending ? (
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => onApprove(user)}
                                className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                            >
                                Approve account
                            </button>
                            <button
                                type="button"
                                onClick={() => onReject(user)}
                                className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20 focus:outline-none focus:ring-2 focus:ring-rose-400/40"
                            >
                                Reject account
                            </button>
                        </div>
                    ) : (
                        <p className="text-center text-sm text-slate-400">No actions available for this account.</p>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-3 w-full rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                    >
                        Close details
                    </button>
                </div>
            </aside>
        </>
    );
}

function DetailItem({ icon: Icon, label, value, capitalize = false, status }) {
    const statusClass =
        status === "approved"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            : status === "rejected"
                ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                : status === "pending"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                    : "border-slate-600 bg-slate-800 text-slate-200";

    return (
        <div className="flex items-start gap-3 rounded-xl border border-slate-700/80 bg-[#142238] p-4">
            <div className="mt-0.5 text-indigo-300"><Icon size={18} /></div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
                {status ? (
                    <span className={`mt-1.5 inline-flex rounded-full border px-3 py-1 text-sm font-semibold capitalize ${statusClass}`}>
                        {value || "Unknown"}
                    </span>
                ) : (
                    <p className={`mt-1 break-words text-base font-medium text-slate-100 ${capitalize ? "capitalize" : ""}`}>
                        {value || <span className="font-normal italic text-slate-500">Not provided</span>}
                    </p>
                )}
            </div>
        </div>
    );
}
