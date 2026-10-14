import { useState } from "react";
import { inputClass, dangerBtn, secondaryBtn } from "../theme";

export default function RejectModal({ audit, onClose, onReject }) {
    const [reason, setReason] = useState("");

    if (!audit) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-[#0f172a]/80 border border-gray-700 p-6 rounded-2xl w-96">

                    <h2 className="text-lg text-red-400 mb-4">
                        Reject Application
                    </h2>

                    <textarea
                        className={inputClass}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Enter rejection reason"
                    />

                    <div className="mt-4 flex justify-end gap-3">
                        <button onClick={onClose} className={secondaryBtn}>Cancel</button>
                        <button onClick={() => onReject(audit.id,reason)} className={dangerBtn}>
                            Reject
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}