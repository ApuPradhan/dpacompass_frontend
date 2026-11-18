
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ShieldAlert,
    LockKeyhole,
    ArrowRight,
    ShieldCheck,
} from "lucide-react";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const navigate = useNavigate();

    const token = localStorage.getItem("access");
    const user = JSON.parse(localStorage.getItem("user"));

    const isUnauthorized =
        allowedRoles.length > 0 && !allowedRoles.includes(user?.role);

    useEffect(() => {
        if (isUnauthorized) {
            const timer = setTimeout(() => {
                navigate("/signin");
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isUnauthorized, navigate]);

    if (isUnauthorized) {
        return (
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F4F7FB] px-4 py-10">

                {/* BACKGROUND DECORATIONS */}
                <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-40 -right-32 h-[30rem] w-[30rem] rounded-full bg-indigo-200/30 blur-3xl" />

                <div className="pointer-events-none absolute inset-0 opacity-[0.25]"
                    style={{
                        backgroundImage:
                            "radial-gradient(#94A3B8 0.8px, transparent 0.8px)",
                        backgroundSize: "24px 24px",
                    }}
                />

                {/* MAIN CARD */}
                <div
                    className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white bg-white/90 shadow-[0_25px_80px_-20px_rgba(30,64,175,0.18)] backdrop-blur-xl"
                    style={{
                        animation: "accessCardEnter 650ms cubic-bezier(.2,.8,.2,1) both",
                    }}
                >

                    {/* TOP GRADIENT */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400" />

                    <div className="px-7 py-10 text-center sm:px-10">

                        {/* ILLUSTRATION */}
                        <div className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center">

                            <div className="absolute inset-0 animate-pulse rounded-full bg-blue-100/70" />

                            <div className="absolute inset-3 rounded-full border border-blue-200/70" />

                            <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-300/50"
                                style={{
                                    animation: "shieldFloat 3s ease-in-out infinite",
                                }}
                            >
                                <ShieldAlert size={46} strokeWidth={1.5} />
                            </div>

                            {/* LOCK BADGE */}
                            <div className="absolute -right-1 bottom-1 flex h-11 w-11 items-center justify-center rounded-2xl border-4 border-white bg-red-50 text-red-500 shadow-md">
                                <LockKeyhole size={19} />
                            </div>

                            {/* DECORATIVE DOTS */}
                            <span className="absolute -right-3 top-5 h-3 w-3 rounded-full bg-sky-400" />
                            <span className="absolute -left-2 bottom-7 h-2.5 w-2.5 rounded-full bg-indigo-400" />
                        </div>

                        {/* STATUS LABEL */}
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3.5 py-1.5">
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-red-600">
                                Restricted Access
                            </span>
                        </div>

                        {/* HEADING */}
                        <h1 className="text-2xl font-bold tracking-tight text-[#14213D] sm:text-3xl">
                            Access Denied
                        </h1>

                        <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-slate-500">
                            You don't have the required permissions to view
                            this page. Your account access is protected by
                            the DPACOMPASS security system.
                        </p>

                        {/* INFORMATION PANEL */}
                        <div className="mt-7 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 p-4 text-left">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#075EB5] shadow-sm">
                                    <ShieldCheck size={21} />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-[#173B70]">
                                        Security protection active
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        This resource is restricted to
                                        authorized user roles.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* REDIRECT PROGRESS */}
                        <div className="mt-8">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-500">
                                    Redirecting to sign in
                                </span>

                                <span className="text-xs font-semibold text-[#075EB5]">
                                    Please wait
                                </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500"
                                    style={{
                                        animation: "redirectProgress 3s linear forwards",
                                    }}
                                />
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-5">
                            <span className="text-xs font-bold tracking-wide text-[#075EB5]">
                                DPACOMPASS
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="text-xs text-slate-400">
                                Data Privacy · Security · Compliance
                            </span>
                        </div>
                    </div>
                </div>

                {/* ANIMATIONS */}
                <style>
                    {`
                        @keyframes accessCardEnter {
                            from {
                                opacity: 0;
                                transform: translateY(24px) scale(0.97);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0) scale(1);
                            }
                        }

                        @keyframes shieldFloat {
                            0%, 100% {
                                transform: translateY(0);
                            }
                            50% {
                                transform: translateY(-6px);
                            }
                        }

                        @keyframes redirectProgress {
                            from { width: 0%; }
                            to { width: 100%; }
                        }
                    `}
                </style>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
