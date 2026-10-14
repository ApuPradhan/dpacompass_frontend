import { useNavigate } from "react-router-dom";
import { primaryBtn, dangerBtn, secondaryBtn } from "../theme";
import { FiEdit } from "react-icons/fi";

export default function RejectedAuditViewModal({ audit, onClose, onApprove, onReject }) {
    if (!audit) return null;
    const navigate = useNavigate();
    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="w-full max-w-3xl bg-[#0f172a]/80 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">

                    <h2 className="text-xl font-semibold text-indigo-300 mb-4">
                        Audit Details
                    </h2>

                    <div className="grid grid-cols-2 gap-4 text-sm">

                        <Detail label="Application Name" value={audit.name} />
                        <Detail label="Owner" value={audit.owner || "Not found"} />

                        <Detail label="Department" value={audit.department} />
                        <Detail label="Environment" value={audit.environment} />

                        <Detail label="Version" value={audit.version} />
                        <Detail label="Type" value={audit.type} />

                        <Detail label="URL" value={audit.url} />

                        <Detail
                            label="Created At"
                            value={new Date(audit.created_at).toLocaleString()}
                        />

                        {/* Full width fields */}
                        <div className="col-span-2">
                            <Detail label="Description" value={audit.description} />
                        </div>

                        <div className="col-span-2">
                            <Detail label="Data Categories" value={audit.data_categories} />
                        </div>
                        {audit.remarks && (
                            <div className="col-span-2 mt-2">
                                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
                                    <p className="text-red-400 text-sm font-medium mb-1">
                                        Rejection Reason
                                    </p>
                                    <p className="text-red-300 text-sm">
                                        {audit.remarks}
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={() => navigate(`/user/editapplication/${audit.id}`)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg 
                   bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 
                   hover:bg-indigo-500/30 hover:text-indigo-300 transition"
                        >
                            <FiEdit size={16} />
                            Edit    
                        </button>
                        <button onClick={onClose} className={secondaryBtn}>
                            Close
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}

const Detail = ({ label, value }) => (
    <div>
        <p className="text-gray-400">{label}</p>
        <p>{value}</p>
    </div>
);