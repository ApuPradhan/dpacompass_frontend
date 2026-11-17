
import { useEffect, useState } from "react";
import { FiLoader } from "react-icons/fi";

export default function Loader({
    text = "Loading...",
    delay = 300,
    fullScreen = false
}) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShow(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    if (!show) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className={`
                ${fullScreen
                    ? "fixed inset-0 z-[9999] w-screen h-screen bg-white/95 backdrop-blur-sm"
                    : "w-full bg-transparent"
                }
                flex flex-col items-center justify-center
                text-center px-4 py-8
            `}
        >

            {/* Modern Spinner */}
            <div className="relative flex items-center justify-center">

                {/* Soft blue glow */}
                <div className="
                    absolute h-16 w-16
                    rounded-full bg-blue-400/15
                    blur-xl animate-pulse
                " />

                {/* Outer rotating ring */}
                <div className="
                    h-12 w-12 rounded-full
                    border-[3px] border-blue-100
                    border-t-blue-600
                    animate-spin
                " />

                {/* Center indicator */}
                <div className="
                    absolute h-3 w-3
                    rounded-full bg-blue-600
                    shadow-md shadow-blue-300
                " />

            </div>

            {/* Loading Text */}
            <div className="mt-5 flex flex-col items-center gap-1.5">

                <p className="
                    text-base font-semibold
                    tracking-wide text-[#173B70]
                ">
                    {text}
                </p>

                <div className="flex items-center gap-1.5">
                    <span className="
                        h-1.5 w-1.5 rounded-full
                        bg-blue-600 animate-pulse
                    " />
                    <span className="
                        text-xs font-medium
                        text-slate-500
                    ">
                        Please wait...
                    </span>
                </div>

            </div>

            <span className="sr-only">{text}</span>

        </div>
    );
}
