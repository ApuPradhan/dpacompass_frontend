
import { MessageSquareText } from "lucide-react";

export default function AuditorComments({
    value = "",
    onChange,
    placeholder = "Enter your observations, findings and recommendations...",
    disabled = false,
    maxLength = 2000,
    label = "Auditor Comments",
}) {

    return (
        <div>

            <div className="flex items-center gap-2 mb-2">

                <MessageSquareText
                    size={16}
                    className="text-indigo-400"
                />

                <label className="text-sm font-medium text-slate-300">
                    {label}
                </label>

            </div>

            <textarea
                rows={4}
                value={value}
                maxLength={maxLength}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[#0B1220] border border-slate-700
                           rounded-lg p-3 text-sm text-slate-200
                           placeholder:text-slate-600 resize-y
                           outline-none transition
                           focus:border-indigo-500
                           focus:ring-2 focus:ring-indigo-500/20
                           disabled:opacity-50"
            />

            <div className="flex justify-end mt-1">

                <span className="text-xs text-slate-500">
                    {value.length}/{maxLength} characters
                </span>

            </div>

        </div>
    );
}
