
import { useState } from "react";
import {
    Eye,
    EyeOff,
    X,
    KeyRound,
    LockKeyhole,
    ShieldCheck,
    CheckCircle2,
} from "lucide-react";

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

    // ================= INPUT CHANGE =================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setPasswords((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    // ================= CLOSE MODAL =================

    const handleClose = () => {
        if (saving) return;

        setPasswords(initialPasswords);
        setShowPasswords({});
        setError("");

        onClose();
    };

    // ================= SUBMIT PASSWORD =================

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

    // ================= PASSWORD VISIBILITY =================

    const toggleVisibility = (name) => {
        setShowPasswords((prev) => ({
            ...prev,
            [name]: !prev[name],
        }));
    };

    // ================= INPUT STYLES =================

    const inputClass =
        "w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 " +
        "bg-white text-slate-800 placeholder-slate-400 " +
        "outline-none transition-all " +
        "focus:border-blue-400 focus:ring-2 focus:ring-blue-100 " +
        "disabled:bg-slate-50 disabled:text-slate-400";

    // ================= MAIN UI =================

    return (
        <div
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleClose}
        >
            <div
                className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >

                {/* ================= HEADER ================= */}

                <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-slate-100 bg-white">

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            <KeyRound
                                className="text-[#075EB5]"
                                size={23}
                            />
                        </div>

                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-[#173B70]">
                                Change Password
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Update your account password securely.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={saving}
                        aria-label="Close password modal"
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X size={21} />
                    </button>
                </div>

                {/* ================= FORM ================= */}

                <form onSubmit={handleSubmit}>

                    <div className="p-6 md:p-7">

                        {/* PASSWORD FIELDS */}

                        <div className="space-y-5">

                            {fields.map((field, index) => (
                                <div key={field.name}>

                                    <label
                                        htmlFor={field.name}
                                        className="block text-sm font-semibold text-slate-700 mb-2"
                                    >
                                        {field.label}
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">

                                        <input
                                            id={field.name}
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
                                            placeholder={`Enter ${field.label.toLowerCase()}`}
                                            className={inputClass}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleVisibility(field.name)
                                            }
                                            disabled={saving}
                                            aria-label={
                                                showPasswords[field.name]
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#075EB5] transition cursor-pointer disabled:opacity-50"
                                        >
                                            {showPasswords[field.name] ? (
                                                <EyeOff size={19} />
                                            ) : (
                                                <Eye size={19} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}

                        </div>

                        {/* ================= PASSWORD REQUIREMENTS ================= */}

                        <div className="mt-6 p-5 bg-blue-50/60 border border-blue-100 rounded-xl">

                            <div className="flex items-center gap-2 mb-4">
                                <ShieldCheck
                                    size={19}
                                    className="text-[#075EB5]"
                                />

                                <h3 className="text-sm font-bold text-[#173B70]">
                                    Password Requirements
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                {[
                                    "Minimum 8 characters",
                                    "At least one uppercase letter",
                                    "At least one lowercase letter",
                                    "At least one number",
                                    "At least one special character",
                                ].map((requirement) => (
                                    <div
                                        key={requirement}
                                        className="flex items-start gap-2"
                                    >
                                        <CheckCircle2
                                            size={15}
                                            className="text-blue-600 mt-0.5 shrink-0"
                                        />

                                        <span className="text-xs text-slate-600 leading-relaxed">
                                            {requirement}
                                        </span>
                                    </div>
                                ))}

                            </div>
                        </div>

                        {/* ================= ERROR ================= */}

                        {error && (
                            <div
                                role="alert"
                                className="mt-5 flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl"
                            >
                                <ShieldCheck
                                    size={19}
                                    className="mt-0.5 shrink-0 text-red-600"
                                />

                                <p className="text-sm font-medium leading-relaxed">
                                    {error}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ================= FOOTER ACTIONS ================= */}

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 px-6 py-5 md:px-7 bg-slate-50 border-t border-slate-100">

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={saving}
                            className="px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-100 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#075EB5] text-white text-sm font-semibold hover:bg-[#064D94] shadow-sm transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <LockKeyhole size={17} />
                                    Update Password
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
