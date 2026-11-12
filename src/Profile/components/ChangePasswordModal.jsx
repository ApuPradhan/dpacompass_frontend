
import { useState } from "react";
import { Eye, EyeOff, X, KeyRound } from "lucide-react";
import { validatePasswordChange } from "../utils/profileValidation";

export default function ChangePasswordModal({
    open,
    onClose,
    onSubmit,
    saving,
}) {
    const initialPasswords = {
        old_password: "",
        new_password: "",
        confirm_password: "",
    };

    const [passwords, setPasswords] = useState(initialPasswords);
    const [showPasswords, setShowPasswords] = useState({});
    const [error, setError] = useState("");

    if (!open) return null;

    const fields = [
        { name: "old_password", label: "Current Password" },
        { name: "new_password", label: "New Password" },
        { name: "confirm_password", label: "Confirm New Password" },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;

        setPasswords((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    const handleClose = () => {
        if (saving) return;

        setPasswords(initialPasswords);
        setShowPasswords({});
        setError("");
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validation = validatePasswordChange(passwords);

        if (!validation.valid) {
            setError(validation.message);
            return;
        }

        setError("");

        try {
            await onSubmit(passwords);

            setPasswords(initialPasswords);
            setShowPasswords({});
        } catch (err) {
            setError(err.message || "Unable to change password.");
        }
    };

    const toggleVisibility = (name) => {
        setShowPasswords((prev) => ({
            ...prev,
            [name]: !prev[name],
        }));
    };

    const inputClass =
        "w-full px-4 py-2.5 pr-11 rounded-lg border border-slate-700 " +
        "bg-[#0B1220] text-slate-100 placeholder-slate-500 " +
        "outline-none focus:border-indigo-500 " +
        "focus:ring-2 focus:ring-indigo-500/20";

    return (
        <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm
                       flex items-center justify-center p-4"
            onClick={handleClose}
        >

            <div
                className="bg-[#111827] border border-slate-700
                           rounded-xl shadow-2xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="flex items-center justify-between mb-6">

                    <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10
                                        flex items-center justify-center">
                            <KeyRound className="text-indigo-400" size={20} />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Change Password
                            </h2>

                            <p className="text-xs text-slate-400 mt-1">
                                Verify your existing password first.
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={saving}
                        className="text-slate-400 hover:text-white
                                   transition disabled:opacity-50"
                    >
                        <X size={21} />
                    </button>

                </div>

                <form onSubmit={handleSubmit}>

                    <div className="space-y-4">

                        {fields.map((field) => (
                            <div key={field.name}>

                                <label className="block text-sm font-medium
                                                  text-slate-400 mb-1.5">
                                    {field.label} *
                                </label>

                                <div className="relative">

                                    <input
                                        type={
                                            showPasswords[field.name]
                                                ? "text"
                                                : "password"
                                        }
                                        name={field.name}
                                        value={passwords[field.name]}
                                        onChange={handleChange}
                                        required
                                        autoComplete="off"
                                        disabled={saving}
                                        className={inputClass}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleVisibility(field.name)
                                        }
                                        className="absolute right-3 top-3
                                                   text-slate-500
                                                   hover:text-indigo-400"
                                    >
                                        {showPasswords[field.name]
                                            ? <EyeOff size={18} />
                                            : <Eye size={18} />
                                        }
                                    </button>

                                </div>

                            </div>
                        ))}

                    </div>

                    {/* Password Requirements */}
                    <div className="mt-5 p-4 bg-[#0B1220]
                                    border border-slate-700/70 rounded-lg">

                        <p className="text-xs font-semibold
                                      text-slate-300 mb-2">
                            Password requirements
                        </p>

                        <ul className="text-xs text-slate-400 space-y-1.5">
                            <li>• Minimum 8 characters</li>
                            <li>• At least one uppercase letter</li>
                            <li>• At least one lowercase letter</li>
                            <li>• At least one number</li>
                            <li>• At least one special character</li>
                        </ul>

                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10
                                        border border-red-500/30
                                        text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6">

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={saving}
                            className="px-4 py-2 rounded-lg
                                       bg-slate-700 text-slate-200
                                       hover:bg-slate-600 transition"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 rounded-lg
                                       bg-indigo-600 text-white
                                       hover:bg-indigo-500 transition
                                       disabled:opacity-50"
                        >
                            {saving ? "Updating..." : "Update Password"}
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
}
