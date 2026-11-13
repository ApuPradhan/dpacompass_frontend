import { useNavigate } from "react-router-dom";
import {
    FiArrowLeft,
    FiCheckCircle,
    FiClock,
    FiShield,
} from "react-icons/fi";
import dpacompassBg from "../assets/background_landingpage.jpeg";

export default function PendingApproval() {
    const navigate = useNavigate();

    return (
        <main
            className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eaf7ff] bg-cover bg-center bg-no-repeat px-4 py-10"
            style={{ backgroundImage: `url(${dpacompassBg})` }}
        >
            <style>{`
                @keyframes approvalCardEnter {
                    0% {
                        opacity: 0;
                        transform: translateY(28px) scale(0.97);
                        filter: blur(5px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                        filter: blur(0);
                    }
                }

                @keyframes approvalIconEnter {
                    0% {
                        opacity: 0;
                        transform: scale(0.55) rotate(-18deg);
                    }
                    70% {
                        opacity: 1;
                        transform: scale(1.08) rotate(4deg);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) rotate(0);
                    }
                }

                @keyframes approvalPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.18); }
                    50% { box-shadow: 0 0 0 12px rgba(14, 165, 233, 0); }
                }

                @keyframes approvalProgress {
                    0% { transform: scaleX(0); }
                    100% { transform: scaleX(1); }
                }

                .approval-card-enter {
                    animation: approvalCardEnter 650ms cubic-bezier(.2,.8,.2,1) both;
                }

                .approval-icon-enter {
                    animation:
                        approvalIconEnter 650ms cubic-bezier(.2,.8,.2,1) 180ms both,
                        approvalPulse 2.4s ease-in-out 900ms infinite;
                }

                .approval-progress {
                    transform-origin: left;
                    animation: approvalProgress 900ms ease-out 500ms both;
                }

                @media (prefers-reduced-motion: reduce) {
                    .approval-card-enter,
                    .approval-icon-enter,
                    .approval-progress {
                        animation: none !important;
                    }
                }
            `}</style>

            <div className="absolute inset-0 bg-white/35" aria-hidden="true" />
            <div
                className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl"
                aria-hidden="true"
            />

            <section className="approval-card-enter relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-white/90 bg-white/95 px-6 py-9 text-center shadow-[0_24px_80px_rgba(15,70,110,0.16)] backdrop-blur-xl sm:px-10 sm:py-11">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-sky-400 via-blue-600 to-cyan-400" />

                <div className="approval-icon-enter mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100 text-sky-700 ring-1 ring-sky-100">
                    <FiClock size={37} strokeWidth={1.7} />
                </div>

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                    DPACOMPASS · Account Registration
                </p>

                <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Registration Successful
                </h1>

                <p className="mt-2 text-lg font-semibold text-sky-700">
                    Awaiting Administrator Approval
                </p>

                <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-slate-600 sm:text-base">
                    Your email has been verified and your registration has been submitted
                    successfully. Your account is now waiting for review by the administrator.
                </p>

                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/90 p-4 text-left sm:p-5">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                            <FiCheckCircle size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-800">
                                Email verification completed
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Your email address has been successfully verified.
                            </p>
                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-100">
                                <div className="approval-progress h-full w-full rounded-full bg-emerald-500" />
                            </div>
                        </div>
                    </div>

                    <div className="my-5 border-t border-slate-200" />

                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                            <FiShield size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-slate-800">
                                    Administrator review
                                </p>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                                    Pending
                                </span>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Your account will be activated once an administrator reviews
                                and approves your registration.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3">
                    <p className="text-xs leading-5 text-slate-600">
                        You will be notified when your account has been reviewed. Please sign in
                        only after receiving the approval confirmation.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/signin")}
                    className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-700/15 transition duration-200 hover:-translate-y-0.5 hover:from-sky-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                >
                    <FiArrowLeft size={17} />
                    Back to Login
                </button>

                <div className="mt-7 border-t border-slate-200 pt-5 text-xs text-slate-400">
                    Data Privacy · Security · Compliance
                </div>
            </section>
        </main>
    );
}
