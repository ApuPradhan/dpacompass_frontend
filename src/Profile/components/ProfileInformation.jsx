
import { Lock, Save, UserRound } from "lucide-react";

export default function ProfileInformation({
    profile,
    onChange,
    onSubmit,
    saving,
}) {
    const inputClass =
        "w-full px-4 py-2.5 rounded-lg border border-slate-700 " +
        "bg-[#0B1220] text-slate-100 placeholder-slate-500 " +
        "outline-none transition focus:border-indigo-500 " +
        "focus:ring-2 focus:ring-indigo-500/20";

    const readOnlyClass =
        "w-full px-4 py-2.5 rounded-lg border border-slate-700/70 " +
        "bg-slate-800/60 text-slate-400 cursor-not-allowed";

    const labelClass =
        "block text-sm font-medium text-slate-400 mb-1.5";

    const editableFields = [
        { name: "first_name", label: "First Name", required: true },
        { name: "last_name", label: "Last Name", required: true },
        { name: "email", label: "Email Address", type: "email", required: true },
        { name: "organization", label: "Organization Name", required: true },
        { name: "designation", label: "Designation" },
        { name: "phone", label: "Phone Number", type: "tel" },
    ];

    const readOnlyFields = [
        { name: "username", label: "Username" },
        { name: "role", label: "Assigned Role" },
        { name: "status", label: "Account Status" },
    ];

    return (
        <form onSubmit={onSubmit}>

            <div className="bg-[#111827] rounded-xl border border-slate-700/80 p-6">

                <div className="flex items-center gap-2 mb-6">
                    <UserRound className="w-5 h-5 text-indigo-400" />

                    <h2 className="font-semibold text-white">
                        Personal Information
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {editableFields.map((field) => (
                        <div key={field.name}>
                            <label className={labelClass}>
                                {field.label}
                                {field.required && " *"}
                            </label>

                            <input
                                type={field.type || "text"}
                                name={field.name}
                                value={profile[field.name] || ""}
                                onChange={onChange}
                                required={field.required || false}
                                className={inputClass}
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                            />
                        </div>
                    ))}

                    {readOnlyFields.map((field) => (
                        <div key={field.name}>

                            <label className={labelClass}>
                                {field.label}
                            </label>

                            <div className="relative">
                                <input
                                    value={profile[field.name] || ""}
                                    disabled
                                    readOnly
                                    className={readOnlyClass}
                                />

                                <Lock className="absolute right-3 top-3
                                                 w-4 h-4 text-slate-500" />
                            </div>

                            {field.name === "username" && (
                                <p className="text-xs text-slate-500 mt-1">
                                    Username cannot be changed.
                                </p>
                            )}

                            {field.name === "role" && (
                                <p className="text-xs text-slate-500 mt-1">
                                    Role is managed by the administrator.
                                </p>
                            )}

                        </div>
                    ))}

                </div>

                <div className="flex justify-end mt-7">

                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5
                                   bg-indigo-600 text-white rounded-lg
                                   hover:bg-indigo-500 transition
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={17} />
                        {saving ? "Saving..." : "Save Changes"}
                    </button>

                </div>

            </div>
        </form>
    );
}
