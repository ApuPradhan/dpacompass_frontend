
import { Lock, Save, UserRound, Mail, Building2, BriefcaseBusiness, Phone } from "lucide-react";

export default function ProfileInformation({
    profile,
    onChange,
    onSubmit,
    saving,
}) {
    // ================= INPUT STYLES =================

    const inputClass =
        "w-full px-4 py-3 rounded-xl border border-slate-200 " +
        "bg-white text-slate-800 placeholder-slate-400 " +
        "outline-none transition-all " +
        "focus:border-blue-400 focus:ring-2 focus:ring-blue-100 " +
        "disabled:bg-slate-50 disabled:text-slate-400";

    const readOnlyClass =
        "w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 " +
        "bg-slate-50 text-slate-500 cursor-not-allowed outline-none";

    const labelClass =
        "block text-sm font-semibold text-slate-700 mb-2";

    // ================= EDITABLE FIELDS =================

    const editableFields = [
        {
            name: "first_name",
            label: "First Name",
            required: true,
            icon: UserRound,
        },
        {
            name: "last_name",
            label: "Last Name",
            required: true,
            icon: UserRound,
        },
        {
            name: "email",
            label: "Email Address",
            type: "email",
            required: true,
            icon: Mail,
        },
        {
            name: "organization",
            label: "Organization Name",
            required: true,
            icon: Building2,
        },
        {
            name: "designation",
            label: "Designation",
            icon: BriefcaseBusiness,
        },
        {
            name: "phone",
            label: "Phone Number",
            type: "tel",
            icon: Phone,
        },
    ];

    // ================= READ-ONLY FIELDS =================

    const readOnlyFields = [
        {
            name: "username",
            label: "Username",
            description: "Username cannot be changed.",
        },
        {
            name: "role",
            label: "Assigned Role",
            description: "Role is managed by the administrator.",
        },
        {
            name: "status",
            label: "Account Status",
            description: "Account status is managed by the administrator.",
        },
    ];

    // ================= MAIN UI =================

    return (
        <form onSubmit={onSubmit}>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-7">

                {/* ================= SECTION HEADER ================= */}

                <div className="flex items-center gap-3 mb-7 pb-5 border-b border-slate-100">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <UserRound className="w-6 h-6 text-[#075EB5]" />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-[#173B70]">
                            Personal Information
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Update your personal and organization details.
                        </p>
                    </div>
                </div>

                {/* ================= EDITABLE INFORMATION ================= */}

                <div>
                    <div className="flex items-center gap-2 mb-5">
                        <h3 className="text-sm font-bold text-slate-700">
                            Personal Details
                        </h3>

                        <span className="text-xs text-slate-400">
                            (Fields marked with * are required)
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">

                        {editableFields.map((field) => {
                            const Icon = field.icon;

                            return (
                                <div key={field.name}>

                                    <label
                                        htmlFor={field.name}
                                        className={labelClass}
                                    >
                                        {field.label}

                                        {field.required && (
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        )}
                                    </label>

                                    <div className="relative">
                                        <input
                                            id={field.name}
                                            type={field.type || "text"}
                                            name={field.name}
                                            value={profile[field.name] || ""}
                                            onChange={onChange}
                                            required={field.required || false}
                                            disabled={saving}
                                            placeholder={`Enter ${field.label.toLowerCase()}`}
                                            className={`${inputClass} pr-11`}
                                        />

                                        <Icon
                                            size={17}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ================= ACCOUNT INFORMATION ================= */}

                <div className="mt-9 pt-7 border-t border-slate-100">

                    <div className="flex items-center gap-2 mb-5">
                        <Lock className="text-slate-500" size={18} />

                        <h3 className="text-sm font-bold text-slate-700">
                            Account Information
                        </h3>

                        <span className="text-xs text-slate-400">
                            (Read only)
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">

                        {readOnlyFields.map((field) => (
                            <div key={field.name}>

                                <label
                                    htmlFor={`readonly-${field.name}`}
                                    className={labelClass}
                                >
                                    {field.label}
                                </label>

                                <div className="relative">
                                    <input
                                        id={`readonly-${field.name}`}
                                        value={profile[field.name] || ""}
                                        disabled
                                        readOnly
                                        className={readOnlyClass}
                                    />

                                    <Lock
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                                    />
                                </div>

                                <p className="text-xs text-slate-500 mt-2">
                                    {field.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= FORM ACTION ================= */}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-9 pt-6 border-t border-slate-100">

                    <p className="text-xs text-slate-500">
                        Make sure your information is accurate before saving.
                    </p>

                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#075EB5] text-white text-sm font-semibold hover:bg-[#064D94] shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={17} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>

            </div>
        </form>
    );
}
