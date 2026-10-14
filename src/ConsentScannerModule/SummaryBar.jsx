const SummaryBar = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

      <div className="p-4 bg-[#111827] border border-gray-700 rounded-xl">
        <p className="text-xs text-gray-400">Total Pages Scanned</p>
        <p className="text-lg font-semibold text-white">
          {summary.total_pages}
        </p>
      </div>

      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
        <p className="text-xs text-gray-400">Compliant Fields</p>
        <p className="text-lg font-semibold text-green-400">
          {summary.compliant_pages}
        </p>
      </div>

      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
        <p className="text-xs text-gray-400">Partial Compliant Fields</p>
        <p className="text-lg font-semibold text-yellow-400">
          {summary.partial_pages}
        </p>
      </div>

      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <p className="text-xs text-gray-400">Non-Compliant Fields</p>
        <p className="text-lg font-semibold text-red-400">
          {summary.non_compliant_pages}
        </p>
      </div>

    </div>
  );
};

export default SummaryBar;