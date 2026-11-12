
import { UserRound, ShieldCheck } from "lucide-react";

export default function ProfileHeader({ profile }) {
    const fullName = [
        profile.first_name,
        profile.last_name,
    ].filter(Boolean).join(" ");

    return (
        <div className="bg-[#111827] rounded-xl border border-slate-700/80 p-6">

            <div className="flex flex-wrap items-center gap-4">

                <div className="w-16 h-16 rounded-full bg-indigo-500/20
                                border border-indigo-500/30
                                flex items-center justify-center">
                    <UserRound className="w-8 h-8 text-indigo-400" />
                </div>

                <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-white">
                        {fullName || "User"}
                    </h2>

                    <p className="text-sm text-slate-400 mt-0.5">
                        {profile.email}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">

                        <span className="px-3 py-1 text-xs rounded-full
                                         bg-indigo-500/10 text-indigo-400
                                         border border-indigo-500/20">
                            {profile.role}
                        </span>

                        <span className={`px-3 py-1 text-xs rounded-full
                            ${profile.status?.toLowerCase() === "approved"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                            }`}>
                            <span className="inline-flex items-center gap-1.5">
                                <ShieldCheck size={13} />
                                {profile.status}
                            </span>
                        </span>

                    </div>
                </div>

            </div>
        </div>
    );
}
