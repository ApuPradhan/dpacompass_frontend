import { useNavigate } from "react-router-dom";
import { FiCalendar, FiEye } from "react-icons/fi";
import StatusBadge from "./StatusBadge";

const RemediationRow = ({ item, index }) => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center px-4 py-3 border-b border-gray-800 hover:bg-[#0f172a]/60 transition group">

            {/* SL No */}
            <div className="w-12 text-gray-400">
                {index + 1}
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex items-center justify-between">

                {/* LEFT: App Info */}
                <div>
                    <p className="text-white font-medium">
                        {item.name}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <FiCalendar size={12} />
                        {item.date}
                    </div>
                </div>

                {/* RIGHT: Status */}
                <div className="w-40 flex justify-start">
                    <StatusBadge status={item.status} />
                </div>

            </div>

            {/* ACTION */}
            <div className="w-24 flex justify-end">
                <button
                    onClick={() => navigate(`/remediation/view/${item.id}`)}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition"
                >
                    <FiEye size={16} />
                    View
                </button>
            </div>

        </div>
    );
};

export default RemediationRow;