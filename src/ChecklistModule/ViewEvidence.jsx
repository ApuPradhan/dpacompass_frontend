import { FiFileText } from "react-icons/fi";

const ViewEvidence = ({ evidence, onClose }) => {
    if (!evidence) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">

            <div className="bg-[#0f172a] border border-gray-700 rounded-xl w-[450px] p-6 shadow-xl animate-scaleIn text-white">

                {/* HEADER */}
                <div className="flex flex-col items-center text-center mb-5">
                    <div className="bg-indigo-500/20 text-indigo-400 p-3 rounded-full mb-3">
                        <FiFileText size={22} />
                    </div>

                    <h3 className="text-lg font-semibold">
                        Evidence Details
                    </h3>

                    <p className="text-gray-400 text-sm">
                        View complete evidence information
                    </p>
                </div>

                {/* CONTENT */}
                <div className="space-y-3 text-sm">

                    <div>
                        <p className="text-gray-400">Name</p>
                        <p className="text-white font-medium">{evidence.name}</p>
                    </div>

                    <div>
                        <p className="text-gray-400">Description</p>
                        <p className="text-gray-300">
                            {evidence.description || "—"}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">

                        <div>
                            <p className="text-gray-400">Field Type</p>
                            <p className="text-white">{evidence.field_type}</p>
                        </div>

                        <div>
                            <p className="text-gray-400">Collection</p>
                            <p className="text-white">{evidence.collection_type}</p>
                        </div>

                        <div>
                            <p className="text-gray-400">Data Provider</p>
                            <p className="text-white">{evidence.data_provider}</p>
                        </div>

                        <div>
                            <p className="text-gray-400">Status</p>
                            <span
                                className={`px-2 py-1 text-xs rounded-full ${evidence.is_active
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-yellow-500/20 text-yellow-400"
                                    }`}
                            >
                                {evidence.is_active ? "Published" : "Draft"}
                            </span>
                        </div>

                    </div>
                </div>

                {/* ACTION */}
                <div className="flex justify-center mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ViewEvidence;