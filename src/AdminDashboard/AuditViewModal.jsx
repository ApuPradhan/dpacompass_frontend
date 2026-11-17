
import { useState } from "react";
import {
    FiChevronDown,
    FiChevronRight,
    FiX,
    FiClipboard,
    FiInfo,
} from "react-icons/fi";

export default function AuditViewModal({
    audit,
    onClose,
    onAssign,
    assignAudit,
}) {
    const [showChecklist, setShowChecklist] = useState(false);

    if (!audit) return null;

    const checklist = Array.isArray(audit.checklist)
        ? audit.checklist
        : [];

    // =====================================================
    // LOCAL STYLING VARIABLES
    // =====================================================

    const styles = {
        overlay: "audit-view-overlay",
        modalWrapper: "audit-view-modal-wrapper",
        modal: "audit-view-modal",
        header: "audit-view-header",
        content: "audit-view-content",
        detailsGrid: "audit-view-details-grid",
        detailItem: "audit-view-detail-item",
        fullWidth: "audit-view-full-width",
        checklist: "audit-view-checklist",
        checklistHeader: "audit-view-checklist-header",
        checklistContent: "audit-view-checklist-content",
        checklistItem: "audit-view-checklist-item",
        footer: "audit-view-footer",
        closeButton: "audit-view-close-button",
        assignButton: "audit-view-assign-button",
    };

    // =====================================================
    // SEVERITY BADGE
    // =====================================================

    const getSeverityStyle = (severity) => {
        const level = String(severity || "").toLowerCase();

        if (["critical", "high"].includes(level)) {
            return "border-red-200 bg-red-50 text-red-700";
        }

        if (level === "medium") {
            return "border-amber-200 bg-amber-50 text-amber-700";
        }

        if (level === "low") {
            return "border-emerald-200 bg-emerald-50 text-emerald-700";
        }

        return "border-slate-200 bg-slate-100 text-slate-600";
    };

    // =====================================================
    // DATE FORMAT
    // =====================================================

    const createdAt = audit.created_at
        ? new Date(audit.created_at).toLocaleString()
        : "N/A";

    // =====================================================
    // UI
    // =====================================================

    return (
        <>
            <style>{`
                .audit-view-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 1000;
                    background: rgba(15, 23, 42, .48);
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                    animation: auditOverlayFade .2s ease;
                }

                .audit-view-modal-wrapper {
                    position: fixed;
                    inset: 0;
                    z-index: 1001;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    pointer-events: none;
                }

                .audit-view-modal {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    max-width: 850px;
                    max-height: calc(100vh - 40px);
                    overflow: hidden;
                    pointer-events: auto;
                    border: 1px solid #DCE7F3;
                    border-radius: 16px;
                    background: #FFFFFF;
                    box-shadow: 0 24px 65px rgba(15, 23, 42, .22);
                    animation: auditModalEnter .25s ease;
                }

                .audit-view-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    padding: 21px 26px;
                    border-bottom: 1px solid #E2EAF4;
                    background: #FFFFFF;
                }

                .audit-view-content {
                    flex: 1;
                    min-height: 0;
                    overflow-y: auto;
                    padding: 25px 26px;
                    background: #F8FAFD;
                }

                .audit-view-details-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    column-gap: 28px;
                    row-gap: 22px;
                }

                .audit-view-detail-item {
                    min-width: 0;
                }

                .audit-view-full-width {
                    grid-column: 1 / -1;
                }

                .audit-view-detail-value {
                    margin-top: 6px;
                    padding: 11px 13px;
                    min-height: 42px;
                    overflow-wrap: anywhere;
                    border: 1px solid #E2EAF4;
                    border-radius: 8px;
                    background: #FFFFFF;
                    color: #334155;
                    font-size: 14px;
                    line-height: 1.6;
                }

                .audit-view-checklist {
                    margin-top: 25px;
                    overflow: hidden;
                    border: 1px solid #DCE7F3;
                    border-radius: 11px;
                    background: #FFFFFF;
                }

                .audit-view-checklist-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    width: 100%;
                    padding: 15px 17px;
                    border: 0;
                    background: #EFF6FF;
                    color: #173B70;
                    text-align: left;
                    cursor: pointer;
                    transition: background .2s ease;
                }

                .audit-view-checklist-header:hover {
                    background: #E5F0FF;
                }

                .audit-view-checklist-content {
                    max-height: 270px;
                    overflow-y: auto;
                    padding: 16px;
                    border-top: 1px solid #E2EAF4;
                    background: #FFFFFF;
                }

                .audit-view-checklist-item {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 14px;
                    padding: 14px;
                    border: 1px solid #E2EAF4;
                    border-radius: 9px;
                    background: #FFFFFF;
                    transition: border-color .2s, background .2s;
                }

                .audit-view-checklist-item:hover {
                    border-color: #BFDBFE;
                    background: #F8FBFF;
                }

                .audit-view-footer {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 12px;
                    padding: 17px 26px;
                    border-top: 1px solid #E2EAF4;
                    background: #FFFFFF;
                }

                .audit-view-close-button {
                    min-width: 100px;
                    min-height: 42px;
                    padding: 0 19px;
                    border: 1px solid #CBD5E1;
                    border-radius: 8px;
                    background: #FFFFFF;
                    color: #334155;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all .2s ease;
                }

                .audit-view-close-button:hover {
                    border-color: #94A3B8;
                    background: #F1F5F9;
                    color: #0F172A;
                }

                .audit-view-assign-button {
                    min-width: 145px;
                    min-height: 42px;
                    padding: 0 20px;
                    border: 1px solid #087FD3;
                    border-radius: 8px;
                    background: #087FD3;
                    color: #FFFFFF;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 2px 5px rgba(8, 127, 211, .2);
                    transition: all .2s ease;
                }

                .audit-view-assign-button:hover {
                    border-color: #0568B5;
                    background: #0568B5;
                    box-shadow: 0 4px 10px rgba(8, 127, 211, .22);
                }

                @keyframes auditOverlayFade {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes auditModalEnter {
                    from {
                        opacity: 0;
                        transform: translateY(12px) scale(.98);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @media (max-width: 640px) {
                    .audit-view-modal-wrapper {
                        padding: 10px;
                    }

                    .audit-view-modal {
                        max-height: calc(100vh - 20px);
                        border-radius: 12px;
                    }

                    .audit-view-header {
                        padding: 17px 18px;
                    }

                    .audit-view-content {
                        padding: 19px 17px;
                    }

                    .audit-view-details-grid {
                        grid-template-columns: 1fr;
                        row-gap: 17px;
                    }

                    .audit-view-full-width {
                        grid-column: auto;
                    }

                    .audit-view-footer {
                        padding: 14px 17px;
                    }

                    .audit-view-close-button,
                    .audit-view-assign-button {
                        flex: 1;
                        min-width: 0;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .audit-view-overlay,
                    .audit-view-modal {
                        animation: none;
                    }
                }
            `}</style>

            {/* BACKDROP */}

            <div
                className={styles.overlay}
                onClick={onClose}
            />

            {/* MODAL */}

            <div className={styles.modalWrapper}>
                <div className={styles.modal}>

                    {/* HEADER */}

                    <div className={styles.header}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#087FD3]">
                                <FiClipboard size={21} />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-[#14213D]">
                                    Audit Details
                                </h2>

                                <p className="mt-0.5 text-sm text-slate-500">
                                    {audit.name || "Application information"}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                            title="Close"
                        >
                            <FiX size={21} />
                        </button>
                    </div>

                    {/* CONTENT */}

                    <div className={styles.content}>

                        {/* APPLICATION INFORMATION */}

                        <div className="mb-5 flex items-center gap-2">
                            <FiInfo
                                size={18}
                                className="text-[#087FD3]"
                            />

                            <h3 className="text-sm font-bold uppercase tracking-wide text-[#173B70]">
                                Application Information
                            </h3>
                        </div>

                        <div className={styles.detailsGrid}>

                            <Detail
                                label="Application Name"
                                value={audit.name}
                            />

                            <Detail
                                label="Owner"
                                value={audit.owner_name || "Not found"}
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
                                value={
                                    audit.type_name ||
                                    (audit.type
                                        ? `Type ${audit.type}`
                                        : "N/A")
                                }
                            />

                            <Detail
                                label="URL"
                                value={audit.url}
                                link
                            />

                            <Detail
                                label="Created At"
                                value={createdAt}
                            />

                            <div className={styles.fullWidth}>
                                <Detail
                                    label="Description"
                                    value={audit.description}
                                />
                            </div>

                            <div className={styles.fullWidth}>
                                <Detail
                                    label="Data Categories"
                                    value={audit.data_categories}
                                />
                            </div>

                        </div>

                        {/* CHECKLIST ACCORDION */}

                        {/* <div className={styles.checklist}>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowChecklist((prev) => !prev)
                                }
                                aria-expanded={showChecklist}
                                className={styles.checklistHeader}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#087FD3] shadow-sm">
                                        <FiClipboard size={17} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold">
                                            Checklist
                                        </p>

                                        <p className="text-xs text-blue-600">
                                            {checklist.length} items available
                                        </p>
                                    </div>
                                </div>

                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#087FD3] shadow-sm">
                                    {showChecklist
                                        ? <FiChevronDown size={18} />
                                        : <FiChevronRight size={18} />
                                    }
                                </div>
                            </button> */}

                            {/* {showChecklist && (
                                <div className={styles.checklistContent}>

                                    {checklist.length > 0 ? (
                                        <div className="space-y-3">

                                            {checklist.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className={styles.checklistItem}
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-[#173B70]">
                                                            {item.rule_id || "Unnamed Rule"}
                                                        </p>

                                                        <p className="mt-1 text-sm leading-5 text-slate-500">
                                                            {item.description || "No description available"}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold capitalize ${getSeverityStyle(item.severity)}`}
                                                    >
                                                        {item.severity || "N/A"}
                                                    </span>
                                                </div>
                                            ))}

                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                                <FiClipboard size={21} />
                                            </div>

                                            <p className="text-sm font-semibold text-slate-600">
                                                No checklists available
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                There are no checklist items associated with this audit.
                                            </p>
                                        </div>
                                    )}

                                </div>
                            )} */}
                        {/* </div> */}
                    </div>

                    {/* FOOTER */}

                    <div className={styles.footer}>
                        {assignAudit && (
                            <button
                                type="button"
                                onClick={() => onAssign?.(audit)}
                                className={styles.assignButton}
                            >
                                Assign Auditor
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.closeButton}
                        >
                            Close
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}

// =====================================================
// DETAIL COMPONENT
// =====================================================

const Detail = ({ label, value, link = false }) => {
    const displayValue =
        value === null || value === undefined || value === ""
            ? "N/A"
            : value;

    const isValidLink =
        link &&
        typeof displayValue === "string" &&
        /^https?:\/\//i.test(displayValue);

    return (
        <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
            </p>

            <div className="audit-view-detail-value">
                {isValidLink ? (
                    <a
                        href={displayValue}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        {displayValue}
                    </a>
                ) : (
                    <span className="whitespace-pre-wrap">
                        {Array.isArray(displayValue)
                            ? displayValue.join(", ")
                            : String(displayValue)}
                    </span>
                )}
            </div>
        </div>
    );
};
