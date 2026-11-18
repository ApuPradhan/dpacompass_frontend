
import { useNavigate } from "react-router-dom";
import { FiEdit, FiX, FiFileText, FiAlertCircle } from "react-icons/fi";

export default function RejectedAuditViewModal({
    audit,
    onClose,
    onApprove,
    onReject,
}) {
    const navigate = useNavigate();

    if (!audit) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
                <div
                    className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#075EB5]">
                                <FiFileText size={21} />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-[#14213D]">
                                    Audit Details
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Review rejected application information
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Close modal"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-[70vh] overflow-y-auto px-6 py-6">

                        {/* Application Summary */}
                        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#075EB5]">
                                Application
                            </p>

                            <h3 className="mt-1 text-lg font-bold text-[#14213D]">
                                {audit.name || "Unnamed Application"}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Application ID: {audit.id ?? "—"}
                            </p>

                            <div className="mt-3">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                    Rejected
                                </span>
                            </div>
                        </div>

                        {/* Application Information */}
                        <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">
                            <FiFileText className="text-[#075EB5]" size={17} />

                            <h3 className="text-sm font-semibold text-[#14213D]">
                                Application Information
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                            <Detail
                                label="Application Name"
                                value={audit.name}
                            />

                            <Detail
                                label="Owner"
                                value={audit.owner || "Not found"}
                            />

                            <Detail
                                label="Department"
                                value={audit.department}
                            />

                            <Detail
                                label="Environment"
                                value={audit.environment}
                            />

                            <Detail
                                label="Version"
                                value={audit.version}
                            />

                            <Detail
                                label="Type"
                                value={audit.type}
                            />

                            <div className="sm:col-span-2">
                                <Detail
                                    label="Application URL"
                                    value={audit.url}
                                />
                            </div>

                            <Detail
                                label="Created At"
                                value={
                                    audit.created_at
                                        ? new Date(audit.created_at).toLocaleString()
                                        : "—"
                                }
                            />

                            {/* Description */}
                            <div className="sm:col-span-2">
                                <Detail
                                    label="Description"
                                    value={audit.description}
                                />
                            </div>

                            {/* Data Categories */}
                            <div className="sm:col-span-2">
                                <Detail
                                    label="Data Categories"
                                    value={audit.data_categories}
                                />
                            </div>
                        </div>

                        {/* Rejection Reason */}
                        {audit.remarks && (
                            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <FiAlertCircle
                                        size={17}
                                        className="text-red-600"
                                    />

                                    <p className="text-sm font-semibold text-red-700">
                                        Rejection Reason
                                    </p>
                                </div>

                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-red-800">
                                    {audit.remarks}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row">
                        <button
                            onClick={onClose}
                            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                            Close
                        </button>

                        <button
                            onClick={() =>
                                navigate(`/user/editapplication/${audit.id}`)
                            }
                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#075EB5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#064D94]"
                        >
                            <FiEdit size={16} />
                            Edit Application
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

// --------------------------------------------------
// Detail Component
// --------------------------------------------------

const Detail = ({ label, value }) => (
    <div className="min-w-0">
        <p className="mb-1.5 text-xs font-medium text-slate-500">
            {label}
        </p>

        <p className="break-words text-sm font-semibold text-slate-800">
            {value !== null && value !== undefined && value !== ""
                ? value
                : "—"}
        </p>
    </div>
);
