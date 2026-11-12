import { FiCheck, FiX, FiAlertCircle } from "react-icons/fi";

const MATCH_TYPES = [
    { value: "contains", label: "Contains" },
    { value: "exact", label: "Exact Match" },
    { value: "token_phrase", label: "Token Phrase" },
    { value: "regex", label: "Regular Expression" },
];

const KeywordForm = ({
    form,
    onChange,
    onSubmit,
    onCancel,
    saving,
    editing,
    error,
}) => {
    return (
        <form
            onSubmit={onSubmit}
            className="mb-6 p-5 md:p-6 rounded-xl border border-indigo-500/30 bg-indigo-500/4"
        >
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-lg font-semibold text-slate-100">
                        {editing ? "Edit Keyword" : "Add New Keyword"}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Configure the keyword and its matching behaviour.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                    <FiX size={19} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                <div className="lg:col-span-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Keyword <span className="text-red-400">*</span>
                    </label>

                    <textarea
                        name="keyword"
                        value={form.keyword}
                        onChange={onChange}
                        required
                        rows={2}
                        placeholder="Enter keyword or regular expression"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-500 resize-y"
                    />
                </div>

                <div className="lg:col-span-3">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Match Type
                    </label>

                    <select
                        name="match_type"
                        value={form.match_type}
                        onChange={onChange}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    >
                        {MATCH_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="lg:col-span-3">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Priority
                    </label>

                    <input
                        type="number"
                        name="priority"
                        min="0"
                        required
                        value={form.priority}
                        onChange={onChange}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    />
                </div>
            </div>

            {form.match_type === "regex" && (
                <p className="text-xs text-amber-400 mt-3">
                    Enter a valid Python-compatible regular expression.
                    The backend will validate the expression.
                </p>
            )}

            {error && (
                <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                    <FiAlertCircle />
                    {error}
                </div>
            )}

            <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-800">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50"
                >
                    <FiCheck />
                    {saving ? "Saving..." : editing ? "Update Keyword" : "Save Keyword"}
                </button>
            </div>
        </form>
    );
};

export default KeywordForm;