import {
    FiEdit2,
    FiPower,
    FiTag,
} from "react-icons/fi";

const MATCH_LABELS = {
    contains: "Contains",
    exact: "Exact Match",
    token_phrase: "Token Phrase",
    regex: "Regular Expression",
};

const KeywordTable = ({
    keywords,
    onEdit,
    onToggleStatus,
    processingId,
}) => {
    if (!keywords.length) {
        return (
            <div className="py-16 text-center border border-dashed border-slate-700 rounded-xl">
                <FiTag className="mx-auto text-3xl text-slate-600 mb-3" />
                <h3 className="text-base font-semibold text-slate-300">
                    No keywords found
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                    Add a keyword or change your search/filter.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full min-w-187.5 text-sm">
                <thead className="bg-slate-950">
                    <tr className="text-left text-slate-400">
                        <th className="px-5 py-4 font-semibold">Keyword</th>
                        <th className="px-5 py-4 font-semibold">Match Type</th>
                        <th className="px-5 py-4 font-semibold">Priority</th>
                        <th className="px-5 py-4 font-semibold">Status</th>
                        <th className="px-5 py-4 font-semibold text-right">Actions</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                    {keywords.map((item) => (
                        <tr
                            key={item.id}
                            className="hover:bg-slate-800/40 transition"
                        >
                            <td className="px-5 py-4">
                                <span className="font-medium text-slate-200 break-all">
                                    {item.keyword}
                                </span>
                            </td>

                            <td className="px-5 py-4">
                                <span className="inline-flex px-3 py-1.5 rounded-md bg-slate-800 text-indigo-300 text-xs">
                                    {MATCH_LABELS[item.match_type] || item.match_type}
                                </span>
                            </td>

                            <td className="px-5 py-4 text-slate-300">
                                {item.priority}
                            </td>

                            <td className="px-5 py-4">
                                <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                                    item.is_active
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "bg-slate-700 text-slate-400"
                                }`}>
                                    {item.is_active ? "Active" : "Inactive"}
                                </span>
                            </td>

                            <td className="px-5 py-4">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(item)}
                                        title="Edit keyword"
                                        className="p-2.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition"
                                    >
                                        <FiEdit2 size={17} />
                                    </button>

                                    <button
                                        onClick={() => onToggleStatus(item)}
                                        disabled={processingId === item.id}
                                        title={item.is_active ? "Deactivate" : "Activate"}
                                        className={`p-2.5 rounded-lg transition disabled:opacity-50 ${
                                            item.is_active
                                                ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                                : "text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                                        }`}
                                    >
                                        <FiPower size={17} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default KeywordTable;