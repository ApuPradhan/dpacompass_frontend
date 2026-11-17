
import { ShieldCheck, KeyRound, ChevronRight, LockKeyhole } from "lucide-react";

export default function AccountSecurity({ onChangePassword }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-7">

            {/* HEADER */}

            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-[#075EB5]" />
                </div>

                <div>
                    <h2 className="text-lg font-bold text-[#173B70]">
                        Account Security
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                        Manage your password and account protection.
                    </p>
                </div>
            </div>

            {/* CHANGE PASSWORD ROW */}

            <div className="flex flex-row items-center justify-between gap-5 py-1">

                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 shrink-0 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <KeyRound className="text-[#075EB5]" size={25} />
                    </div>

                    <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-800">
                            Change Password
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                            Update your password regularly to keep your account secure.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onChangePassword}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 shrink-0 bg-white border border-blue-200 text-[#075EB5] text-sm font-semibold rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer"
                >
                    <LockKeyhole size={17} />
                    Change Password
                    <ChevronRight size={18} />
                </button>

            </div>
        </div>
    );
}
