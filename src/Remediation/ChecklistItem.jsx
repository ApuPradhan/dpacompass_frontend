import { useState } from "react";
import { FiChevronDown, FiChevronUp, FiAlertCircle } from "react-icons/fi";

const ChecklistItem = ({ item }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="border border-gray-700 rounded-lg bg-[#0f172a]">

            {/* Header */}
            <div
                className="flex justify-between items-center px-4 py-3 cursor-pointer"
                onClick={() => setOpen(!open)}
            >
                <div className="flex items-center gap-2">
                    <FiAlertCircle className="text-red-400" />
                    <span className="text-white font-medium">{item.rule}</span>
                </div>
                {open ? <FiChevronUp /> : <FiChevronDown />}
            </div>

            {/* Expanded */}
            {open && (
                <div className="px-4 py-3 border-t border-gray-700 space-y-4 text-sm">

                    {/* Description */}
                    <div>
                        <p className="text-gray-400">Description</p>
                        <p>{item.description}</p>
                    </div>

                    {/* Finding */}
                    <div>
                        <p className="text-gray-400">Finding</p>
                        <p className="text-red-300">{item.finding}</p>
                    </div>

                    {/* Recommendation Summary */}
                    <div>
                        <p className="text-gray-400">Recommendation</p>
                        <p className="text-green-300">{item.recommendation.summary}</p>
                    </div>

                    {/* Steps */}
                    <div>
                        <p className="text-gray-400">Steps to Fix</p>
                        <ul className="list-disc ml-5 text-gray-200">
                            {item.recommendation.steps.map((step, i) => (
                                <li key={i}>{step}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Code Snippet
                    <div>
                        <p className="text-gray-400">Code Example</p>
                        <pre className="bg-[#1e293b] p-3 rounded text-xs overflow-x-auto">
                            <code>{item.recommendation.code}</code>
                        </pre>
                    </div> */}

                    {/* Best Practices */}
                    <div>
                        <p className="text-gray-400">Best Practices</p>
                        <ul className="list-disc ml-5 text-gray-300">
                            {item.recommendation.bestPractices.map((bp, i) => (
                                <li key={i}>{bp}</li>
                            ))}
                        </ul>
                    </div>

                </div>
            )}
        </div>
    );
};

export default ChecklistItem;