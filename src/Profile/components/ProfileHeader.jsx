
import { UserRound, ShieldCheck, Mail } from "lucide-react";

export default function ProfileHeader({ profile }) {
    const fullName = [
        profile.first_name,
        profile.last_name,
    ].filter(Boolean).join(" ");

    const isApproved =
        profile.status?.toLowerCase() === "approved";

    return (
        <div className="w-full bg-white rounded-2xl border border-slate-200 px-6 py-6 md:px-8">

            <div className="flex flex-row items-center gap-6 lg:gap-8">

                {/* PROFILE AVATAR */}

                <div className="w-20 h-20 shrink-0 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <UserRound
                        className="w-10 h-10 text-[#075EB5]"
                        strokeWidth={1.8}
                    />
                </div>

                {/* NAME AND EMAIL */}

                <div className="flex-1 min-w-0">
                    <h2 className="text-xl md:text-2xl font-bold text-[#173B70] truncate">
                        {fullName || "User"}
                    </h2>

                    <div className="flex items-center gap-2 mt-2 text-slate-500">
                        <Mail size={17} className="shrink-0" />

                        <p className="text-sm md:text-base truncate">
                            {profile.email || "No email available"}
                        </p>
                    </div>
                </div>

                {/* ROLE */}

                {profile.role && (
                    <div className="shrink-0">
                        <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-50 text-[#075EB5] border border-blue-100 text-sm font-semibold whitespace-nowrap">
                            <ShieldCheck size={17} />
                            {profile.role}
                        </span>
                    </div>
                )}

                {/* ACCOUNT STATUS */}

                {profile.status && (
                    <div className="shrink-0">
                        <span
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold whitespace-nowrap ${
                                isApproved
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                        >
                            <ShieldCheck size={17} />

                            <span
                                className={`w-2 h-2 rounded-full ${
                                    isApproved
                                        ? "bg-emerald-500"
                                        : "bg-amber-500"
                                }`}
                            />

                            <span className="capitalize">
                                {profile.status}
                            </span>
                        </span>
                    </div>
                )}

            </div>
        </div>
    );
}
