import { useEffect, useState } from "react";
import { FiLoader } from "react-icons/fi";

export default function Loader({ text = "Loading...", delay = 300, fullScreen = false }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShow(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    if (!show) return null;

    return (
        <div
            className={`
                ${fullScreen ? "fixed top-0 left-0 w-screen h-screen z-9999" : ""}
                flex flex-col items-center justify-center
                bg-[#0b1120] text-center
            `}
        >

            {/* Spinner */}
            <div className="relative flex items-center justify-center">
                <div className="absolute w-12 h-12 rounded-full bg-indigo-500/20 blur-md"></div>
                <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            </div>

            {/* Text */}
            <div className="mt-4 flex items-center gap-2 text-gray-300 text-sm justify-center">
                <FiLoader className="animate-spin text-indigo-400" size={16} />
                <span>{text}</span>
            </div>

        </div>
    );
}