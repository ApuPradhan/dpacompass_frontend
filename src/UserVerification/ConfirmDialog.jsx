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

    const styles = {
        overlay: "fixed inset-0 z-40 cursor-default bg-slate-900/35 backdrop-blur-sm",
        wrapper: "pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4",
        dialog: "pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 transition-all duration-200",
        content: "p-6 sm:p-7",
        title: "text-xl font-bold text-[#14213D]",
        message: "mt-2 text-base leading-7 text-slate-600",
        close: "cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800",
        footer: "mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
        cancel: "cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50",
        confirm: "cursor-pointer rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition",
    };

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
                className={styles.overlay}
            />

            <div className={styles.wrapper}>
                <section
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-dialog-title"
                    className={`${styles.dialog} ${
                        show ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.98] opacity-0"
                    }`}
                >
                    <div className={`h-1.5 w-full ${isApprove ? "bg-emerald-500" : "bg-rose-500"}`} />
                    <div className={styles.content}>
                        <div className="flex items-start gap-4">
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                                isApprove ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                            }`}>
                                {isApprove ? <FiCheckCircle size={25} /> : <FiAlertTriangle size={25} />}
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2 id="confirm-dialog-title" className={styles.title}>
                                    Confirm {actionLabel}
                                </h2>
                                <p className={styles.message}>
                                    Are you sure you want to {actionLabel}{" "}
                                    <span className="font-bold text-[#14213D]">{user?.name || "this user"}</span>?
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={onCancel}
                                aria-label="Close"
                                className={styles.close}
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className={styles.footer}>
                            <button type="button" onClick={onCancel} className={styles.cancel}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                className={`${styles.confirm} ${
                                    isApprove
                                        ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500"
                                        : "bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-rose-500"
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
