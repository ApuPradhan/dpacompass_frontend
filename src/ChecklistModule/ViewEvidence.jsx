
import {
    FiFileText,
    FiX,
    FiLayers,
    FiSettings,
    FiUser,
    FiCheckCircle,
} from "react-icons/fi";

const ViewEvidence = ({ evidence, onClose }) => {
    if (!evidence) return null;

    const isActive = evidence.is_active;
    const isAutomatic = evidence.collection_type === "automated";

    const formatValue = (value) => {
        if (!value) return "—";

        return String(value)
            .replaceAll("_", " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const detailCard = (label, value, icon) => (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-400">
                {icon}
                <p className="text-xs font-semibold uppercase tracking-wide">
                    {label}
                </p>
            </div>

            <p className="text-sm font-semibold text-slate-800">
                {value || "—"}
            </p>
        </div>
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-7">

                    <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#075EB5]">
                            <FiFileText size={23} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[#14213D]">
                                Evidence Details
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                View complete evidence information
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                        aria-label="Close"
                    >
                        <FiX size={21} />
                    </button>

                </div>

                {/* CONTENT */}

                <div className="space-y-5 p-6 sm:p-7">

                    {/* EVIDENCE NAME */}

                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Evidence Name
                        </p>

                        <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                                <FiLayers size={19} />
                            </div>

                            <p className="text-base font-bold text-[#14213D]">
                                {evidence.name}
                            </p>

                        </div>
                    </div>

                    {/* DESCRIPTION */}

                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Description
                        </p>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                {evidence.description || "No description provided."}
                            </p>
                        </div>
                    </div>

                    {/* DETAILS */}

                    <div>
                        <h3 className="mb-3 text-sm font-bold text-[#14213D]">
                            Configuration Details
                        </h3>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                            {detailCard(
                                "Field Type",
                                formatValue(evidence.field_type),
                                <FiSettings size={15} />
                            )}

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="mb-2 flex items-center gap-2 text-slate-400">
                                    <FiFileText size={15} />
                                    <p className="text-xs font-semibold uppercase tracking-wide">
                                        Collection Type
                                    </p>
                                </div>

                                <span
                                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                                        isAutomatic
                                            ? "bg-violet-50 text-violet-700"
                                            : "bg-blue-50 text-blue-700"
                                    }`}
                                >
                                    {isAutomatic ? "Automatic" : "Manual"}
                                </span>
                            </div>

                            {detailCard(
                                "Data Provider",
                                formatValue(evidence.data_provider),
                                <FiUser size={15} />
                            )}

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="mb-2 flex items-center gap-2 text-slate-400">
                                    <FiCheckCircle size={15} />
                                    <p className="text-xs font-semibold uppercase tracking-wide">
                                        Status
                                    </p>
                                </div>

                                <span
                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                        isActive
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-amber-50 text-amber-700"
                                    }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            isActive
                                                ? "bg-emerald-500"
                                                : "bg-amber-500"
                                        }`}
                                    />

                                    {isActive ? "Published" : "Draft"}
                                </span>
                            </div>

                        </div>
                    </div>

                    {/* SCANNER INFORMATION */}

                    {isAutomatic && evidence.scanner && (
                        <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                                Associated Scanner
                            </p>

                            <p className="mt-2 text-sm font-semibold text-slate-800">
                                {typeof evidence.scanner === "object"
                                    ? evidence.scanner.name
                                    : `Scanner ID: ${evidence.scanner}`}
                            </p>
                        </div>
                    )}

                </div>

                {/* FOOTER */}

                <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:px-7">

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl bg-[#075EB5] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#064D94] cursor-pointer"
                    >
                        Close
                    </button>

                </div>

            </div>
        </div>
    );
};

export default ViewEvidence;
