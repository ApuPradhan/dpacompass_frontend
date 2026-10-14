import DynamicAuditRow from "./DynamicAuditRow";

export default function DynamicAuditTable({ audits, columns, onView, customActions, expandableContent }) {

    return (
        <table className="w-full text-sm text-left">

            {/* Header */}
            <thead className="text-gray-400 border-b border-gray-700">
                <tr>
                    {columns.map((col) => (
                        <th key={col.key} className="py-3 px-4">
                            {col.label}
                        </th>
                    ))}
                    <th className="py-3 px-4 text-center">Actions</th>
                </tr>
            </thead>

            {/* Body */}
            <tbody>
                {audits.map((audit) => (
                    <DynamicAuditRow
                        key={audit.id || audit.audit_id}
                        audit={audit}
                        columns={columns}
                        onView={onView}
                        customActions={customActions}
                        expandableContent={expandableContent}
                    />
                ))}
            </tbody>

        </table>
    );
}