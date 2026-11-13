import { useEffect, useState } from "react";
import { FiCheckCircle, FiAlertTriangle, FiX } from "react-icons/fi";

export default function ConfirmDialog({
    open,
    actionType,
    user,
    onConfirm,
    onCancel,
}) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (open) {
            const frame = requestAnimationFrame(() => setShow(true));
            return () => cancelAnimationFrame(frame);
        }
        setShow(false);
    }, [open]);

    if (!open) return null;

    const isApprove = actionType === "approved" || actionType === "approve";
    const actionLabel = isApprove ? "approve" : "reject";

    return (
        <>
            <button
                type="button"
                aria-label="Close confirmation dialog"
                onClick={onCancel}
                className="fixed inset-0 z-40 cursor-default bg-slate-950/75 backdrop-blur-sm"
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <section
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-dialog-title"
                    className={`pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-700/90 bg-[#111c31] shadow-2xl shadow-black/50 transition-all duration-200 ${
                        show ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.98] opacity-0"
                    }`}
                >
                    <div className={`h-1 w-full ${isApprove ? "bg-emerald-500" : "bg-rose-500"}`} />
                    <div className="p-6 sm:p-7">
                        <div className="flex items-start gap-4">
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                                isApprove ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                            }`}>
                                {isApprove ? <FiCheckCircle size={25} /> : <FiAlertTriangle size={25} />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 id="confirm-dialog-title" className="text-xl font-semibold text-slate-100">
                                    Confirm {actionLabel}
                                </h2>
                                <p className="mt-2 text-base leading-7 text-slate-300">
                                    Are you sure you want to {actionLabel}{" "}
                                    <span className="font-semibold text-white">{user?.name || "this user"}</span>?
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onCancel}
                                aria-label="Close"
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition ${
                                    isApprove
                                        ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/30"
                                        : "bg-rose-600 hover:bg-rose-500 shadow-rose-950/30"
                                }`}
                            >
                                Yes, {actionLabel}
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
