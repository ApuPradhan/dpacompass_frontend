
import { useNavigate } from "react-router-dom";
import {
    FiArrowLeft,
    FiCheckCircle,
    FiClock,
    FiShield,
    FiMail,
    FiCheck,
    FiArrowRight,
} from "react-icons/fi";
import dpacompassBg from "../assets/background_landingpage.jpeg";

export default function PendingApproval() {
    const navigate = useNavigate();

    return (
        <main className="pending-approval-page relative flex min-h-screen items-center justify-center overflow-x-hidden bg-[#F4F7FB] px-4 py-4 sm:px-6">

            <style>{`
                @keyframes cardEnter {
                    0% {
                        opacity: 0;
                        transform: translateY(25px) scale(0.98);
                        filter: blur(5px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                        filter: blur(0);
                    }
                }

                @keyframes iconEnter {
                    0% {
                        opacity: 0;
                        transform: scale(0.5) rotate(-15deg);
                    }
                    70% {
                        opacity: 1;
                        transform: scale(1.08) rotate(5deg);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) rotate(0);
                    }
                }

                @keyframes softPulse {
                    0%, 100% {
                        box-shadow: 0 0 0 0 rgba(7, 94, 181, 0.12);
                    }
                    50% {
                        box-shadow: 0 0 0 10px rgba(7, 94, 181, 0);
                    }
                }

                @keyframes pendingPulse {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.4;
                        transform: scale(0.8);
                    }
                }

                @keyframes contentEnter {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes backgroundFloat {
                    0%, 100% {
                        transform: translate(0, 0);
                    }
                    50% {
                        transform: translate(15px, -15px);
                    }
                }

                .approval-card-enter {
                    animation: cardEnter 650ms cubic-bezier(.2,.8,.2,1) both;
                }

                .approval-icon-enter {
                    animation:
                        iconEnter 650ms cubic-bezier(.2,.8,.2,1) 150ms both,
                        softPulse 2.8s ease-in-out 1s infinite;
                }

                .approval-content-enter {
                    animation: contentEnter 550ms ease-out 250ms both;
                }

                .approval-background-float {
                    animation: backgroundFloat 9s ease-in-out infinite;
                }

                .approval-pending-dot {
                    animation: pendingPulse 1.8s ease-in-out infinite;
                }

                @media (max-height: 760px) and (min-width: 768px) {
                    .approval-main-content {
                        padding-top: 16px !important;
                        padding-bottom: 16px !important;
                    }

                    .approval-brand {
                        margin-bottom: 12px !important;
                    }

                    .approval-success-icon {
                        width: 54px !important;
                        height: 54px !important;
                        border-radius: 18px !important;
                    }

                    .approval-success-icon svg {
                        width: 30px !important;
                        height: 30px !important;
                    }

                    .approval-heading {
                        margin-top: 10px !important;
                    }

                    .approval-progress-card {
                        margin-top: 16px !important;
                    }

                    .approval-info {
                        margin-top: 12px !important;
                    }

                    .approval-login {
                        margin-top: 12px !important;
                    }

                    .approval-footer {
                        margin-top: 12px !important;
                        padding-top: 10px !important;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .approval-card-enter,
                    .approval-icon-enter,
                    .approval-content-enter,
                    .approval-background-float,
                    .approval-pending-dot {
                        animation: none !important;
                    }
                }
            `}</style>

            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-[0.055]"
                style={{ backgroundImage: `url(${dpacompassBg})` }}
                aria-hidden="true"
            />

            <div
                className="absolute inset-0 bg-gradient-to-br from-white/90 via-[#F4F7FB]/90 to-blue-50/80"
                aria-hidden="true"
            />

            {/* Decorative Elements */}
            <div
                className="approval-background-float pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-blue-200/30 blur-[90px]"
                aria-hidden="true"
            />

            <div
                className="approval-background-float pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-sky-200/40 blur-[100px]"
                aria-hidden="true"
            />

            {/* Main Card */}
            <section className="approval-card-enter relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-white bg-white shadow-[0_20px_70px_rgba(15,45,85,0.12)]">

                <div className="h-1.5 w-full bg-gradient-to-r from-[#075EB5] via-sky-400 to-cyan-400" />

                <div className="approval-main-content px-5 py-6 sm:px-9 sm:py-7 lg:px-11">

                    {/* Brand */}
                    <div className="approval-brand mb-4 flex items-center justify-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#075EB5] text-white shadow-md shadow-blue-900/15">
                            <FiShield size={21} />
                        </div>

                        <div>
                            <h2 className="text-lg font-extrabold tracking-tight text-[#14213D]">
                                DPACOMPASS
                            </h2>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Data Privacy Compliance
                            </p>
                        </div>
                    </div>

                    {/* Success Icon */}
                    <div className="approval-icon-enter approval-success-icon mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-[22px] border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-100 text-[#075EB5]">
                        <FiCheckCircle size={37} strokeWidth={1.6} />
                    </div>

                    {/* Heading */}
                    <div className="approval-content-enter approval-heading mt-3 text-center">
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
                            <FiCheck size={12} className="text-emerald-600" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                Registration Completed
                            </span>
                        </div>

                        <h1 className="text-2xl font-extrabold tracking-tight text-[#14213D] sm:text-[27px]">
                            Registration Successful
                        </h1>

                        <p className="mt-1 text-sm font-semibold text-[#075EB5] sm:text-base">
                            Awaiting Administrator Approval
                        </p>

                        <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                            Your email has been verified and your registration
                            has been submitted successfully. Your account is now
                            awaiting review by the administrator.
                        </p>
                    </div>

                    {/* Registration Progress */}
                    <div className="approval-content-enter approval-progress-card mt-5 rounded-2xl border border-slate-200 bg-[#F8FAFD] p-4 sm:p-5">

                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-[#14213D]">
                                    Registration Progress
                                </h3>
                                <p className="mt-0.5 text-[11px] text-slate-500">
                                    Track your account activation process
                                </p>
                            </div>

                            <span className="shrink-0 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-[#075EB5] sm:text-xs">
                                1 of 2 completed
                            </span>
                        </div>

                        {/* Two Progress Cards */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                            {/* Email Verification */}
                            <div className="rounded-xl border border-emerald-100 bg-white p-3.5 sm:p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                        <FiCheckCircle size={21} />
                                    </div>

                                    <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-[#14213D] sm:text-sm">
                                            Email Verification
                                        </h4>
                                        <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                                            Completed
                                        </span>
                                    </div>
                                </div>

                                <p className="mt-3 text-[11px] leading-5 text-slate-500">
                                    Your email address has been successfully verified.
                                </p>

                                <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold text-emerald-700 sm:text-xs">
                                    <FiMail size={13} />
                                    Email successfully verified
                                </div>
                            </div>

                            {/* Administrator Approval */}
                            <div className="rounded-xl border border-amber-100 bg-white p-3.5 sm:p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600">
                                        <FiClock size={20} />
                                    </div>

                                    <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-[#14213D] sm:text-sm">
                                            Administrator Approval
                                        </h4>

                                        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700">
                                            <span className="approval-pending-dot h-1.5 w-1.5 rounded-full bg-amber-500" />
                                            Pending
                                        </span>
                                    </div>
                                </div>

                                <p className="mt-3 text-[11px] leading-5 text-slate-500">
                                    Your registration is waiting for review.
                                    The administrator will approve your account
                                    after verification.
                                </p>

                                <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold text-amber-700 sm:text-xs">
                                    <FiShield size={13} />
                                    Account activation pending
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information Message */}
                    <div className="approval-content-enter approval-info mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[#075EB5]">
                            <FiMail size={15} />
                        </div>

                        <div>
                            <p className="text-xs font-bold text-[#173B70]">
                                What happens next?
                            </p>
                            <p className="mt-0.5 text-[11px] leading-5 text-slate-600">
                                You will be notified when your account has been reviewed.
                                Please sign in after receiving the approval confirmation.
                            </p>
                        </div>
                    </div>

                    {/* Back to Login */}
                    <div className="approval-content-enter approval-login mt-4">
                        <button
                            type="button"
                            onClick={() => navigate("/signin")}
                            className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#075EB5] px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#064D94] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#075EB5] focus:ring-offset-2 active:translate-y-0"
                        >
                            <FiArrowLeft
                                size={16}
                                className="transition-transform duration-300 group-hover:-translate-x-1"
                            />
                            Back to Login
                            <FiArrowRight
                                size={15}
                                className="ml-auto opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                            />
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="approval-content-enter approval-footer mt-4 border-t border-slate-100 pt-3 text-center">
                        <p className="text-[10px] font-semibold tracking-wide text-slate-400">
                            DATA PRIVACY
                            <span className="mx-2 text-blue-300">•</span>
                            SECURITY
                            <span className="mx-2 text-blue-300">•</span>
                            COMPLIANCE
                        </p>

                        <p className="mt-1 text-[9px] text-slate-300">
                            DPACOMPASS Platform
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
