
export default function AuditPendingViewModal({
    audit,
    onClose,
    onApprove,
    onReject
}) {
    if (!audit) return null;

    // Local theme styles
    const modalStyles = {
        overlay: "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40",

        container: `
            w-full max-w-3xl
            bg-white
            border border-blue-100
            rounded-2xl
            p-6
            shadow-2xl shadow-blue-900/10
            animate-in fade-in zoom-in-95 duration-200
        `,

        heading: "text-xl font-semibold tracking-tight text-slate-900 mb-6",

        primaryButton: `
            px-5 py-2.5
            rounded-lg
            bg-blue-600 hover:bg-blue-700
            text-white text-sm font-semibold
            shadow-sm shadow-blue-200
            transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-blue-100
        `,

        dangerButton: `
            px-5 py-2.5
            rounded-lg
            bg-red-50 hover:bg-red-100
            border border-red-200
            text-red-600
            text-sm font-semibold
            transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-red-100
        `,

        secondaryButton: `
            px-5 py-2.5
            rounded-lg
            bg-white hover:bg-slate-50
            border border-slate-200
            text-slate-600 hover:text-slate-800
            text-sm font-semibold
            transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-slate-100
        `
    };

    return (
        <>
            {/* Modal Overlay */}
            <div
                className={modalStyles.overlay}
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">

                <div className={modalStyles.container}>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">

                        <div>
                            <h2 className={modalStyles.heading}>
                                Audit Details
                            </h2>

                            <p className="text-sm text-slate-500 -mt-3">
                                Review the application information before taking action.
                            </p>
                        </div>

                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <span className="text-blue-600 text-lg font-semibold">
                                A
                            </span>
                        </div>

                    </div>

                    {/* Details */}
                    <div className="
                        grid grid-cols-2 gap-x-6 gap-y-5
                        rounded-xl
                        border border-slate-100
                        bg-slate-50/70
                        p-5
                        text-sm
                    ">

                        <Detail
                            label="Application Name"
                            value={audit.name}
                        />

                        <Detail
                            label="Owner"
                            value={audit.owner || "Not found"}
                        />

                        {/* <Detail label="Department" value={audit.department} /> */}

                        <Detail
                            label="Environment"
                            value={audit.environment}
                        />

                        {/* <Detail label="Version" value={audit.version} /> */}

                        <Detail
                            label="Type"
                            value={audit.type}
                        />

                        <Detail
                            label="URL"
                            value={audit.url}
                        />

                        <Detail
                            label="Created At"
                            value={new Date(audit.created_at).toLocaleString()}
                        />

                        {/* Full width description */}
                        <div className="col-span-2">
                            <Detail
                                label="Description"
                                value={audit.description}
                            />
                        </div>

                        {/* <div className="col-span-2">
                            <Detail label="Data Categories" value={audit.data_categories} />
                        </div> */}

                    </div>

                    {/* Footer Actions */}
                    <div className="
                        mt-7 pt-5
                        border-t border-slate-100
                        flex justify-end gap-3
                    ">

                        <button
                            onClick={() => onReject(audit)}
                            className={modalStyles.dangerButton}
                        >
                            Reject
                        </button>

                        <button
                            onClick={() => onApprove(audit.id)}
                            className={modalStyles.primaryButton}
                        >
                            Approve
                        </button>

                        <button
                            onClick={onClose}
                            className={modalStyles.secondaryButton}
                        >
                            Close
                        </button>

                    </div>

                </div>
            </div>
        </>
    );
}


/* =====================================================
   DETAIL FIELD
   ===================================================== */

const Detail = ({ label, value }) => (
    <div className="min-w-0">

        <p className="
            text-xs font-semibold
            uppercase tracking-wide
            text-slate-500
            mb-1.5
        ">
            {label}
        </p>

        <p className="
            text-sm font-medium
            text-slate-800
            break-words
            leading-6
        ">
            {value || "Not provided"}
        </p>

    </div>
);
