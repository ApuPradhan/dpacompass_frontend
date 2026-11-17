
import { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    FiX,
    FiUser,
    FiCalendar,
    FiFileText,
    FiInfo,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

export default function AuditAssignmentModal({
    mode = "view",
    audit,
    isOpen,
    onClose,
    onSuccess,
    onAssign,
}) {
    const [auditors, setAuditors] = useState([]);
    const [selectedAuditor, setSelectedAuditor] = useState("");
    const [selectedAuditorData, setSelectedAuditorData] = useState(null);
    const [deadline, setDeadline] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingAuditors, setLoadingAuditors] = useState(false);

    const contentRef = useRef(null);
    const assignmentSectionRef = useRef(null);

    const isView = mode === "view";
    const isAssign = mode === "assign";
    const isReassign = mode === "reassign";
    const isRejectedAssignment = !!audit?.assignment_rejection_reason;

    const minimumDate = useMemo(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 10);
        return date;
    }, []);

    // --------------------------------------------------
    // LOCAL STYLING VARIABLES
    // --------------------------------------------------

    const modalOverlay =
        "fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm";

    const modalContainer =
        "relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl";

    const header =
        "sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-5 sm:px-8";

    const heading =
        "text-xl font-bold tracking-tight text-[#14213D] sm:text-2xl";

    const subHeading =
        "mt-1 text-sm font-medium text-slate-500";

    const closeButton =
        "rounded-lg p-2 text-slate-500 transition-all duration-200 hover:bg-blue-50 hover:text-[#087FD3] cursor-pointer";

    const content =
        "flex-1 space-y-6 overflow-y-auto bg-[#F7FAFE] p-5 sm:p-8";

    const section =
        "overflow-hidden rounded-xl border border-[#D8E5F3] bg-white shadow-sm transition-shadow duration-200 hover:shadow-md";

    const sectionHeader =
        "flex items-center gap-2.5 border-b border-[#DCE8F6] bg-[#EDF5FF] px-5 py-4 sm:px-6";

    const sectionTitle =
        "text-base font-semibold text-[#173B70] sm:text-lg";

    const sectionBody =
        "p-5 sm:p-6";

    const fieldLabel =
        "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#526783]";

    const fieldValue =
        "break-words text-[15px] font-medium leading-6 text-[#14213D]";

    const inputClass =
        "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-blue-400 focus:border-[#087FD3] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

    const textAreaClass =
        "w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-blue-400 focus:border-[#087FD3] focus:ring-4 focus:ring-blue-100";

    const primaryButton =
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#087FD3] px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0568B5] hover:shadow-lg hover:shadow-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer";

    const secondaryButton =
        "inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 cursor-pointer";

    const infoCard =
        "rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] p-4";

    const badgeBase =
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize";

    // --------------------------------------------------
    // FETCH AUDITORS
    // --------------------------------------------------

    const fetchAuditors = async () => {
        try {
            setLoadingAuditors(true);

            const res = await fetchWithAuth(
                "/api/auth/admin/get/auditors"
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to fetch auditors");
                return;
            }

            setAuditors(data.data || []);
        } catch (err) {
            console.error(err);
            toast.error("Unable to fetch auditors");
        } finally {
            setLoadingAuditors(false);
        }
    };

    // --------------------------------------------------
    // RESET FORM AND LOAD AUDITORS
    // --------------------------------------------------

    useEffect(() => {
        if (isView) return;

        setDeadline(new Date(minimumDate));
        setRemarks("");
        setSelectedAuditor("");
        setSelectedAuditorData(null);

        fetchAuditors();
    }, [audit]);

    // --------------------------------------------------
    // SCROLL TO ASSIGNMENT SECTION WHEN MODE CHANGES
    // --------------------------------------------------

    useEffect(() => {
        if (!isOpen || isView) return;

        const timer = setTimeout(() => {
            assignmentSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 200);

        return () => clearTimeout(timer);
    }, [mode, isOpen]);

    if (!audit || !isOpen) return null;

    // --------------------------------------------------
    // AUDITOR SELECTION
    // --------------------------------------------------

    const handleAuditorChange = (id) => {
        setSelectedAuditor(id);

        const auditor = auditors.find(
            (item) => String(item.id) === String(id)
        );

        setSelectedAuditorData(auditor || null);
    };

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    const validate = () => {
        if (!selectedAuditor) {
            toast.error("Please select an auditor.");
            return false;
        }

        if (!deadline) {
            toast.error("Please select deadline.");
            return false;
        }

        const selected = new Date(deadline);
        selected.setHours(0, 0, 0, 0);

        const min = new Date(minimumDate);
        min.setHours(0, 0, 0, 0);

        if (selected < min) {
            toast.error(
                "Deadline should be at least 10 days from today."
            );
            return false;
        }

        return true;
    };

    // --------------------------------------------------
    // ASSIGN / REASSIGN
    // --------------------------------------------------

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setLoading(true);

            const endpoint = "/api/audits/assign/";

            const payload = {
                application_id: audit.application_id,
                auditor_id: Number(selectedAuditor),
                audit_deadline: deadline.toISOString().split("T")[0],
                remarks,
            };

            const res = await fetchWithAuth(endpoint, {
                method: "POST",
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Operation failed");
                return;
            }

            toast.success(
                isAssign
                    ? "Auditor assigned successfully"
                    : "Audit re-assigned successfully"
            );

            onSuccess?.();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // WORKLOAD STYLING
    // --------------------------------------------------

    const workload =
        selectedAuditorData?.total_active_workload ?? 0;

    const workloadColor =
        workload <= 5
            ? "bg-emerald-500"
            : workload <= 15
                ? "bg-amber-500"
                : "bg-red-500";

    const workloadBadge =
        workload <= 5
            ? "bg-emerald-50 text-emerald-700"
            : workload <= 15
                ? "bg-amber-50 text-amber-700"
                : "bg-red-50 text-red-700";

    const getStatusStyle = (status) => {
        const value = String(status || "").toLowerCase();

        if (value === "approved" || value === "completed") {
            return "bg-emerald-50 text-emerald-700";
        }

        if (value === "rejected" || value === "failed") {
            return "bg-red-50 text-red-700";
        }

        return "bg-blue-50 text-blue-700";
    };

    // --------------------------------------------------
    // REUSABLE DETAIL FIELD
    // --------------------------------------------------

    const DetailField = ({ label, children, className = "" }) => (
        <div className={className}>
            <p className={fieldLabel}>{label}</p>
            <div className={fieldValue}>{children ?? "-"}</div>
        </div>
    );

    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

    return (
        <>
            <div
                className={modalOverlay}
                onClick={onClose}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
                <div
                    className={modalContainer}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* HEADER */}

                    <div className={header}>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="hidden h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-[#087FD3] sm:flex">
                                    <FiFileText size={19} />
                                </span>

                                <h2 className={heading}>
                                    {isRejectedAssignment
                                        ? "Rejected Assignment Details"
                                        : isView
                                            ? "Audit Details"
                                            : isAssign
                                                ? "Assign Auditor"
                                                : "Re-Assign Auditor"}
                                </h2>
                            </div>

                            <p className={subHeading}>
                                {audit.name ||
                                    audit.application_name ||
                                    "Application information"}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className={closeButton}
                            aria-label="Close modal"
                        >
                            <FiX size={23} />
                        </button>
                    </div>

                    {/* SCROLLABLE CONTENT */}

                    <div
                        ref={contentRef}
                        className={content}
                    >
                        {/* APPLICATION INFORMATION */}

                        <section className={section}>
                            <div className={sectionHeader}>
                                <FiInfo
                                    className="text-[#087FD3]"
                                    size={19}
                                />

                                <h3 className={sectionTitle}>
                                    Application Information
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-x-8 gap-y-6 p-5 sm:grid-cols-2 sm:p-6">
                                {(isReassign || isRejectedAssignment) ? (
                                    <>
                                        <DetailField
                                            label="Application"
                                            children={audit.application_name}
                                        />

                                        <DetailField
                                            label="Audit ID"
                                            children={`#${audit.audit_id ?? "-"}`}
                                        />

                                        <DetailField
                                            label="Previous Auditor"
                                            children={audit.auditor_name}
                                        />

                                        <DetailField
                                            label="Assigned By"
                                            children={audit.assigned_by_name}
                                        />

                                        <DetailField
                                            label="Previous Deadline"
                                            children={audit.audit_deadline}
                                        />

                                        <DetailField label="Remaining Days">
                                            <span className="font-semibold text-amber-600">
                                                {audit.remaining_days ?? "-"} Days
                                            </span>
                                        </DetailField>

                                        <DetailField
                                            label="Assignment Declined On"
                                            className="sm:col-span-2"
                                        >
                                            {audit.assignment_responded_at
                                                ? new Date(
                                                    audit.assignment_responded_at
                                                ).toLocaleString()
                                                : "-"}
                                        </DetailField>
                                    </>
                                ) : (
                                    <>
                                        <DetailField
                                            label="Application Name"
                                            children={audit.name}
                                        />

                                        <DetailField label="Application Owner">
                                            {audit.owner_name ||
                                                audit.owner ||
                                                "-"}
                                        </DetailField>

                                        <DetailField
                                            label="Department"
                                            children={audit.department}
                                        />

                                        <DetailField
                                            label="Environment"
                                            children={audit.environment}
                                        />

                                        <DetailField label="Application Type">
                                            Type {audit.type ?? "-"}
                                        </DetailField>

                                        <DetailField
                                            label="Version"
                                            children={audit.version}
                                        />

                                        <DetailField
                                            label="Application URL"
                                            className="sm:col-span-2"
                                        >
                                            {audit.url ? (
                                                <a
                                                    href={audit.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="break-all font-semibold text-blue-600 transition hover:text-blue-800 hover:underline"
                                                >
                                                    {audit.url}
                                                </a>
                                            ) : (
                                                "-"
                                            )}
                                        </DetailField>

                                        <DetailField label="Status">
                                            <span
                                                className={`${badgeBase} ${getStatusStyle(
                                                    audit.status
                                                )}`}
                                            >
                                                {audit.status || "-"}
                                            </span>
                                        </DetailField>

                                        <DetailField label="Created On">
                                            {audit.created_at
                                                ? new Date(
                                                    audit.created_at
                                                ).toLocaleString()
                                                : "-"}
                                        </DetailField>

                                        <div className="sm:col-span-2">
                                            <p className={fieldLabel}>
                                                Description
                                            </p>

                                            <div className={infoCard}>
                                                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                                    {audit.description || "-"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <p className={fieldLabel}>
                                                Data Categories
                                            </p>

                                            <div className={infoCard}>
                                                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                                    {audit.data_categories || "-"}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        {/* PREVIOUS ASSIGNMENT */}

                        {isReassign && (
                            <section className={section}>
                                <div className={sectionHeader}>
                                    <FiUser
                                        className="text-[#087FD3]"
                                        size={19}
                                    />

                                    <h3 className={sectionTitle}>
                                        Previous Assignment
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2 sm:p-6">
                                    <DetailField
                                        label="Previous Auditor"
                                        children={audit.auditor_name}
                                    />

                                    <DetailField
                                        label="Assigned By"
                                        children={audit.assigned_by_name}
                                    />

                                    <DetailField label="Assigned On">
                                        {audit.created_at
                                            ? new Date(
                                                audit.created_at
                                            ).toLocaleString()
                                            : "-"}
                                    </DetailField>

                                    <DetailField label="Assignment Declined On">
                                        {audit.assignment_responded_at
                                            ? new Date(
                                                audit.assignment_responded_at
                                            ).toLocaleString()
                                            : "-"}
                                    </DetailField>
                                </div>
                            </section>
                        )}

                        {/* REJECTION REASON */}

                        {isReassign && (
                            <section className="overflow-hidden rounded-xl border border-red-200 bg-white shadow-sm">
                                <div className="border-b border-red-100 bg-red-50 px-5 py-4 sm:px-6">
                                    <h3 className="text-base font-semibold text-red-700">
                                        Reason For Declining Assignment
                                    </h3>
                                </div>

                                <div className="p-5 sm:p-6">
                                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                        {audit.assignment_rejection_reason ||
                                            "No reason provided."}
                                    </p>
                                </div>
                            </section>
                        )}

                        {/* SELECT AUDITOR */}

                        {!isView && (
                            <section
                                ref={assignmentSectionRef}
                                className={`${section} scroll-mt-5`}
                            >
                                <div className={sectionHeader}>
                                    <FiUser
                                        className="text-[#087FD3]"
                                        size={19}
                                    />

                                    <h3 className={sectionTitle}>
                                        Select Auditor
                                    </h3>
                                </div>

                                <div className={sectionBody}>
                                    <label className={fieldLabel}>
                                        Choose an auditor
                                    </label>

                                    <select
                                        value={selectedAuditor}
                                        onChange={(e) =>
                                            handleAuditorChange(e.target.value)
                                        }
                                        disabled={loadingAuditors}
                                        className={inputClass}
                                    >
                                        <option value="">
                                            {loadingAuditors
                                                ? "Loading auditors..."
                                                : "Select an auditor"}
                                        </option>

                                        {auditors.map((auditor) => (
                                            <option
                                                key={auditor.id}
                                                value={auditor.id}
                                            >
                                                {auditor.username} (
                                                {auditor.email_id})
                                            </option>
                                        ))}
                                    </select>

                                    <p className="mt-2 text-xs text-slate-500">
                                        Select an auditor to view their current
                                        workload before assignment.
                                    </p>
                                </div>
                            </section>
                        )}

                        {/* AUDITOR DETAILS */}

                        {!isView && selectedAuditorData && (
                            <section className={section}>
                                <div className={sectionHeader}>
                                    <FiUser
                                        className="text-[#087FD3]"
                                        size={19}
                                    />

                                    <h3 className={sectionTitle}>
                                        Auditor Details
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
                                    <div className={infoCard}>
                                        <p className={fieldLabel}>
                                            Auditor Name
                                        </p>

                                        <p className="text-base font-semibold text-slate-800">
                                            {selectedAuditorData.full_name ||
                                                selectedAuditorData.username}
                                        </p>
                                    </div>

                                    <div className={infoCard}>
                                        <p className={fieldLabel}>
                                            Email Address
                                        </p>

                                        <p className="break-all text-sm font-medium text-slate-800">
                                            {selectedAuditorData.email_id || "-"}
                                        </p>
                                    </div>

                                    <div className={infoCard}>
                                        <p className={fieldLabel}>
                                            Active Audits
                                        </p>

                                        <p className="mt-1 text-2xl font-bold text-amber-600">
                                            {selectedAuditorData.active_audits ?? 0}
                                        </p>
                                    </div>

                                    <div className={infoCard}>
                                        <p className={fieldLabel}>
                                            Active Reviews
                                        </p>

                                        <p className="mt-1 text-2xl font-bold text-emerald-600">
                                            {selectedAuditorData.active_reviews ?? 0}
                                        </p>
                                    </div>

                                    <div className={`${infoCard} sm:col-span-2`}>
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p className={fieldLabel}>
                                                    Current Workload
                                                </p>

                                                <p className="text-sm text-slate-500">
                                                    Total active audits and reviews
                                                </p>
                                            </div>

                                            <span
                                                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${workloadBadge}`}
                                            >
                                                {workload} Active
                                            </span>
                                        </div>

                                        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${workloadColor}`}
                                                style={{
                                                    width: `${Math.min(
                                                        workload * 5,
                                                        100
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* AUDIT DEADLINE */}

                        {!isView && (
                            <section className={section}>
                                <div className={sectionHeader}>
                                    <FiCalendar
                                        className="text-[#087FD3]"
                                        size={19}
                                    />

                                    <h3 className={sectionTitle}>
                                        Audit Deadline
                                    </h3>
                                </div>

                                <div className={sectionBody}>
                                    <label className={fieldLabel}>
                                        Select deadline
                                    </label>

                                    <DatePicker
                                        selected={deadline}
                                        onChange={setDeadline}
                                        minDate={minimumDate}
                                        dateFormat="dd-MM-yyyy"
                                        placeholderText="Select deadline"
                                        className={inputClass}
                                        calendarClassName="!rounded-xl !border-slate-200 !shadow-xl"
                                        popperClassName="z-[70]"
                                    />

                                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                                        <FiInfo
                                            className="mt-0.5 shrink-0 text-blue-600"
                                            size={16}
                                        />

                                        <p className="text-xs leading-5 text-blue-800">
                                            Minimum deadline is 10 days from
                                            the assignment date.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* FOOTER */}

                    <div className="sticky bottom-0 z-20 flex shrink-0 flex-row items-center justify-end gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:px-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className={secondaryButton}
                        >
                            Close
                        </button>

                        {isView && !audit.assignment_rejection_reason && (
                            <button
                                type="button"
                                onClick={() => onAssign?.(audit)}
                                className={primaryButton}
                            >
                                Assign Auditor
                            </button>
                        )}

                        {isAssign && (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className={primaryButton}
                            >
                                {loading
                                    ? "Assigning..."
                                    : "Assign Auditor"}
                            </button>
                        )}

                        {isReassign && (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className={primaryButton}
                            >
                                {loading
                                    ? "Re-Assigning..."
                                    : "Re-Assign Auditor"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
