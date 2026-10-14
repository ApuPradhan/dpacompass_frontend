import { useState } from "react";

export default function ScanResultViewer({ result }) {
    

    const [showDetails, setShowDetails] = useState(false);
    const [showRaw, setShowRaw] = useState(false);

    if (!result) return null;

    const getStatusStyle = (status) => {
        switch (status) {
            case "pass":
                return "bg-green-500/20 text-green-400";
            case "fail":
                return "bg-red-500/20 text-red-400";
            case "warning":
                return "bg-yellow-500/20 text-yellow-400";
            default:
                return "bg-gray-500/20 text-gray-400";
        }
    };

    const formatKey = (key) =>
        key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

    const renderValue = (val) =>
        typeof val === "boolean" ? (val ? "Yes" : "No") : val;

    return (
        <div className="space-y-4 mt-4">

            {/* STATUS + SCORE */}
            <div className="p-4 bg-[#1e293b] rounded-lg border border-gray-700">

                <div className="flex justify-between items-center">
                    <div className={`px-3 py-1 text-xs rounded-full ${getStatusStyle(result.result_status)}`}>
                        {result.result_status?.toUpperCase()}
                    </div>

                    <div className="text-sm text-gray-300">
                        Grade: {result.score?.grade}
                    </div>
                </div>

                <div className="mt-2 text-sm text-gray-400">
                    Score: {result.score?.obtained} / {result.score?.maximum}
                </div>
            </div>

            {/* CONCLUSION */}
            <div className="bg-[#020617] p-3 rounded border border-gray-700">
                <p className="text-gray-400 text-xs mb-1">Conclusion</p>
                <p className="text-sm text-gray-200">{result.conclusion}</p>
            </div>

            {/* ISSUES */}
            {result.issues_found && (
                <div className="space-y-2">
                    <p className="text-red-400 text-sm font-medium">Issues</p>

                    {result.issue_summary?.map((issue, i) => (
                        <div key={i} className="p-2 bg-red-500/10 border border-red-500/20 rounded">
                            {issue}
                        </div>
                    ))}
                </div>
            )}

            {/* EVIDENCE */}
            {result.evidence && (
                <div className="grid grid-cols-2 gap-3 text-sm">

                    {Object.entries(result.evidence).map(([key, val]) => (
                        <div key={key} className="bg-[#020617] p-2 rounded border border-gray-700">

                            <p className="text-gray-400 text-xs">
                                {formatKey(key)}
                            </p>

                            <p className="font-medium">
                                {renderValue(val)}
                            </p>

                        </div>
                    ))}

                </div>
            )}

            {/* REDIRECTS (if exists) */}
            {result.redirects && (
                <div className="bg-[#020617] p-3 rounded border border-gray-700 text-sm">
                    <p className="text-gray-400 text-xs mb-1">Redirects</p>
                    {Object.entries(result.redirects).map(([key, val]) => (
                        <p key={key}>
                            {formatKey(key)}: {val}
                        </p>
                    ))}
                </div>
            )}

            {/* DETAILS */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-indigo-400 text-xs"
            >
                {showDetails ? "Hide Technical Details" : "View Technical Details"}
            </button>

            {showDetails && (
                  <pre className="bg-black text-green-400 text-xs p-3 rounded overflow-auto max-h-80">
                    {JSON.stringify(result, null, 2)}
                </pre>
            )}

           

        </div>
    );
}