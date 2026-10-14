import { useState } from "react";

export default function ConsentResultCard() {
    const [showDetails, setShowDetails] = useState(false);

    // 🔥 STATIC DATA (your structure)
    const data = {
        score: 0,
        maxScore: 5,
        grade: "FAIL",
        policy_url: "https://www.geeksforgeeks.org/legal/privacy-policy/",
        pages: 5,
        fields: 30,
        compliant: 0,
        nonCompliant: 30,
        issues: [
            {
                page: "summer-skill-up",
                field: "email",
                problem: "No explicit consent & no purpose"
            },
            {
                page: "advertise-with-us",
                field: "phone",
                problem: "Purpose not specified"
            }
        ]
    };

    return (
        <div className="border border-gray-700 rounded-xl bg-[#111827] p-4 space-y-4">

            {/* STATUS */}
            <p className="text-green-400 text-sm">Completed</p>

            {/* SCORE CARD */}
            <div className="flex justify-between items-center bg-[#1f2937] p-4 rounded-lg border border-gray-600">
                <div>
                    <span className={`px-3 py-1 text-xs rounded-full 
                        ${data.grade === "PASS"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"}`}>
                        {data.grade}
                    </span>

                    <p className="text-sm mt-2 text-gray-300">
                        Score: {data.score} / {data.maxScore}
                    </p>
                </div>

                <p className="text-sm text-gray-300">
                    Grade: {data.grade}
                </p>
            </div>

            {/* CONCLUSION */}
            <div className="border border-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Conclusion</p>
                <p className="text-sm text-gray-200">
                    The application fails to meet DPDP compliance requirements due to
                    lack of explicit consent and missing purpose specification.
                </p>
            </div>

            {/* GRID DETAILS */}
            <div className="grid grid-cols-2 gap-3 text-sm">

                <div className="border border-gray-700 rounded p-2">
                    <p className="text-gray-400">Privacy Policy</p>
                    <p className="text-gray-200 break-all">
                        {data.policy_url}
                    </p>
                </div>

                <div className="border border-gray-700 rounded p-2">
                    <p className="text-gray-400">Pages Scanned</p>
                    <p className="text-gray-200">{data.pages}</p>
                </div>

                <div className="border border-gray-700 rounded p-2">
                    <p className="text-gray-400">Total Fields</p>
                    <p className="text-gray-200">{data.fields}</p>
                </div>

                <div className="border border-gray-700 rounded p-2">
                    <p className="text-gray-400">Explicit Consent</p>
                    <p className="text-red-400">No</p>
                </div>

            </div>

            {/* SUMMARY */}
            <div className="border border-gray-700 rounded p-3">
                <p className="text-gray-400 text-sm">Compliance Summary</p>
                <p className="text-red-400 text-sm">
                    Non-Compliant Fields: {data.nonCompliant}
                </p>
            </div>

            {/* DETAILS TOGGLE */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-indigo-400 text-sm hover:underline"
            >
                {showDetails ? "Hide Technical Details" : "View Technical Details"}
            </button>

            {/* TECHNICAL DETAILS */}
            {showDetails && (
                <div className="border border-gray-700 rounded p-3 space-y-2">

                    {data.issues.map((issue, index) => (
                        <div key={index} className="bg-[#0b1120] p-2 rounded border border-gray-700">

                            <p className="text-xs text-gray-400">
                                Page: {issue.page}
                            </p>

                            <p className="text-sm text-violet-300">
                                Field: {issue.field}
                            </p>

                            <p className="text-sm text-red-400">
                                {issue.problem}
                            </p>

                        </div>
                    ))}

                </div>
            )}
        </div>
    );
}