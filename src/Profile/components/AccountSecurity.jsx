
import { ShieldCheck, KeyRound, ChevronRight } from "lucide-react";

export default function AccountSecurity({ onChangePassword }) {
    return (
        <div className="bg-[#111827] rounded-xl border border-slate-700/80 p-6">

            <div className="flex items-center gap-2 mb-5">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />

                <h2 className="font-semibold text-white">
                    Account Security
                </h2>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">

                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-indigo-500/10
                                    flex items-center justify-center">
                        <KeyRound className="text-indigo-400" size={20} />
                    </div>

                    <div>
                        <h3 className="font-medium text-slate-200">
                            Change Password
                        </h3>

                        <p className="text-sm text-slate-400 mt-1">
                            Update your password to keep your account secure.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onChangePassword}
                    className="flex items-center gap-2 px-4 py-2.5
                               border border-indigo-500/50 text-indigo-400
                               rounded-lg hover:bg-indigo-500/10
                               hover:border-indigo-400 transition"
                >
                    Change Password
                    <ChevronRight size={17} />
                </button>

            </div>
        </div>
    );
}
