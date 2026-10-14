import AuditRow from "./AuditRow";

export default function AuditTable({ audits, onView }) {
    return (
        <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-700">
                <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Owner</th>
                    {/* <th className="py-3 px-4">Department</th> */}
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                </tr>
            </thead>

            <tbody>
                {audits.map((audit) => (
                    <AuditRow key={audit.id} audit={audit} onView={onView} />
                ))}
            </tbody>
        </table>
    );
}