import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiX, FiChevronDown, FiChevronRight, FiUser, FiCalendar, FiFileText } from "react-icons/fi";
import { toast } from "react-toastify";
import { primaryBtn, secondaryBtn } from "../theme";
import { fetchWithAuth } from "../utilities/fetchWithAuth";


export default function AuditAssignmentModal({
    mode = "view",
    audit,
    isOpen,
    onClose,
    onSuccess,
    onAssign
}) {

    const [showChecklist, setShowChecklist] = useState(false);
    const [auditors, setAuditors] = useState([]);
    const [selectedAuditor, setSelectedAuditor] = useState("");
    const [selectedAuditorData, setSelectedAuditorData] = useState(null);
    const [deadline, setDeadline] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingAuditors, setLoadingAuditors] = useState(false);


    const isView = mode === "view";
    const isAssign = mode === "assign";
    const isReassign = mode === "reassign";
    const isRejectedAssignment =
        !!audit?.assignment_rejection_reason;

    const minimumDate = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 10);
        return d;
    }, []);



    const fetchAuditors = async () => {
        try {

            setLoadingAuditors(true);

            const res = await fetchWithAuth("/api/auth/admin/get/auditors");

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

    useEffect(() => {
        if (isView) return;
        setDeadline(new Date(minimumDate));
        setRemarks("");
        setSelectedAuditor("");
        setSelectedAuditorData(null);
        fetchAuditors();
    }, [audit]);

    if (!audit || !isOpen) return null;
    const handleAuditorChange = id => {

        setSelectedAuditor(id);

        const auditor = auditors.find(a => String(a.id) === String(id));

        setSelectedAuditorData(auditor || null);

    };

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
            toast.error("Deadline should be at least 10 days from today.");
            return false;
        }

        return true;

    };

    const handleSubmit = async () => {

        if (!validate()) return;

        try {

            setLoading(true);

            const endpoint = "/api/audits/assign/";
            console.log("Audit", audit);
            
            const payload = {
                application_id: audit.application_id,
                auditor_id: Number(selectedAuditor),
                audit_deadline: deadline.toISOString().split("T")[0],
                remarks
            };
            
            const res = await fetchWithAuth(endpoint, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            console.log("Handle Submit:" ,data);

            if (!res.ok) {
                toast.error(data.message || "Operation failed");
                return;
            }

            toast.success(isAssign ? "Auditor assigned successfully" : "Audit re-assigned successfully");

            onSuccess?.();

            onClose();

        } catch (err) {
            console.error(err);
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={onClose} />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">

                <div className="w-full max-w-6xl max-h-[94vh] overflow-y-auto rounded-2xl border border-slate-700 bg-[#0f172a] shadow-2xl">

                    {/* HEADER */}

                    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-700 bg-[#0f172a] px-8 py-5">

                        <div>

                            <h2 className="text-2xl font-semibold text-indigo-300">
                                {
                                    audit?.assignment_rejection_reason
                                        ? "Rejected Assignment Details"
                                        : isView
                                            ? "Audit Details"
                                            : isAssign
                                                ? "Assign Auditor"
                                                : "Re-Assign Auditor"
                                }
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                {audit.name}
                            </p>

                        </div>

                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 transition hover:bg-slate-800"
                        >
                            <FiX size={22} />
                        </button>

                    </div>

                    <div className="space-y-8 p-8">

                        {/* APPLICATION INFORMATION */}

                        <div className="rounded-2xl border border-slate-700 bg-[#111827]">

                            <div className="border-b border-slate-700 px-6 py-4">

                                <h3 className="text-lg font-semibold text-indigo-300">
                                    Application Information
                                </h3>

                            </div>

                            <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-6">

                                {(isReassign || isRejectedAssignment) ? (

                                    <>

                                        <div>
                                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                                Application
                                            </p>
                                            <p>{audit.application_name}</p>
                                        </div>

                                        <div>
                                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                                Audit ID
                                            </p>
                                            <p>#{audit.audit_id}</p>
                                        </div>

                                        <div>
                                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                                Previous Auditor
                                            </p>
                                            <p>{audit.auditor_name}</p>
                                        </div>

                                        <div>
                                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                                Assigned By
                                            </p>
                                            <p>{audit.assigned_by_name}</p>
                                        </div>

                                        <div>
                                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                                Previous Deadline
                                            </p>
                                            <p>{audit.audit_deadline}</p>
                                        </div>

                                        <div>
                                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                                Remaining Days
                                            </p>
                                            <p className="font-medium text-yellow-400">
                                                {audit.remaining_days} Days
                                            </p>
                                        </div>

                                        <div className="col-span-2">
                                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                                Assignment Declined On
                                            </p>
                                            <p>
                                                {audit.assignment_responded_at
                                                    ? new Date(audit.assignment_responded_at).toLocaleString()
                                                    : "-"}
                                            </p>
                                        </div>

                                    </>

                                ) : (

                                    <>

                                        <div>
                                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                                Application Name
                                            </p>
                                            <p className="font-medium">
                                                {audit.name}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                                Application Owner
                                            </p>
                                            <p>
                                                {audit.owner_name || audit.owner || "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                                Department
                                            </p>
                                            <p>
                                                {audit.department}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                                Environment
                                            </p>
                                            <p>
                                                {audit.environment}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                                Application Type
                                            </p>
                                            <p>
                                                Type {audit.type}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                                Version
                                            </p>
                                            <p>
                                                {audit.version}
                                            </p>
                                        </div>

                                        <div className="col-span-2">
                                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                                Application URL
                                            </p>

                                            <a
                                                href={audit.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-400 hover:underline break-all"
                                            >
                                                {audit.url}
                                            </a>

                                        </div>

                                        <div>
                                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                                Status
                                            </p>

                                            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-sm text-indigo-300">
                                                {audit.status}
                                            </span>

                                        </div>

                                        <div>
                                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                                Created On
                                            </p>

                                            <p>
                                                {audit.created_at
                                                    ? new Date(audit.created_at).toLocaleString()
                                                    : "-"}
                                            </p>

                                        </div>

                                        <div className="col-span-2">
                                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                                Description
                                            </p>

                                            <div className="rounded-lg border border-slate-700 bg-[#020617] p-4 whitespace-pre-wrap">
                                                {audit.description || "-"}
                                            </div>

                                        </div>

                                        <div className="col-span-2">
                                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                                Data Categories
                                            </p>

                                            <div className="rounded-lg border border-slate-700 bg-[#020617] p-4 whitespace-pre-wrap">
                                                {audit.data_categories || "-"}
                                            </div>

                                        </div>

                                    </>

                                )}

                            </div>

                        </div>

                        {/* REASSIGN REASON */}
                        {isReassign && (

                            <div className="rounded-2xl border border-slate-700 bg-[#111827]">

                                <div className="border-b border-slate-700 px-6 py-4">

                                    <h3 className="text-lg font-semibold text-indigo-300">
                                        Previous Assignment
                                    </h3>

                                </div>

                                <div className="grid grid-cols-2 gap-6 p-6">

                                    <div>
                                        <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                            Previous Auditor
                                        </p>
                                        <p>{audit.auditor_name}</p>
                                    </div>

                                    <div>
                                        <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                            Assigned By
                                        </p>
                                        <p>{audit.assigned_by_name}</p>
                                    </div>

                                    <div>
                                        <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                            Assigned On
                                        </p>
                                        <p>{new Date(audit.created_at).toLocaleString()}</p>
                                    </div>

                                    <div>
                                        <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                                            Assignment Declined On
                                        </p>
                                        <p>{new Date(audit.assignment_responded_at).toLocaleString()}</p>
                                    </div>

                                </div>

                            </div>

                        )}
                        {isReassign && (

                            <div className="rounded-2xl border border-red-500/30 bg-red-500/10">

                                <div className="border-b border-red-500/20 px-6 py-4">

                                    <h3 className="text-lg font-semibold text-red-400">
                                        Reason For Declining Assignment
                                    </h3>

                                </div>

                                <div className="p-6">

                                    <p className="text-red-300 leading-7">
                                        {audit.assignment_rejection_reason || "No reason provided."}
                                    </p>

                                </div>

                            </div>

                        )}

                        {/* SELECT AUDITOR */}

                        {!isView && (

                            <div className="rounded-2xl border border-slate-700 bg-[#111827]">

                                <div className="border-b border-slate-700 px-6 py-4">

                                    <h3 className="flex items-center gap-2 text-lg font-semibold text-indigo-300">
                                        <FiUser />
                                        Select Auditor
                                    </h3>

                                </div>

                                <div className="p-6">

                                    <select
                                        value={selectedAuditor}
                                        onChange={e => handleAuditorChange(e.target.value)}
                                        disabled={loadingAuditors}
                                        className="w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 outline-none focus:border-indigo-500"
                                    >

                                        <option value="">
                                            Select Auditor
                                        </option>

                                        {auditors.map(a => (
                                            <option
                                                key={a.id}
                                                value={a.id}
                                            >
                                                {a.full_name || a.username} ({a.email_id})
                                            </option>
                                        ))}

                                    </select>

                                </div>

                            </div>

                        )}
                        {!isView && selectedAuditorData && (

                            <div className="rounded-2xl border border-slate-700 bg-[#111827]">

                                <div className="border-b border-slate-700 px-6 py-4">

                                    <h3 className="text-lg font-semibold text-indigo-300">
                                        Auditor Details
                                    </h3>

                                </div>

                                <div className="grid grid-cols-2 gap-6 p-6">

                                    <div className="rounded-xl bg-[#020617] border border-slate-700 p-4">
                                        <p className="text-xs uppercase text-slate-400">Auditor Name</p>
                                        <p className="mt-2 text-lg font-semibold">
                                            {selectedAuditorData.full_name || selectedAuditorData.username}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-[#020617] border border-slate-700 p-4">
                                        <p className="text-xs uppercase text-slate-400">Email Address</p>
                                        <p className="mt-2 break-all">
                                            {selectedAuditorData.email_id}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-[#020617] border border-slate-700 p-4">
                                        <p className="text-xs uppercase text-slate-400">Active Audits</p>
                                        <p className="mt-2 text-2xl font-bold text-yellow-400">
                                            {selectedAuditorData.active_audits}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-[#020617] border border-slate-700 p-4">
                                        <p className="text-xs uppercase text-slate-400">Active Reviews</p>
                                        <p className="mt-2 text-2xl font-bold text-green-400">
                                            {selectedAuditorData.active_reviews}
                                        </p>
                                    </div>

                                    <div className="col-span-2 rounded-xl bg-[#020617] border border-slate-700 p-4">
                                        <p className="text-xs uppercase text-slate-400">
                                            Current Workload
                                        </p>

                                        <div className="mt-3 flex items-center justify-between">

                                            <div className="h-3 w-64 rounded-full bg-slate-700 overflow-hidden">

                                                <div
                                                    style={{
                                                        width: `${Math.min(selectedAuditorData.total_active_workload * 5, 100)}%`
                                                    }}
                                                    className={`h-full ${selectedAuditorData.total_active_workload <= 5
                                                        ? "bg-green-500"
                                                        : selectedAuditorData.total_active_workload <= 15
                                                            ? "bg-yellow-500"
                                                            : "bg-red-500"
                                                        }`}
                                                />

                                            </div>

                                            <span className={`rounded-full px-3 py-1 text-sm font-medium ${selectedAuditorData.total_active_workload <= 5
                                                ? "bg-green-500/20 text-green-400"
                                                : selectedAuditorData.total_active_workload <= 15
                                                    ? "bg-yellow-500/20 text-yellow-400"
                                                    : "bg-red-500/20 text-red-400"
                                                }`}>

                                                {selectedAuditorData.total_active_workload} Active

                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        )}

                        {!isView && (

                            <div className="rounded-2xl border border-slate-700 bg-[#111827]">

                                <div className="border-b border-slate-700 px-6 py-4">

                                    <h3 className="flex items-center gap-2 text-lg font-semibold text-indigo-300">
                                        <FiCalendar />
                                        Audit Deadline
                                    </h3>

                                </div>

                                <div className="p-6">

                                    <DatePicker
                                        selected={deadline}
                                        onChange={setDeadline}
                                        minDate={minimumDate}
                                        dateFormat="dd-MM-yyyy"
                                        placeholderText="Select Deadline"
                                        className="w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 outline-none focus:border-indigo-500"
                                    />

                                    <p className="mt-3 text-sm text-yellow-400">
                                        Minimum deadline is 10 days from assignment date.
                                    </p>

                                </div>

                            </div>

                        )}

                        {!isView && (

                            <div className="rounded-2xl border border-slate-700 bg-[#111827]">

                                <div className="border-b border-slate-700 px-6 py-4">

                                    <h3 className="flex items-center gap-2 text-lg font-semibold text-indigo-300">
                                        <FiFileText />
                                        Admin Remarks
                                    </h3>

                                </div>

                                <div className="p-6">

                                    <textarea
                                        rows={5}
                                        value={remarks}
                                        onChange={e => setRemarks(e.target.value)}
                                        placeholder="Enter remarks..."
                                        className="w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 resize-none outline-none focus:border-indigo-500"
                                    />

                                </div>

                            </div>

                        )}

                    </div>

                    <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-700 bg-[#0f172a] px-8 py-5">

                        {isView && !audit.assignment_rejection_reason && (
                            <button
                                onClick={() => onAssign?.(audit)}
                                className={primaryBtn}
                            >
                                Assign Auditor
                            </button>
                        )}
                        {isAssign && (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className={primaryBtn}
                            >
                                {loading ? "Assigning..." : "Assign Auditor"}
                            </button>
                        )}

                        {isReassign && (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className={primaryBtn}
                            >
                                {loading ? "Re-Assigning..." : "Re-Assign Auditor"}
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className={secondaryBtn}
                        >
                            Close
                        </button>

                    </div>

                </div>

            </div>

        </>
    );
}