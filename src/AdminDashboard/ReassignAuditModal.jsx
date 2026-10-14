import { useEffect, useState } from "react";
import { FiX, FiUser, FiMessageSquare, FiRepeat } from "react-icons/fi";
import { toast } from "react-toastify";
import Loader from "../utilities/Loader";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

export default function ReassignAuditModal({ audit, onClose, onSuccess }) {

    const [loading, setLoading] = useState(false);
    const [auditors, setAuditors] = useState([]);
    const [selectedAuditor, setSelectedAuditor] = useState("");
    const [remarks, setRemarks] = useState("");

    // ==========================================
    // Dummy Data (Remove once backend is ready)
    // ==========================================

    const dummyAuditors = [
        {
            id: 1,
            name: "Rahul Sharma",
            department: "Banking",
            active_audits: 3,
            completed_audits: 41,
            workload: "Medium",
        },
        {
            id: 2,
            name: "Sneha Roy",
            department: "Government",
            active_audits: 2,
            completed_audits: 58,
            workload: "Low",
        },
        {
            id: 3,
            name: "Amit Das",
            department: "Finance",
            active_audits: 6,
            completed_audits: 89,
            workload: "High",
        },
        {
            id: 4,
            name: "Arindam Ghosh",
            department: "Healthcare",
            active_audits: 1,
            completed_audits: 23,
            workload: "Low",
        },
    ];

    // ==========================================
    // Fetch Available Auditors
    // ==========================================

    const fetchAuditors = async () => {
        try {
            const res = await fetchWithAuth("/api/audits/available-auditors/", {
                method: "GET",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.detail || "Failed to fetch auditors.");
            }

            // Backend
            // setAuditors(data);

            // Temporary
            setAuditors(dummyAuditors);

        } catch (err) {
            console.error(err);

            // Temporary until backend is ready
            setAuditors(dummyAuditors);
        }
    };

    useEffect(() => {
        if (audit) {
            fetchAuditors();
            setSelectedAuditor("");
            setRemarks("");
        }
    }, [audit]);

    // ==========================================
    // Selected Auditor
    // ==========================================

    const selected = auditors.find(
        (a) => Number(a.id) === Number(selectedAuditor)
    );

    // ==========================================
    // Submit Reassignment
    // ==========================================

    const handleSubmit = async () => {

        if (!selectedAuditor) {
            toast.warning("Please select an auditor.");
            return;
        }

        try {

            setLoading(true);

            const payload = {
                audit_id: audit.audit_id,
                new_auditor_id: selectedAuditor,
                remarks,
            };

            const res = await fetchWithAuth("/api/audits/reassign/", {
                method: "POST",
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.detail || "Failed to reassign audit.");
            }

            toast.success("Audit reassigned successfully.");
            onSuccess();

        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!audit) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

            <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-violet-800/40 bg-[#111827] shadow-2xl">

                {/* Header */}

                <div className="flex items-center justify-between border-b border-violet-800/30 px-6 py-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-indigo-300">
                            Reassign Audit
                        </h2>

                        <p className="mt-1 text-sm text-gray-400">
                            Assign this rejected audit application to another available auditor.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Body */}

                <div className="space-y-6 p-6">

                    {/* Audit Information */}

                    <div className="rounded-xl border border-violet-800/30 bg-[#0f172a] p-5">

                        <h3 className="mb-4 text-lg font-semibold text-indigo-300">
                            Audit Information
                        </h3>

                        <div className="grid grid-cols-2 gap-5">

                            <div>
                                <p className="text-sm text-gray-400">Application</p>
                                <p className="mt-1 font-medium text-white">
                                    {audit.application_name}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-400">Rejected Auditor</p>
                                <p className="mt-1 font-medium text-white">
                                    {audit.auditor_name}
                                </p>
                            </div>

                            <div className="col-span-2">
                                <p className="text-sm text-gray-400">
                                    Rejection Reason
                                </p>

                                <div className="mt-2 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                                    {audit.rejection_reason}
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* Select Auditor */}

                    <div className="rounded-xl border border-violet-800/30 bg-[#0f172a] p-5">

                        <h3 className="mb-4 text-lg font-semibold text-indigo-300">
                            Select New Auditor
                        </h3>

                        <select
                            value={selectedAuditor}
                            onChange={(e) => setSelectedAuditor(e.target.value)}
                            className="w-full rounded-lg border border-violet-800/30 bg-[#111827] px-4 py-3 text-white outline-none focus:border-indigo-500"
                        >
                            <option value="">
                                Choose an available auditor...
                            </option>

                            {auditors.map((auditor) => (
                                <option key={auditor.id} value={auditor.id}>
                                    {auditor.name} • {auditor.department}
                                </option>
                            ))}
                        </select>

                    </div>
                    {/* Selected Auditor Details */}

                    {selected && (
                        <div className="rounded-xl border border-violet-800/30 bg-[#0f172a] p-5">

                            <h3 className="mb-4 text-lg font-semibold text-indigo-300">
                                Auditor Details
                            </h3>

                            <div className="grid grid-cols-2 gap-5">

                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-indigo-500/10 p-3">
                                        <FiUser className="text-indigo-400" size={20} />
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-400">
                                            Auditor
                                        </p>

                                        <p className="font-medium text-white">
                                            {selected.name}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-400">
                                        Department
                                    </p>

                                    <p className="font-medium text-white">
                                        {selected.department}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-400">
                                        Active Audits
                                    </p>

                                    <p className="font-medium text-yellow-400">
                                        {selected.active_audits}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-400">
                                        Completed Audits
                                    </p>

                                    <p className="font-medium text-green-400">
                                        {selected.completed_audits}
                                    </p>
                                </div>

                                <div className="col-span-2">

                                    <p className="mb-2 text-sm text-gray-400">
                                        Current Workload
                                    </p>

                                    <span
                                        className={`rounded-full px-4 py-2 text-sm font-medium ${selected.workload === "Low"
                                                ? "bg-green-500/20 text-green-400"
                                                : selected.workload === "Medium"
                                                    ? "bg-yellow-500/20 text-yellow-400"
                                                    : "bg-red-500/20 text-red-400"
                                            }`}
                                    >
                                        {selected.workload}
                                    </span>

                                </div>

                            </div>

                        </div>
                    )}

                    {/* Admin Remarks */}

                    <div className="rounded-xl border border-violet-800/30 bg-[#0f172a] p-5">

                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-indigo-300">
                            <FiMessageSquare />
                            Admin Remarks
                        </h3>

                        <textarea
                            rows={5}
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Add remarks for the newly assigned auditor (optional)..."
                            className="w-full resize-none rounded-lg border border-violet-800/30 bg-[#111827] p-4 text-white outline-none placeholder:text-gray-500 focus:border-indigo-500"
                        />

                    </div>

                </div>

                {/* Footer */}

                <div className="flex items-center justify-end gap-4 border-t border-violet-800/30 bg-[#0b1120] px-6 py-5">

                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg border border-gray-700 px-5 py-2 text-gray-300 transition hover:bg-gray-800"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !selectedAuditor}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 font-medium transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader size="sm" />
                                Reassigning...
                            </>
                        ) : (
                            <>
                                <FiRepeat />
                                Reassign Audit
                            </>
                        )}
                    </button>

                </div>

            </div>

        </div>
    );
}