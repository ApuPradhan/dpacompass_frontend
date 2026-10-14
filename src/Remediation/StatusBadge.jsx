import { FiCheckCircle, FiClock, FiSend } from "react-icons/fi";

const StatusBadge = ({ status }) => {

    const baseClass =
        "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium w-fit";

    switch (status) {
        case "Submitted":
            return (
                <span className={`${baseClass} bg-blue-500/10 text-blue-400`}>
                    <FiSend size={12} />
                    Submitted
                </span>
            );

        case "In Progress":
            return (
                <span className="relative flex items-center gap-1">
                    <span className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    In Progress
                </span>
            );

        case "Completed":
            return (
                <span className={`${baseClass} bg-green-500/10 text-green-400`}>
                    <FiCheckCircle size={12} />
                    Completed
                </span>
            );

        default:
            return (
                <span className={`${baseClass} bg-gray-500/10 text-gray-400`}>
                    {status}
                </span>
            );
    }
};

export default StatusBadge;