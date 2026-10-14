import AuditRow from "./AuditRow";

export default function AuditTable({ audits, onView, onStart }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-gray-400 border-b border-gray-700">
          <tr>
            <th className="px-4 py-3">SL No</th>
            <th className="px-4 py-3">Application</th>
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {audits.map((audit, index) => (
            <AuditRow
              key={audit.id}
              index={index}
              audit={audit}
              onView={onView}
              onStart={onStart}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}